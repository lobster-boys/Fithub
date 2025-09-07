from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class OnboardingData(models.Model):
    """
    사용자의 온보딩 데이터를 저장하는 모델
    UserProfile과 별도로 관리하여 온보딩 과정의 세부 정보를 보관
    """
    
    FITNESS_LEVEL_CHOICES = [
        ('beginner', '초급'),
        ('intermediate', '중급'),
        ('advanced', '고급'),
    ]
    
    GOAL_CHOICES = [
        ('weight_loss', '체중 감량'),
        ('muscle_gain', '근육 증가'),
        ('strength', '근력 향상'),
        ('endurance', '지구력 향상'),
        ('health', '건강 관리'),
        ('body_shape', '체형 관리'),
    ]
    
    METHOD_CHOICES = [
        ('gym', '헬스장'),
        ('home', '홈트레이닝'),
        ('outdoor', '야외 운동'),
        ('group', '단체 운동'),
        ('personal', '개인 트레이닝'),
    ]
    
    EQUIPMENT_CHOICES = [
        ('dumbbells', '덤벨'),
        ('barbell', '바벨'),
        ('resistance_bands', '저항 밴드'),
        ('pull_up_bar', '턱걸이 바'),
        ('kettlebell', '케틀벨'),
        ('yoga_mat', '요가 매트'),
        ('none', '장비 없음'),
    ]
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='onboarding_data',
        verbose_name='사용자'
    )
    
    # 기본 정보
    fitness_level = models.CharField(
        max_length=20,
        choices=FITNESS_LEVEL_CHOICES,
        verbose_name='피트니스 레벨'
    )
    
    # 신체 정보
    height = models.PositiveIntegerField(
        validators=[MinValueValidator(100), MaxValueValidator(250)],
        verbose_name='키 (cm)'
    )
    
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        validators=[MinValueValidator(30.0), MaxValueValidator(300.0)],
        verbose_name='몸무게 (kg)'
    )
    
    age = models.PositiveIntegerField(
        validators=[MinValueValidator(10), MaxValueValidator(120)],
        verbose_name='나이'
    )
    
    # 성별 정보 추가
    GENDER_CHOICES = [
        ('m', '남성'),
        ('f', '여성'),
        ('o', '기타'),
    ]
    
    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        blank=True,
        null=True,
        verbose_name='성별'
    )
    
    # 목표 칼로리 추가
    target_calories = models.PositiveIntegerField(
        validators=[MinValueValidator(1200), MaxValueValidator(4000)],
        default=2000,
        verbose_name='목표 칼로리 (kcal/day)'
    )
    
    # 목표 및 선호도 (JSON 필드로 배열 저장)
    goals = models.JSONField(
        default=list,
        verbose_name='운동 목표',
        help_text='선택된 목표들의 배열'
    )
    
    methods = models.JSONField(
        default=list,
        verbose_name='운동 방법',
        help_text='선호하는 운동 방법들의 배열'
    )
    
    equipment = models.JSONField(
        default=list,
        verbose_name='사용 가능한 장비',
        help_text='사용 가능한 장비들의 배열'
    )
    
    # 메타 정보
    completed = models.BooleanField(default=False, verbose_name='완료 여부')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='완료일')
    
    class Meta:
        db_table = 'onboarding_data'
        verbose_name = '온보딩 데이터'
        verbose_name_plural = '온보딩 데이터'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}의 온보딩 데이터"
    
    @property
    def bmi(self):
        """BMI 계산"""
        if self.height and self.weight:
            height_m = float(self.height) / 100
            return round(float(self.weight) / (height_m * height_m), 1)
        return None
    
    def get_goals_display(self):
        """목표 목록을 한국어로 반환"""
        goal_dict = dict(self.GOAL_CHOICES)
        return [goal_dict.get(goal, goal) for goal in self.goals]
    
    def get_methods_display(self):
        """운동 방법 목록을 한국어로 반환"""
        method_dict = dict(self.METHOD_CHOICES)
        return [method_dict.get(method, method) for method in self.methods]
    
    def get_equipment_display(self):
        """장비 목록을 한국어로 반환"""
        equipment_dict = dict(self.EQUIPMENT_CHOICES)
        return [equipment_dict.get(eq, eq) for eq in self.equipment]


class OnboardingHistory(models.Model):
    """
    온보딩 수정 이력을 추적하는 모델
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='onboarding_history',
        verbose_name='사용자'
    )
    
    previous_data = models.JSONField(
        verbose_name='이전 데이터',
        help_text='수정 전 온보딩 데이터'
    )
    
    new_data = models.JSONField(
        verbose_name='새 데이터',
        help_text='수정 후 온보딩 데이터'
    )
    
    change_reason = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='변경 사유'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='변경일')
    
    class Meta:
        db_table = 'onboarding_history'
        verbose_name = '온보딩 변경 이력'
        verbose_name_plural = '온보딩 변경 이력'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}의 온보딩 변경 ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
