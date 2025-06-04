from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import User

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
    first_name = serializers.CharField(required=False, allow_blank=True) 
    last_name = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if not data.get("first_name"):
            data["first_name"] = None
        if not data.get("last_name"):
            data["last_name"] = None
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