from django.db import models
from users.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

"""
ContentType과 GenericForeignKey 설명

1. ContentType
 - 정의: Django의 django.contrib.contenttypes 앱에서 제공하는 모델로, 프로젝트 내에 존재하는 모든 모델의 정보를 저장합니다. 
   각각의 모델은 하나의 ContentType 인스턴스와 매핑되며, 여기에는 모델의 앱 이름, 모델 이름 등이 포함합니다.
 - 용도: 이 정보를 활용하면 코드에서 특정 객체가 어떤 모델의 인스턴스인지를 동적으로 확인할 수 있습니다. 
   예를 들어, 변경 로그를 남길 때 어떤 타입의 객체가 수정되었는지 기록하거나, 
   여러 모델을 대상으로 한 공통 기능(예: 감사 로그, 댓글, 좋아요 등)을 구현할 때 유용

2. GenericForeignKey
 - 정의: GenericForeignKey는 실제 데이터베이스 필드가 아니라, Django의 ContentType 프레임워크를 기반으로 동작하는 “가상 필드” 입니다.
   보통 content_type & object_id 필드와 함께 사용하며, 각각 대상 객체의 모델과 대상 객체의 기본키를 저장합니다.
 - 용도: 이 두 필드의 조합으로 GenericForeignKey는 특정 모델의 객체를 참조하게 됩니다.
   예를 들어, ChangeLog 모델에 GenericForeignKey를 사용하면, 하나의 ChangeLog 인스턴스가 사용자, 게시글, 댓글 등 어떤 모델의 객체에 대해서도 연결될 수 있습니다.
 - 장점: 한 모델(예: ChangeLog)이 여러 다른 모델과 관계를 맺어야 할 때, 각 대상 모델마다 별도의 외래키 필드를 만들지 않고도 구현할 수 있어 코드의 중복을 줄이고, 
   구조를 유연하게 만듭니다.

"""


class ChangeLog(models.Model):
    """
    사용자의 CRUD를 기록하는 모델
    """

    SYNC_STATUS_CHOICES = [
        ('pending', '동기화 대기'),
        ('synced', '동기화 완료'),
        ('failed', '동기화 실패'),
        ('conflict', '충돌 발생'),
    ]
    
    ACTION_CHOICES = [
        ('create', '생성'),
        ('update', '수정'),
        ('delete', '삭제'),
    ]

    # 사용자 정보
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # 변경된 객체 정보
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.CharField(max_length=255)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # 변경 정보
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    field_changes = models.JSONField(default=dict)  # 변경된 필드와 값들
    previous_data = models.JSONField(default=dict)  # 이전 데이터
    current_data = models.JSONField(default=dict)   # 현재 데이터
    
    # 타임스탬프 및 동기화 정보
    timestamp = models.DateTimeField(auto_now_add=True)
    client_timestamp = models.DateTimeField(null=True, blank=True)  # 클라이언트에서 보낸 시간
    sync_status = models.CharField(max_length=10, choices=SYNC_STATUS_CHOICES, default='pending')
    sync_timestamp = models.DateTimeField(null=True, blank=True)
    
    # 충돌 해결을 위한 정보
    version = models.IntegerField(default=1)
    conflict_resolution = models.TextField(blank=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'content_type', 'timestamp']),
            models.Index(fields=['sync_status']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.content_object}"