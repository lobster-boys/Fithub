from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model
from .models import UserProfile, SocialAccount
import logging
import datetime

logger = logging.getLogger(__name__)
User = get_user_model()

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    커스텀 소셜 어댑터
    소셜 로그인시, User 모델에는 email만 반영하고, 닉네임, 프로필 이미지, 성별 등은 UserProfile 모델에 저장합니다.
    """

    def populate_user(self, request, sociallogin, data):
        """
        User 모델의 기본 정보 설정:
        email만 User 객체에 저장하고, 나머지 정보는 _create_user_profile()에서 처리합니다.
        """
        user = super().populate_user(request, sociallogin, data)
        provider = sociallogin.account.provider

        try:
            if provider == "kakao":
                kakao_data = sociallogin.account.extra_data
                kakao_account = kakao_data.get("kakao_account", {})

                # 이메일만 User 모델에 반영
                if kakao_account.get("email"):
                    user.email = kakao_account.get("email")

            elif provider == "naver":
                naver_data = sociallogin.account.extra_data
                response = naver_data.get("response", {})

                # 이메일만 User 모델에 반영
                if response.get("email"):
                    user.email = response.get("email")
        except Exception as e:
            logger.error(f"{provider} 사용자 정보 설정 중 오류: {e}")

        return user

    def save_user(self, request, sociallogin, form=None):
        """
        User 저장 후 추가 처리:
        생성된 사용자에 대해 UserProfile을 생성하고, 각 소셜 provider에 따른 추가 정보를 UserProfile에 저장합니다.
        또한, SocialAccount 정보를 개별 저장합니다.
        """
        user = super().save_user(request, sociallogin, form)
        provider = sociallogin.account.provider

        try:
            self._create_user_profile(user, sociallogin)
            self._create_social_account(user, sociallogin)
            self._initialize_user_data(user)
        except Exception as e:
            logger.error(f"{provider} 소셜 계정 저장 중 오류: {e}")

        return user

    def _create_user_profile(self, user, sociallogin):
        """
        UserProfile 생성 및 추가 정보 설정 (provider에 따라 분기):
        - Kakao: kakao_account의 profile에서 nickname, gender, profile_image_url과 생년월일 데이터를 가져옴.
        - Naver: response에서 name, gender, profile_image, 그리고 생년(birthyear) 및 birthday 데이터를 처리함.
        """
        provider = sociallogin.account.provider
        extra_data = sociallogin.account.extra_data

        profile_obj, created = UserProfile.objects.get_or_create(user=user, defaults={})

        if provider == "kakao":
            kakao_data = extra_data.get("kakao_account", {})
            profile = kakao_data.get("profile", {})

            if profile.get("nickname") and not profile_obj.name:
                profile_obj.name = profile.get("nickname")

            kakao_gender = kakao_data.get("gender")
            if kakao_gender and not profile_obj.gender:
                if kakao_gender.lower() == "male":
                    profile_obj.gender = "m"
                elif kakao_gender.lower() == "female":
                    profile_obj.gender = "f"
                else:
                    profile_obj.gender = "o"

            if profile.get("profile_image_url") and not profile_obj.profile_image:
                profile_obj.profile_image = profile.get("profile_image_url")

            # 카카오의 생년월일 처리: 키 이름이 'birthyear'와 'birthday'라고 가정
            birthyear = kakao_data.get('birthyear')
            birthday = kakao_data.get('birthday')
            if birthyear and birthday:
                try:
                    # birthday가 "mmdd" 형식일 경우 "mm-dd"로 변경
                    if len(birthday) == 4:
                        birthday = birthday[:2] + "-" + birthday[2:]
                    full_birth_date = f"{birthyear}-{birthday}"  # yyyy-mm-dd
                    birth_date = datetime.datetime.strptime(full_birth_date, "%Y-%m-%d").date()
                    profile_obj.birth_date = birth_date
                except Exception as e:
                    logger.error(f"카카오 생년월일 변환 오류: {e}")

        elif provider == "naver":
            response = extra_data.get("response", {})

            if response.get("name") and not profile_obj.name:
                profile_obj.name = response.get("name")

            naver_gender = response.get("gender")
            if naver_gender and not profile_obj.gender:
                if naver_gender.upper() == "M":
                    profile_obj.gender = "m"
                elif naver_gender.upper() == "F":
                    profile_obj.gender = "f"
                else:
                    profile_obj.gender = "o"

            if response.get("profile_image") and not profile_obj.profile_image:
                profile_obj.profile_image = response.get("profile_image")

            # 네이버의 생년월일 처리:
            birthyear = response.get('birthyear')
            birthday = response.get('birthday')  # 키 이름이 올바른지 확인
            if birthyear and birthday:
                try:
                    # 네이버에서도 birthday가 "mmdd"로 오는 경우 변환 (필요 시)
                    if len(birthday) == 4:
                        birthday = birthday[:2] + "-" + birthday[2:]
                    full_birth_date = f"{birthyear}-{birthday}"
                    birth_date = datetime.datetime.strptime(full_birth_date, "%Y-%m-%d").date()
                    profile_obj.birth_date = birth_date
                except Exception as e:
                    logger.error(f"네이버 생년월일 변환 오류: {e}")
        
        elif provider == "google":
            google_data = extra_data

            if google_data.get("name") and not profile_obj.name:
                profile_obj.name = google_data.get("name")
            
            if google_data.get("picture") and not profile_obj.profile_image:
                profile_obj.profile_image = google_data.get("picture")

        profile_obj.save()

    def _create_social_account(self, user, sociallogin):
        """
        SocialAccount 정보 저장:
          - provider와 provider_id를 이용하여 소셜 계정 정보를 저장합니다.
        """
        provider = sociallogin.account.provider
        SocialAccount.objects.get_or_create(
            user=user,
            provider=provider,
            provider_id=str(sociallogin.account.uid)
        )

    # def _initialize_user_data(self, user):
    #     """사용자 기본 데이터 초기화"""
    #     # UserPoint 초기화
    #     UserPoint.objects.get_or_create(
    #         user=user,
    #         defaults={'balance': 0}
    #     )
        
        # Cart 초기화
        # Cart.objects.get_or_create(user=user)