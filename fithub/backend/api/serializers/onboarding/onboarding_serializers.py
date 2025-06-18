from rest_framework import serializers
from django.core.exceptions import ValidationError
from typing import Dict, Any


class OnboardingDataSerializer(serializers.Serializer):
    """온보딩 데이터 직렬화/검증"""
    
    # 피트니스 레벨 선택지
    FITNESS_LEVEL_CHOICES = [
        ('beginner', '초급'),
        ('intermediate', '중급'),
        ('advanced', '고급'),
    ]
    
    # 목표 선택지
    GOAL_CHOICES = [
        ('weight_loss', '체중 감량'),
        ('muscle_gain', '근육 증가'),
        ('strength', '근력 향상'),
        ('endurance', '지구력 향상'),
        ('health', '건강 관리'),
        ('body_shape', '체형 관리'),
    ]
    
    # 운동 방법 선택지
    METHOD_CHOICES = [
        ('gym', '헬스장'),
        ('home', '홈트레이닝'),
        ('outdoor', '야외 운동'),
        ('group', '단체 운동'),
        ('personal', '개인 트레이닝'),
    ]
    
    # 장비 선택지
    EQUIPMENT_CHOICES = [
        ('dumbbells', '덤벨'),
        ('barbell', '바벨'),
        ('resistance_bands', '저항 밴드'),
        ('pull_up_bar', '턱걸이 바'),
        ('kettlebell', '케틀벨'),
        ('yoga_mat', '요가 매트'),
        ('none', '장비 없음'),
    ]
    
    # 기본 정보
    fitness_level = serializers.ChoiceField(
        choices=FITNESS_LEVEL_CHOICES,
        required=True,
        help_text="현재 피트니스 레벨"
    )
    
    # 신체 정보
    height = serializers.IntegerField(
        min_value=100,
        max_value=250,
        required=True,
        help_text="키 (cm)"
    )
    
    weight = serializers.DecimalField(
        max_digits=5,
        decimal_places=1,
        min_value=30.0,
        max_value=300.0,
        required=True,
        help_text="몸무게 (kg)"
    )
    
    age = serializers.IntegerField(
        min_value=10,
        max_value=120,
        required=True,
        help_text="나이"
    )
    
    # 선택 사항들 (다중 선택 가능)
    goals = serializers.ListField(
        child=serializers.ChoiceField(choices=GOAL_CHOICES),
        required=True,
        min_length=1,
        help_text="운동 목표들"
    )
    
    methods = serializers.ListField(
        child=serializers.ChoiceField(choices=METHOD_CHOICES),
        required=True,
        min_length=1,
        help_text="선호하는 운동 방법들"
    )
    
    equipment = serializers.ListField(
        child=serializers.ChoiceField(choices=EQUIPMENT_CHOICES),
        required=False,
        allow_empty=True,
        help_text="사용 가능한 장비들"
    )
    
    def validate_goals(self, value):
        """목표 개수 제한"""
        if len(value) > 3:
            raise serializers.ValidationError("목표는 최대 3개까지 선택할 수 있습니다.")
        return value
    
    def validate_methods(self, value):
        """운동 방법 개수 제한"""
        if len(value) > 3:
            raise serializers.ValidationError("운동 방법은 최대 3개까지 선택할 수 있습니다.")
        return value
    
    def validate_equipment(self, value):
        """장비 개수 제한"""
        if len(value) > 5:
            raise serializers.ValidationError("장비는 최대 5개까지 선택할 수 있습니다.")
        return value
    
    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """전체 데이터 검증"""
        # BMI 계산 및 경고
        height_m = attrs['height'] / 100
        weight_kg = float(attrs['weight'])
        bmi = weight_kg / (height_m * height_m)
        
        if bmi < 16 or bmi > 40:
            raise serializers.ValidationError(
                "입력하신 키와 몸무게 정보를 다시 확인해주세요."
            )
        
        # 목표와 방법의 조합 검증
        goals = attrs['goals']
        methods = attrs['methods']
        
        # 근육 증가 목표인데 유산소 운동만 선택한 경우 경고
        if 'muscle_gain' in goals and 'outdoor' in methods and len(methods) == 1:
            # 경고만 하고 통과시킴 (사용자 선택 존중)
            pass
            
        return attrs


class OnboardingStatusSerializer(serializers.Serializer):
    """온보딩 상태 응답용 시리얼라이저"""
    
    user_id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    onboarding_completed = serializers.BooleanField(read_only=True)
    completed_at = serializers.DateTimeField(read_only=True, allow_null=True)


class OnboardingResponseSerializer(serializers.Serializer):
    """온보딩 응답용 시리얼라이저"""
    
    completed = serializers.BooleanField(read_only=True)
    completed_at = serializers.DateTimeField(read_only=True, allow_null=True)
    data = serializers.JSONField(read_only=True, allow_null=True)
    message = serializers.CharField(read_only=True, required=False) 