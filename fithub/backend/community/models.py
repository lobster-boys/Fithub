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
    """   
    참고: User 모델과 Post 모델 참조 방식에 대한 설명

    1. 사용자 모델 (User Model):
    - Django 프로젝트에서는 기본 사용자 모델을 커스터마이징하거나 교체할 수 있습니다.
    - 따라서 다른 앱이나 모델에서 User 모델을 참조할 때, 직접 import 하는 대신
        'settings.AUTH_USER_MODEL' (또는 문자열 형태 'app_label.CustomUser')을 사용합니다.
    - 이 방식은 프로젝트 설정에 따라 유연하게 대응할 수 있으며, 순환 참조 문제도 예방할 수 있습니다.
    - 자세한 내용은 Django 공식 문서의 "Substituting a custom user model"
        (https://docs.djangoproject.com/en/5.2/topics/auth/customizing/#substituting-a-custom-user-model)을 참조하세요.

    2. 게시글 모델 (Post Model):
    - Post 모델은 community 앱 내에서 직접 정의한 핵심 모델입니다.
    - 이 모델은 프로젝트 전반에서 교체될 가능성이 낮고, 동일 앱 내에서 사용되므로
        직접 참조해도 문제가 없습니다.
    """

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