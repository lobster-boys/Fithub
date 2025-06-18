from django.conf import settings
from django.db import models
from django.conf import settings
from users.models import User

class Post(models.Model):

    CONTENT_CATEGORY_CHOICES = [
        ('fitness_tip', '운동 팁'),
        ('question_answer', '질문 답변'),
        ('certification_review', '인증 후기'),
        ('free_board', '자유 게시판')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    content = models.CharField(max_length=3000)
    content_category = models.CharField(
        max_length=20,
        choices=CONTENT_CATEGORY_CHOICES
    )
    content_image = models.ImageField(upload_to='posts/images/', blank=True, null=True)
    like_count = models.PositiveIntegerField(default=0) # 좋아요 수는 음수 x, 기본값 0
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title[:20]

class Comment(models.Model):

    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.CharField(max_length=100)
    like_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.content[:20]
    

class PostLike(models.Model):

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='postLike', on_delete=models.CASCADE)

class CommentLike(models.Model):
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, related_name='commentLike', on_delete=models.CASCADE)


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
