# signals.py
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .middleware import get_current_user
from .models import ChangeLog

# 추적할 모델들 정의
TRACKED_MODELS = ['WorkoutRoutine', 'WorkoutLog', 'MealPlan', 'DietLog', 'Post']

@receiver(pre_save)
def capture_previous_data(sender, instance, **kwargs):
    """저장 전 이전 데이터 캡처"""
    if sender.__name__ not in TRACKED_MODELS:
        return
    
    if instance.pk:  # 업데이트인 경우
        try:
            previous_instance = sender.objects.get(pk=instance.pk)
            instance._previous_data = model_to_dict(previous_instance)
        except sender.DoesNotExist:
            instance._previous_data = {}
    else:  # 새로 생성인 경우
        instance._previous_data = {}

@receiver(post_save)
def log_model_changes(sender, instance, created, **kwargs):
    """모델 변경 시 로그 생성"""
    if sender.__name__ not in TRACKED_MODELS:
        return
    
    # 현재 요청의 사용자 정보 가져오기
    user = getattr(instance, '_current_user', None) or get_current_user()
    if not user:
        return
    
    action = 'create' if created else 'update'
    current_data = model_to_dict(instance)
    previous_data = getattr(instance, '_previous_data', {})
    
    # 변경된 필드 찾기
    field_changes = {}
    if not created:
        for field, current_value in current_data.items():
            previous_value = previous_data.get(field)
            if current_value != previous_value:
                field_changes[field] = {
                    'from': previous_value,
                    'to': current_value
                }

    ChangeLog.objects.create(
        user=user,
        content_type=ContentType.objects.get_for_model(sender),
        object_id=str(instance.pk),
        action=action,
        field_changes=field_changes,
        previous_data=previous_data,
        current_data=current_data,
        client_timestamp=getattr(instance, '_client_timestamp', None)
    )

@receiver(post_delete)
def log_model_deletion(sender, instance, **kwargs):
    """모델 삭제 시 로그 생성"""
    if sender.__name__ not in TRACKED_MODELS:
        return
    
    user = getattr(instance, '_current_user', None) or get_current_user()
    if not user:
        return
    
    ChangeLog.objects.create(
        user=user,
        content_type=ContentType.objects.get_for_model(sender),
        object_id=str(instance.pk),
        action='delete',
        previous_data=model_to_dict(instance),
        current_data={}
    )

def model_to_dict(instance):
    """모델 인스턴스를 딕셔너리로 변환"""
    data = {}
    for field in instance._meta.fields:
        if field.name.startswith('_'):
            continue
        value = getattr(instance, field.name)
        if field.is_relation:
            # 관계형 필드: 값이 있으면 pk, 없으면 None
            data[field.name] = value.pk if value is not None else None
        else:
            data[field.name] = value
    return data

