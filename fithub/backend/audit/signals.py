from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.db.models.fields.files import ImageFieldFile, FieldFile
import json
from .middleware import get_current_user
from .models import ChangeLog

# 추적할 모델들 정의
TRACKED_MODELS = ['WorkoutRoutine', 'WorkoutLog', 'MealPlan', 'DietLog', 'Post']

def serialize_for_json(obj):
    """JSON 직렬화를 위해 객체를 변환"""
    if isinstance(obj, (ImageFieldFile, FieldFile)):
        # 파일이 있으면 URL 반환, 없으면 None
        return obj.url if obj else None
    elif hasattr(obj, '__dict__') and not isinstance(obj, (str, int, float, bool, type(None))):
        # 다른 복합 객체들을 딕셔너리로 변환 (기본 타입은 제외)
        return {key: serialize_for_json(value) for key, value in obj.__dict__.items()}
    elif isinstance(obj, (list, tuple)):
        return [serialize_for_json(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: serialize_for_json(value) for key, value in obj.items()}
    else:
        # 기본 타입이거나 JSON 직렬화 가능한 객체는 그대로 반환
        try:
            json.dumps(obj) 
            return obj
        except (TypeError, ValueError):
            # 직렬화 불가능한 경우 문자열로 변환
            return str(obj)

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
    
    # ChangeLog 모델 자체의 변경은 기록하지 않음 (무한 루프 방지)
    if sender == ChangeLog:
        return
    
    # 현재 요청의 사용자 정보 가져오기
    user = getattr(instance, '_current_user', None) or get_current_user()
    if not user or not getattr(user, 'is_authenticated', False):
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
    
    # ChangeLog 모델 자체의 변경은 기록하지 않음 (무한 루프 방지)
    if sender == ChangeLog:
        return
    
    user = getattr(instance, '_current_user', None) or get_current_user()
    if not user or not getattr(user, 'is_authenticated', False):
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
    """모델 인스턴스를 딕셔너리로 변환 (JSON 직렬화 가능한 형태로)"""
    data = {}
    for field in instance._meta.fields:
        if field.name.startswith('_'):
            continue
        
        value = getattr(instance, field.name)
        
        if field.is_relation:
            # 관계형 필드: 값이 있으면 pk, 없으면 None
            data[field.name] = value.pk if value is not None else None
        else:
            # 일반 필드: JSON 직렬화 가능한 형태로 변환
            data[field.name] = serialize_for_json(value)
    
    return data
