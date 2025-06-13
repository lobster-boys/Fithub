from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date"]

    def clean(self):
        if self.end_date < self.start_date:
            raise ValidationError("종료일은 시작일보다 빠를 수 없습니다.")

    def __str__(self):
        return f"{self.name} ({self.get_period_display()} | {self.start_date} ~ {self.end_date})"


class ChallengeParticipant(models.Model):
    challenge = models.ForeignKey(
        Challenge, on_delete=models.CASCADE, related_name="participants"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="challenges")
    join_datetime = models.DateTimeField(auto_now_add=True)
    current_progress = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_completed = models.BooleanField(default=False)
    completion_datetime = models.DateTimeField(null=True, blank=True)
    reward_claimed = models.BooleanField(default=False)

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
