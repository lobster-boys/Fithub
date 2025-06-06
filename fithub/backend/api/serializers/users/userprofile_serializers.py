from rest_framework import serializers
from users.models import UserProfile
from datetime import date
from decimal import Decimal
import re

# 유저 프로필 시리얼라이즈 공통 검증 로직
class BaseUserProfileSerializer(serializers.ModelSerializer):

    def validate_name(self, value):
        value = value.strip()

        if not (1 <= len(value) < 10):
            raise serializers.ValidationError('이름은 최소 1글자 이상 10글자 미만이어야 합니다.')
        if not re.fullmatch(r"[A-Za-z가-힣]+", value): # 허용되는 문자: 영문 대소문자와 한글
            raise serializers.ValidationError('이름에는 특수문자 및 숫자가 포함될 수 없습니다.')

        return value

    def validate_gender(self, value):
        allowed_value = ['m', 'f', 'o']
        if value not in allowed_value:
            raise serializers.ValidationError(f'성별은 {allowed_value} 중 하나여야 합니다.')
        return value

    def validate_birth_date(self, value):
        today = date.today()
        if value > today:
            raise serializers.ValidationError('생년월일은 오늘 날짜보다 이후일 수 없습니다.')
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 13:
            raise serializers.ValidationError('13세 이상만 가입 가능합니다.')
        if age > 100:
            raise serializers.ValidationError('옳바른 생년월일을 입력해 주세요.')
        return value

    def validate_height(self, value):
        if value is not None:
            if value < Decimal('50.00') or value > Decimal('250.00'):
                raise serializers.ValidationError('신장은 50cm 이상 250cm 이하여야 합니다.')
        return value

    def validate_weight(self, value):
        if value is not None:
            if value < Decimal('20.00') or value > Decimal('300.00'):
                raise serializers.ValidationError('체중은 20kg 이상 300kg 이하여야 합니다.')
        return value

    def validate_activity_level(self, value):
        allowed_levels = ["sedentary", "light", "moderate", "active", "very_cative"]
        if value not in allowed_levels:
            raise serializers.ValidationError(f'활동 수준은 {allowed_levels} 중 하나여야 합니다.')
        return value

    def validate_fitness_goal(self, value):
        allowed_goals = ['weight_loss', 'muscle_gain', 'maintenace', 'endurance', 'strength']
        if value not in allowed_goals:
            raise serializers.ValidationError(f'운동 묙표는 {allowed_goals} 중 하나여야 합니다.')
        return value

    # 이미지 검증 로직은 profile_image가 URLField(문자열)이기 때문에 별도로 구현하지 않는다. 


# 유저 프로필(<int:pk>) 조회 전용 Serializer
class UserProfileSerializer(BaseUserProfileSerializer):
    
    class Meta:
        model = UserProfile
        fields = [
            'user',
            'name',
            'birth_date',
            'gender',
            'height',
            'weight',
            'fitness_goal',
            'activity_level',
            'profile_image',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']


# 유저 프로필 생성 전용 Serializer
class UserProfileCreateSerializer(BaseUserProfileSerializer):
    class Meta:
        model = UserProfile
        # 생성 시 클라이언트가 전달해야 하는 필드만 포함
        fields = [
            'user',
            'name',
            'birth_date',
            'gender',
            'height',
            'weight',
            'fitness_goal',
            'activity_level',
            'profile_image',
            'created_at',
        ]
        read_only_fields = ['user', 'created_at']
        # UserProfile 모델에서 profile_image 필드가 이미 null & blank 속성이 True 이므로
        # extra_kwargs를 지정하지 않아도 되지만, API 문서화 및 명시적인 설정을 위해 작성함
        extra_kwargs = {
            'profile_image': {
                'required': False,
                'allow_null': True,
            },
        }

# 유저 프로필 업데이트 전용 Serializer
class UserProfileUpdateSerializer(BaseUserProfileSerializer):
    class Meta:
        model = UserProfile
        # 업데이트 시 변경 가능한 필드만 정의
        fields = [
            'user',
            'name',
            'birth_date',
            'gender',
            'height',
            'weight',
            'fitness_goal',
            'activity_level',
            'profile_image',
            'updated_at',
        ]
        read_only_fields = ['user', 'updated_at']