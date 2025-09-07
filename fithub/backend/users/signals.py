from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import UserProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    사용자가 생성될 때 UserProfile을 자동으로 생성합니다.
    accounts 앱에서 이식된 기능입니다.
    """
    if created:
        UserProfile.objects.create(user=instance)
    else:
        # 프로필이 존재하는 경우에만 저장
        if hasattr(instance, 'profile'):
            instance.profile.save() 