from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Challenge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    target_value = models.PositiveIntegerField()
    status = models.CharField(max_length=10, default="ongoing")

    # 포인트 관련 필드
    points = models.PositiveIntegerField(default=0, help_text="달성 시 지급할 포인트")
    points_awarded = models.BooleanField(
        default=False, help_text="포인트 지급 완료 여부"
    )

    def __str__(self):
        return f"{self.user} / {self.name} ({self.status})"


#     사용자 로그 모델
class UserLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    value = models.IntegerField()


#     포인트 관련 필드
class PointTransaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    challenge = models.ForeignKey(
        "Challenge",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        help_text="발생 원인이 된 챌린지",
    )
    points = models.IntegerField(help_text="증감된 포인트")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        sign = "+" if self.points >= 0 else ""
        return f"{self.user.username}: {sign}{self.points} at {self.timestamp:%Y-%m-%d %H:%M}"
