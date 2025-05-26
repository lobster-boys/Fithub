from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator

# 사용자 인증 및 기본 정보를 관리하는 모델
class User(AbstractUser):
    """
    Django의 기본 필드(username, password, date_joined, last_login, is_staff 등)들이 포함된 상태
    """
        
    email = models.EmailField(unique=True, max_length=254)
    profile_image = models.ImageField(
        upload_to='profile_images/', 
        null=True, 
        blank=True,
        help_text="사용자 프로필 이미지"
    )

    class Meta:
        db_table = 'user'
        verbose_name = '사용자'
        verbose_name_plural = '사용자들'
    
    def __str__(self):
        return self.username


# 사용자 피트니스+이커머스 관련 프로필 정보를 관리하는 모델
class UserProfile(models.Model):

    GENDER_CHOICES = [
        ('M', '남성'),
        ('F', '여성'),
        ('O', '기타'),
    ]

    FITNESS_GOAL_CHOICES = [
        ('WEIGHT_LOSS', '체중 감량'),
        ('MUSCLE_GAIN', '근육 증가'),
        ('MAINTENANCE', '체중 유지'),
        ('ENDURANCE', '지구력 향상'),
        ('STRENGTH', '근력 향상'),
    ]

    ACTIVITY_LEVEL_CHOICES = [
        ('SEDENTARY', '비활동적'),
        ('LIGHT', '가벼운 활동'),
        ('MODERATE', '보통 활동'),
        ('ACTIVE', '활발한 활동'),
        ('VERY_ACTIVE', '매우 활발한 활동'),
    ]

    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='profile',
        primary_key=True
    )
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=1, 
        choices=GENDER_CHOICES, 
        null=True, 
        blank=True
    )
    height = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(300)],
        help_text="키 (cm)"
    )
    weight = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(500)],
        help_text="몸무게 (kg)"
    )
    fitness_goal = models.CharField(
        max_length=20, 
        choices=FITNESS_GOAL_CHOICES, 
        null=True, 
        blank=True
    )
    activity_level = models.CharField(
        max_length=15, 
        choices=ACTIVITY_LEVEL_CHOICES, 
        null=True, 
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'userprofile'
        verbose_name = '사용자 프로필'
        verbose_name_plural = '사용자 프로필들'
    
    def __str__(self):
        return f"{self.user.username}의 프로필"
    
    @property
    def age(self):
        # 생년월일을 기반으로 나이 계산
        if self.birth_date:
            from datetime import date
            today = date.today()
            return today.year - self.birth_date.year - (
                (today.month, today.day) < (self.birth_date.month, self.birth_date.day)
            )
        return None