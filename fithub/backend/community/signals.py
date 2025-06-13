from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from community.models import PostLike, CommentLike

"""
이 파일에서는 PostLike와 CommentLike 모델의 post_save 및 post_delete 시그널을 사용하여,
게시글(Post) 및 댓글(Comment) 모델의 like_count 필드를 자동으로 갱신합니다.

- 시그널 핸들러는 PostLike 또는 CommentLike 인스턴스가 생성되거나 삭제될 때 호출됩니다.
- 핸들러 내부에서는 관련 Post 또는 Comment 인스턴스의 좋아요 수를 해당 객체의 관련 좋아요 개수로 재계산한 후 저장합니다.
- 이를 통해 좋아요 기능(생성/삭제)과 관련된 로직을 뷰에서 분리하여, 코드의 명확성과 유지보수성을 높입니다.
- 이 파일은 community 앱의 AppConfig의 ready() 메서드에서 임포트되어 애플리케이션 시작 시 자동 등록됩니다.

(참고) Django 공식 Signals 문서
https://docs.djangoproject.com/en/5.2/topics/signals/
"""

@receiver(post_save, sender=PostLike)
def update_post_like_count_on_create(sender, instance, created, **kwargs):
    if created:
        instance.post.like_count = instance.post.postLike.count()
        instance.post.save(update_fields=['like_count'])

@receiver(post_delete, sender=PostLike)
def update_post_like_count_on_delete(sender, instance, **kwargs):
    instance.post.like_count = instance.post.postLike.count()
    instance.post.save(update_fields=['like_count'])

@receiver(post_save, sender=CommentLike)
def update_comment_like_count_on_create(sender, instance, created, **kwargs):
    if created:
        instance.comment.like_count = instance.comment.commentLike.count()
        instance.comment.save(update_fields=['like_count'])

@receiver(post_delete, sender=CommentLike)
def update_comment_like_count_on_delete(sender, instance, **kwargs):
    instance.comment.like_count = instance.comment.commentLike.count()
    instance.comment.save(update_fields=['like_count'])