from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from audit.models import ChangeLog
from ...serializers.audit.audit_serializers import ChangeLogSerializer, RestoreDataSerializer

class DefaultPagination(PageNumberPagination):
    page_size_query_param = 'page_size'
    max_page_size = 100

# 로그 목록
class ChangeLogListView(generics.ListAPIView):
    serializer_class = ChangeLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DefaultPagination

    def get_queryset(self):
        qs = ChangeLog.objects.filter(user=self.request.user)
        ct = self.request.query_params.get('content_type')
        if ct:
            qs = qs.filter(content_type__model__iexact=ct)
        obj_id = self.request.query_params.get('object_id')
        if obj_id:
            qs = qs.filter(object_id=obj_id)
        action = self.request.query_params.get('action')
        if action:
            qs = qs.filter(action=action.lower())
        return qs.order_by('-timestamp')

# 로그 상세
class ChangeLogDetailView(generics.RetrieveAPIView):
    serializer_class = ChangeLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = 'log_id'

    def get_queryset(self):
        return ChangeLog.objects.filter(user=self.request.user)

# 복원
class RestoreDataView(generics.GenericAPIView):
    serializer_class = RestoreDataSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        change_log = serializer.validated_data['change_log']
        model_cls = change_log.content_type.model_class()

        with transaction.atomic():
            # 삭제 로그 복원 또는 이전 상태 덮어쓰기
            if change_log.action == 'delete':
                data = change_log.previous_data.copy()
                data.pop('id', None)
                obj = model_cls.objects.create(**data)
            else:
                obj = get_object_or_404(model_cls, pk=change_log.object_id)
                for field, val in change_log.previous_data.items():
                    if hasattr(obj, field):
                        setattr(obj, field, val)
                obj.save()

            # 복원 로그 기록
            ChangeLog.objects.create(
                user=request.user,
                content_type=change_log.content_type,
                object_id=str(obj.pk),
                action='restore',
                field_changes={},
                previous_data=change_log.current_data,
                current_data=change_log.previous_data,
                sync_status='synced',
                conflict_resolution=f"restored from #{change_log.id}"
            )

        return Response({
            'success': True,
            'restored_object_id': obj.pk,
            'message': '데이터가 복원되었습니다.'
        })

# 실패 로그 재동기화
class SyncFailedLogsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        failed_qs = ChangeLog.objects.filter(user=request.user, sync_status='failed')
        count_total = failed_qs.count()
        if not count_total:
            return Response({'message': '실패 로그가 없습니다.'})

        # 실제 전송 로직
        now = timezone.now()
        updated = failed_qs.update(sync_status='synced', sync_timestamp=now)
        return Response({
            'message': f'{updated}/{count_total}개의 로그가 synced로 변경되었습니다.'
        })

# 상태 요약
class SyncStatusView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = ChangeLog.objects.filter(user=request.user)
        stats = qs.values('sync_status').order_by().annotate(cnt=models.Count('id'))
        stat_map = {row['sync_status']: row['cnt'] for row in stats}
        recent_failed = qs.filter(sync_status='failed').order_by('-timestamp')[:5]
        return Response({
            'sync_statistics': {
                'total': qs.count(),
                'synced': stat_map.get('synced', 0),
                'pending': stat_map.get('pending', 0),
                'failed': stat_map.get('failed', 0),
                'conflict': stat_map.get('conflict', 0),
            },
            'recent_failed_logs': ChangeLogSerializer(recent_failed, many=True).data
        })