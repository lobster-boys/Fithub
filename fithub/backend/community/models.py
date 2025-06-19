import uuid
from django.conf import settings
from django.db import models


class Routine(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    #  공개 여부
    is_public = models.BooleanField(
        default=False, help_text="공개 상태 (True면 누구나 조회 가능)"
    )

    def __str__(self):
        return self.title

    def can_view(self, user):

        return RoutineSharePermission.has_view(self, user)

    def can_edit(self, user):

        return RoutineSharePermission.has_edit(self, user)

    def can_admin(self, user):

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


class RoutineShareLink(models.Model):
    """
    루틴에 대해 고유한 UUID 기반 공유 링크를 생성·관리
    """

    routine = models.ForeignKey(
        Routine,
        on_delete=models.CASCADE,
        related_name="share_links",
        help_text="공유 링크를 생성할 루틴",
    )
    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="공유 URL 토큰",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_share_links",
        help_text="링크를 생성한 사용자",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="링크 생성 시각",
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="링크 만료 시각 (미설정 시 무제한)",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="활성화 여부 (False면 접근 차단)",
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "루틴 공유 링크"
        verbose_name_plural = "루틴 공유 링크 목록"

    def __str__(self):
        return f"{self.routine.title} → {self.uuid}"

    def share_url(self, request=None):
        """
        Request가 주어지면 절대경로를, 아니면 상대경로(`/share/<uuid>/`)를 반환
        """
        path = f"/share/{self.uuid}/"
        if request:
            return request.build_absolute_uri(path)
        return path
