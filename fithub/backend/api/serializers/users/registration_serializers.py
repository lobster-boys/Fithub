from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from users.models import User
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
            "is_superuser",
        )

# 회원가입 필드 커스텀 - 임시로 간소화
class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=50) 
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=50)

    # 임시로 복잡한 검증 로직 제거 - 기본 검증만 사용
    def validate_username(self, username):
        print(f"DEBUG: Validating username: {username}")
        # 기본 검증만
        if len(username) < 3:
            raise serializers.ValidationError("사용자명은 최소 3자 이상이어야 합니다.")
        
        # 중복 체크
        User = get_user_model()
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError("이미 사용 중인 사용자명입니다.")
        
        return username
    
    def validate_email(self, email):
        print(f"DEBUG: Validating email: {email}")
        # 이메일 중복 체크
        User = get_user_model()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("이미 사용 중인 이메일입니다.")
        
        return email
    
    # 비밀번호 검증 간소화
    def validate_password1(self, password):
        print(f"DEBUG: Validating password: {password}")
        # 기본 길이 검증만
        if len(password) < 8:
            raise serializers.ValidationError("비밀번호는 최소 8자 이상이어야 합니다.")
        
        return password

    def validate(self, data):
        print(f"DEBUG: validate() called with data: {data}")
        try:
            data = super().validate(data)
            print(f"DEBUG: super().validate() passed")
            
            if not data.get("first_name"):
                data["first_name"] = None
            if not data.get("last_name"):
                data["last_name"] = None
        
            # 비밀번호 일치 검증
            password1 = data.get('password1')
            password2 = data.get('password2')

            if password1 and password2 and password1 != password2:
                raise serializers.ValidationError({
                    'password2': '비밀번호가 일치하지 않습니다.'
                })
            
            print(f"DEBUG: validate() returning data: {data}")
            return data
        except Exception as e:
            print(f"DEBUG: Error in validate(): {e}")
            raise
    
    def get_cleaned_data(self):
        print(f"DEBUG: get_cleaned_data() called")
        try:
            data = super().get_cleaned_data()
            if hasattr(self, 'validated_data') and self.validated_data:
                data["first_name"] = self.validated_data.get("first_name") or None
                data["last_name"] = self.validated_data.get("last_name") or None
            print(f"DEBUG: get_cleaned_data() returning: {data}")
            return data
        except Exception as e:
            print(f"DEBUG: Error in get_cleaned_data(): {e}")
            raise
    
    def custom_signup(self, request, user):
        print(f"DEBUG: custom_signup() called for user: {user}")
        try:
            if hasattr(self, 'validated_data') and self.validated_data:
                user.first_name = self.validated_data.get("first_name") or None
                user.last_name = self.validated_data.get("last_name") or None
            user.save()
            print(f"DEBUG: custom_signup() completed successfully")
        except Exception as e:
            print(f"DEBUG: Error in custom_signup(): {e}")
            raise