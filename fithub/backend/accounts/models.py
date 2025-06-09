from django.conf import settings
from django.db import models


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    points = models.PositiveIntegerField(default=0, help_text="누적 포인트")

    def __str__(self):
        return f"{self.user.username}의 프로필"
