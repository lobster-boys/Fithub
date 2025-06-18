from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from users.models import UserProfile
from .models import OnboardingData
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


@receiver(post_save, sender=OnboardingData)
def update_user_profile_on_onboarding_save(sender, instance, created, **kwargs):
    """
    온보딩 데이터 저장 시 UserProfile 업데이트
    """
    try:
        profile, profile_created = UserProfile.objects.get_or_create(
            user=instance.user
        )
        
        # UserProfile 필드 업데이트
        profile.height = instance.height
        profile.weight = instance.weight
        profile.onboarding_completed = instance.completed
        profile.onboarding_completed_at = instance.completed_at
        
        # 온보딩 데이터를 JSON으로 저장
        profile.onboarding_data = {
            'fitness_level': instance.fitness_level,
            'height': instance.height,
            'weight': str(instance.weight),
            'age': instance.age,
            'goals': instance.goals,
            'methods': instance.methods,
            'equipment': instance.equipment,
            'bmi': instance.bmi,
            'completed_at': instance.completed_at.isoformat() if instance.completed_at else None
        }
        
        profile.save()
        
        logger.info(
            f"UserProfile updated for user {instance.user.username} "
            f"based on onboarding data (created: {created})"
        )
        
    except Exception as e:
        logger.error(
            f"Failed to update UserProfile for user {instance.user.username}: {str(e)}"
        )


@receiver(post_delete, sender=OnboardingData)
def update_user_profile_on_onboarding_delete(sender, instance, **kwargs):
    """
    온보딩 데이터 삭제 시 UserProfile 업데이트
    """
    try:
        profile = UserProfile.objects.get(user=instance.user)
        profile.onboarding_completed = False
        profile.onboarding_completed_at = None
        profile.onboarding_data = None
        profile.save()
        
        logger.info(
            f"UserProfile reset for user {instance.user.username} "
            f"due to onboarding data deletion"
        )
        
    except UserProfile.DoesNotExist:
        logger.warning(
            f"UserProfile not found for user {instance.user.username} "
            f"during onboarding data deletion"
        )
    except Exception as e:
        logger.error(
            f"Failed to update UserProfile for user {instance.user.username} "
            f"during onboarding deletion: {str(e)}"
        ) 