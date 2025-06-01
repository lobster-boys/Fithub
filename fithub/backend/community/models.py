from django.db import models
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