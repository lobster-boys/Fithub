from django.conf import settings
from django.db import models


class Routine(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def can_view(self, user):
        from .models import RoutineSharePermission

        return RoutineSharePermission.has_view(self, user)

    def can_edit(self, user):
        from .models import RoutineSharePermission

        return RoutineSharePermission.has_edit(self, user)

    def can_admin(self, user):
        from .models import RoutineSharePermission

        return RoutineSharePermission.has_admin(self, user)

    def user_permission(self, user):
        # 소유자이면 ADMIN
        if user == self.user:
            return RoutineSharePermission.ADMIN
        perm = RoutineSharePermission.get_for(self, user)
        return perm.permission if perm else None


# 문자열 참조를 써서 순환 임포트를 방지
class RoutineSharePermission(models.Model):
    VIEW = "view"
    EDIT = "edit"
    ADMIN = "admin"
    PERMISSION_CHOICES = [
        (VIEW, "View Only"),
        (EDIT, "Edit"),
        (ADMIN, "Owner/Admin"),
    ]

    routine = models.ForeignKey(
        Routine,  # 기존 Routine 모델
        on_delete=models.CASCADE,
        related_name="share_permissions",
        help_text="공유 권한을 부여할 대상 루틴",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="routine_share_permissions",
        help_text="이 루틴에 접근 권한을 갖는 사용자",
    )
    permission = models.CharField(
        max_length=10,
        choices=PERMISSION_CHOICES,
        default=VIEW,
        help_text="부여된 권한 레벨",
    )
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="granted_share_permissions",
        help_text="권한을 부여한 사용자",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("routine", "user")
        ordering = ["-created_at"]
        verbose_name = "루틴 공유 권한"
        verbose_name_plural = "루틴 공유 권한 목록"

    def __str__(self):
        return f"{self.user} → {self.routine} ({self.permission})"

    # ─── 헬퍼 메서드 ────────────────────────────────────────────

    @classmethod
    def get_for(cls, routine, user):
        return cls.objects.filter(routine=routine, user=user).first()

    @classmethod
    def has_view(cls, routine, user):
        perm = cls.get_for(routine, user)
        return perm and perm.permission in {cls.VIEW, cls.EDIT, cls.ADMIN}

    @classmethod
    def has_edit(cls, routine, user):
        perm = cls.get_for(routine, user)
        return perm and perm.permission in {cls.EDIT, cls.ADMIN}

    @classmethod
    def has_admin(cls, routine, user):
        perm = cls.get_for(routine, user)
        return perm and perm.permission == cls.ADMIN
