from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from workouts.models import WorkoutLog
from api.serializers.workouts.log_serializers import WorkoutLogSerializer
from api.permissions import IsOwnerOnly


class WorkoutLogViewSet(viewsets.ModelViewSet):
    """
    운동 로그 ViewSet
    - 개인 운동 기록: 소유자만 모든 권한
    """
    permission_classes = [IsOwnerOnly]
    
    serializer_class = WorkoutLogSerializer
    
    def get_queryset(self):
        """사용자의 운동 로그만 조회"""
        # 인증되지 않은 사용자의 경우 빈 쿼리셋 반환
        if not self.request.user.is_authenticated:
            return WorkoutLog.objects.none()
            
        user = self.request.user
        queryset = WorkoutLog.objects.filter(user=user)
        
        # 날짜 필터링 (프론트엔드에서 사용) - start_time 사용
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(start_time__date=date)
        
        # 완료 상태 필터링 제거 (WorkoutLog 모델에 is_completed 필드가 없음)
        # 대신 end_time이 있는지로 완료 여부 판단
        completed = self.request.query_params.get('completed')
        if completed is not None:
            if completed.lower() == 'true':
                queryset = queryset.filter(end_time__isnull=False)
            else:
                queryset = queryset.filter(end_time__isnull=True)
        
        return queryset.select_related('user', 'routine').prefetch_related('log_exercises').order_by('-start_time', '-created_at')

    def perform_create(self, serializer):
        """운동 로그 생성 시 현재 사용자를 자동으로 설정"""
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """운동 완료 처리 (프론트엔드에서 사용)"""
        try:
            workout_log = self.get_object()
            # end_time이 없으면 현재 시간으로 설정하여 완료 처리
            if not workout_log.end_time:
                from django.utils import timezone
                workout_log.end_time = timezone.now()
                # duration_minutes 계산
                duration = workout_log.end_time - workout_log.start_time
                workout_log.duration_minutes = int(duration.total_seconds() / 60)
                workout_log.save()
            
            serializer = WorkoutLogSerializer(workout_log)
            return Response(serializer.data)
            
        except WorkoutLog.DoesNotExist:
            return Response(
                {'error': '운동 로그를 찾을 수 없습니다.'}, 
                status=status.HTTP_404_NOT_FOUND
            ) 