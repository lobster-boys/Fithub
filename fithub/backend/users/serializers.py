from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import User

# 이메일 및 비밀번호 검증 로직
import re
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError


# 로그인 후 응답 데이터 커스텀
class CustomLoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "date_joined",
            "last_login",
            "is_active",
            "is_staff",
        )

# 회원가입 필드 커스텀
class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=50) 
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=50)

    # # 이메일 형식 및 중복 검증
    # def validate_email(self, email):
    #     # 기본 이메일 형식 검증 
    #     email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    #     if not re.match(email_regex, email):
    #         raise serializers.ValidationError("올바른 이메일 형식이 아닙니다.")
        
    #     # 금지된 도메인 체크 
    #     forbidden_domains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com']
    #     domain = email.split('@')[1].lower()
    #     if domain in forbidden_domains:
    #         raise serializers.ValidationError("해당 이메일 도메인은 사용할 수 없습니다.")

    #     # 이메일 중복 체크
    #     User = get_user_model()
    #     if User.objects.filter(email=email).exists():
    #         raise serializers.ValidationError("이미 등록된 이메일 주소입니다.")
        
    #     return email
    
    # 사용자명 검증 
    def validate_username(self, username):
        # 길이 검증
        if len(username) < 3:
            raise serializers.ValidationError("사용자명은 최소 3자 이상이어야 합니다.")
        if len(username) > 20:
            raise serializers.ValidationError("사용자명은 최대 20자까지 가능합니다.")
        
        # 형식 검증 (영문, 숫자, 언더스코어만 허용)
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            raise serializers.ValidationError("사용자명은 영문, 숫자, 언더스코어(_)만 사용 가능합니다.")
        
        # 숫자로만 구성된 사용자명 금지
        if username.isdigit():
            raise serializers.ValidationError("사용자명은 숫자로만 구성될 수 없습니다.")
        
        # 중복 체크
        User = get_user_model()
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError("이미 사용 중인 사용자명입니다.")
        
        return username
    
    # 비밀번호 검증
    def validate_password1(self, password):
        # Django 기본 비밀번호 검증
        try:
            validate_password(password)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        # 추가 비밀번호 강도 검증
        if len(password) < 8:
            raise serializers.ValidationError("비밀번호는 최소 8자 이상이어야 합니다.")
        
        # 대소문자, 숫자, 특수문자 포함 검증
        if not re.search(r'[A-Z]', password):
            raise serializers.ValidationError("비밀번호에 대문자를 최소 1개 포함해야 합니다.")
        
        if not re.search(r'[a-z]', password):
            raise serializers.ValidationError("비밀번호에 소문자를 최소 1개 포함해야 합니다.")
        
        if not re.search(r'[0-9]', password):
            raise serializers.ValidationError("비밀번호에 숫자를 최소 1개 포함해야 합니다.")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise serializers.ValidationError("비밀번호에 특수문자를 최소 1개 포함해야 합니다.")
        
        # 연속된 문자 검증
        for i in range(len(password) - 2):
            if ord(password[i]) == ord(password[i+1]) - 1 == ord(password[i+2]) - 2:
                raise serializers.ValidationError("비밀번호에 연속된 문자(예: abc, 123)를 사용할 수 없습니다.")
        
        # 반복 문자 검증
        for i in range(len(password) - 2):
            if password[i] == password[i+1] == password[i+2]:
                raise serializers.ValidationError("비밀번호에 동일한 문자가 3번 이상 연속될 수 없습니다.")
        
        return password
    
    # # 이름 검증
    # def validate_first_name(self, first_name):
    #     if first_name and len(first_name) > 50:
    #         raise serializers.ValidationError("이름은 최대 50자까지 가능합니다.")
        
    #     # 특수문자 제한 (한글, 영문만 허용)
    #     if first_name and not re.match(r'^[가-힣a-zA-Z\s]+$', first_name):
    #         raise serializers.ValidationError("이름은 한글 또는 영문만 입력 가능합니다.")
        
    #     return first_name
    
    # # 성 검증
    # def validate_last_name(self, last_name):
    #     """
    #     성 검증
    #     """
    #     if last_name and len(last_name) > 50:
    #         raise serializers.ValidationError("성은 최대 50자까지 가능합니다.")
        
    #     # 특수문자 제한 (한글, 영문만 허용)
    #     if last_name and not re.match(r'^[가-힣a-zA-Z\s]+$', last_name):
    #         raise serializers.ValidationError("성은 한글 또는 영문만 입력 가능합니다.")
        
    #     return last_name


    def validate(self, data):

        data = super().validate(data)

        if not data.get("first_name"):
            data["first_name"] = None
        if not data.get("last_name"):
            data["last_name"] = None
    
        # 비밀번호 일치 검증 (부모 클래스에서 이미 처리되지만 명시적으로 확인)
        password1 = data.get('password1')
        password2 = data.get('password2')

        if password1 and password2 and password1 != password2:
            raise serializers.ValidationError({
                'password2': '비밀번호가 일치하지 않습니다.'
            })
        
        return data
    
    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data["first_name"] = self.validated_data.get("first_name") or None
        data["last_name"] = self.validated_data.get("last_name") or None
        return data
    
    def custom_signup(self, request, user):
        user.first_name = self.validated_data.get("first_name") or None
        user.last_name = self.validated_data.get("last_name") or None
        user.save()