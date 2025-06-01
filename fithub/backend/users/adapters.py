# adapters.py
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model
from .models import UserProfile, SocialAccount
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class KakaoSocialAccountAdapter(DefaultSocialAccountAdapter):
    
    def populate_user(self, request, sociallogin, data):
        """기본 User 모델 정보 설정"""
        user = super().populate_user(request, sociallogin, data)
        
        try:
            kakao_data = sociallogin.account.extra_data
            kakao_account = kakao_data.get("kakao_account", {})
            profile = kakao_account.get("profile", {})
            
            # 기본 사용자 정보 설정
            if kakao_account.get("email"):
                user.email = kakao_account.get("email")
            
            # 프로필 이미지 설정
            if profile.get("profile_image_url"):
                user.profile_image = profile.get("profile_image_url")
            
            # 닉네임을 이름으로 사용
            if profile.get("nickname") and not user.first_name:
                user.first_name = profile.get("nickname")
                
        except Exception as e:
            logger.error(f"카카오 사용자 정보 설정 중 오류: {e}")
            
        return user
    
    def save_user(self, request, sociallogin, form=None):
        """사용자 저장 후 추가 처리"""
        user = super().save_user(request, sociallogin, form)
        
        try:
            # UserProfile 생성
            self._create_user_profile(user, sociallogin)
            
            # SocialAccount 정보 저장
            self._create_social_account(user, sociallogin)
            
            # 기본 데이터 초기화
            self._initialize_user_data(user)
            
        except Exception as e:
            logger.error(f"카카오 소셜 계정 저장 중 오류: {e}")
            
        return user
    
    def _create_user_profile(self, user, sociallogin):
        """UserProfile 생성"""
        kakao_data = sociallogin.account.extra_data
        kakao_account = kakao_data.get("kakao_account", {})
        
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={}
        )
        
        # 성별 매핑
        kakao_gender = kakao_account.get("gender")
        if kakao_gender and not profile.gender:
            if kakao_gender == "male":
                profile.gender = "M"
            elif kakao_gender == "female":
                profile.gender = "F"
            
        profile.save()
        
    def _create_social_account(self, user, sociallogin):
        """SocialAccount 정보 저장"""
        social_account, created = SocialAccount.objects.get_or_create(
            user=user,
            provider='kakao',
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
