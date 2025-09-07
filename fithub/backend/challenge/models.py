from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from decimal import Decimal

User = settings.AUTH_USER_MODEL


class Challenge(models.Model):
    WEEKLY = "W"
    MONTHLY = "M"
    PERIOD_CHOICES = [
        (WEEKLY, "주간"),
        (MONTHLY, "월간"),
    ]

    WORKOUT_COUNT = "WORKOUT_COUNT"
    RUNNING_DISTANCE = "RUNNING_DISTANCE"
    CALORIE_BURN = "CALORIE_BURN"
    GOAL_TYPE_CHOICES = [
        (WORKOUT_COUNT, "운동 횟수"),
        (RUNNING_DISTANCE, "달린 거리"),
        (CALORIE_BURN, "칼로리 소모"),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    period = models.CharField(max_length=1, choices=PERIOD_CHOICES)
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPE_CHOICES)
    goal_value = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    reward_points = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    # 포인트 시스템 연동 필드
    entry_cost = models.PositiveIntegerField(
        default=100,
        help_text="챌린지 참여에 필요한 포인트"
    )
    min_participants = models.PositiveIntegerField(
        default=5,
        help_text="챌린지 시작에 필요한 최소 참여자 수"
    )
    reward_multiplier = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=Decimal('1.5'),
        help_text="참여자 수에 따른 보상 배수"
    )

    # challenge_checker 기능 통합을 위한 추가 필드
    creator = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_challenges',
        null=True, 
        blank=True,
        help_text="챌린지 생성자 (개인 챌린지의 경우)"
    )
    is_personal = models.BooleanField(
        default=False, 
        help_text="개인 챌린지 여부 (True: 개인, False: 공개)"
    )
    
    # challenge_checker의 target_value와 status 필드 통합
    target_value = models.PositiveIntegerField(
        null=True, 
        blank=True,
        help_text="목표값 (goal_value와 중복이지만 호환성을 위해 유지)"
    )
    status = models.CharField(
        max_length=20, 
        default="active",
        choices=[
            ("active", "진행중"),
            ("completed", "완료"),
            ("inactive", "비활성")
        ]
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date"]

    def clean(self):
        if self.end_date < self.start_date:
            raise ValidationError("종료일은 시작일보다 빠를 수 없습니다.")

    def __str__(self):
        if self.is_personal and self.creator:
            return f"{self.creator.username}의 {self.name} ({self.get_period_display()})"
        return f"{self.name} ({self.get_period_display()} | {self.start_date} ~ {self.end_date})"
    
    @property
    def participant_count(self):
        """현재 참여자 수"""
        return self.participants.count()
    
    @property
    def can_start(self):
        """시작 가능 여부 (최소 참여자 수 충족)"""
        return self.participant_count >= self.min_participants
    
    def calculate_reward_multiplier(self):
        """참여자 수에 따른 보상 배수 계산"""
        count = self.participant_count
        if count >= 100:
            return Decimal('5.0')
        elif count >= 50:
            return Decimal('3.0')
        elif count >= 25:
            return Decimal('2.5')
        elif count >= 10:
            return Decimal('2.0')
        elif count >= 5:
            return Decimal('1.5')
        else:
            return Decimal('1.0')  # 최소 참여자 미달 시
    
    def calculate_total_reward(self):
        """총 보상 포인트 계산"""
        multiplier = self.calculate_reward_multiplier()
        return int(self.entry_cost * multiplier)
    
    def update_reward_multiplier(self):
        """참여자 수 변경 시 보상 배수 업데이트"""
        self.reward_multiplier = self.calculate_reward_multiplier()
        self.reward_points = self.calculate_total_reward()
        self.save(update_fields=['reward_multiplier', 'reward_points'])


class ChallengeParticipant(models.Model):
    challenge = models.ForeignKey(
        Challenge, on_delete=models.CASCADE, related_name="participants"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="challenges")
    join_datetime = models.DateTimeField(auto_now_add=True)
    current_progress = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    is_completed = models.BooleanField(default=False)
    completion_datetime = models.DateTimeField(null=True, blank=True)
    reward_claimed = models.BooleanField(default=False)
    
    # 포인트 연동 필드
    entry_points_paid = models.PositiveIntegerField(
        default=0,
        help_text="참여 시 지불한 포인트"
    )
    reward_points_earned = models.PositiveIntegerField(
        default=0,
        help_text="완료 시 획득한 보상 포인트"
    )

    class Meta:
        unique_together = ("challenge", "user")
        ordering = ["challenge", "user"]

    def __str__(self):
        status = "완료" if self.is_completed else "진행중"
        return f"{self.user.username} → {self.challenge.name} ({status})"


class ChallengePoint(models.Model):
    user_challenge = models.ForeignKey(
        ChallengeParticipant, on_delete=models.CASCADE, related_name="points"
    )
    points = models.PositiveIntegerField()
    reason = models.CharField(max_length=200, blank=True)
    awarded_datetime = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-awarded_datetime"]

    def __str__(self):
        user = self.user_challenge.user.username
        chall = self.user_challenge.challenge.name
        return f"{user}에게 {self.points}P 지급 (챌린지: {chall})"


# PointTransaction 모델은 Points 앱으로 이전됨
# 포인트 관련 기능은 points.services.PointService를 사용하세요


class UserLog(models.Model):
    """
    사용자 활동 로그 (운동 기록, 칼로리 소모 등)
    챌린지 달성도 계산에 사용
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    value = models.IntegerField(help_text="기록된 값 (운동 횟수, 칼로리, 거리 등)")
    log_type = models.CharField(
        max_length=20,
        choices=[
            ("workout_count", "운동 횟수"),
            ("calories", "칼로리"),
            ("distance", "거리"),
            ("other", "기타")
        ],
        default="workout_count",
        help_text="로그 유형"
    )
    notes = models.TextField(blank=True, help_text="메모")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'log_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.get_log_type_display()}: {self.value} ({self.date})"


class SocialShare(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="shares")

    KAKAO = "KAKAO"
    FACEBOOK = "FACEBOOK"
    INSTAGRAM = "INSTAGRAM"
    PLATFORM_CHOICES = [
        (KAKAO, "카카오"),
        (FACEBOOK, "페이스북"),
        (INSTAGRAM, "인스타그램"),
    ]
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    share_url = models.CharField(max_length=255, blank=True)

    STATUS_SUCCESS = "SUCCESS"
    STATUS_FAIL = "FAIL"
    STATUS_CANCEL = "CANCEL"
    STATUS_CHOICES = [
        (STATUS_SUCCESS, "성공"),
        (STATUS_FAIL, "실패"),
        (STATUS_CANCEL, "취소"),
    ]
    share_status = models.CharField(max_length=10, choices=STATUS_CHOICES, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} → {self.get_platform_display()} ({self.content_object})"
