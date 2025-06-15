from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from workouts.models import WorkoutLog
from api.serializers.workouts.log_serializers import WorkoutLogSerializer


class WorkoutLogViewSet(viewsets.ModelViewSet):
    """
    운동 로그 ViewSet
    - 기본 CRUD 작업
    - 운동 완료 기능
    """
    permission_classes = [IsAuthenticated]
    
    serializer_class = WorkoutLogSerializer
    
    def get_queryset(self):
        """사용자의 운동 로그만 조회"""
        user = self.request.user
        queryset = WorkoutLog.objects.filter(user=user)
        
        # 날짜 필터링 (프론트엔드에서 사용)
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(date=date)
        
        # 완료 상태 필터링
        completed = self.request.query_params.get('completed')
        if completed is not None:
            queryset = queryset.filter(is_completed=completed.lower() == 'true')
        
        return queryset.select_related('user', 'routine').prefetch_related('log_exercises').order_by('-date', '-created_at')

    def perform_create(self, serializer):
        """운동 로그 생성 시 현재 사용자를 자동으로 설정"""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """운동 완료 처리 (프론트엔드에서 사용)"""
        try:
            workout_log = self.get_object()
            workout_log.is_completed = True
            workout_log.save()
            
            serializer = WorkoutLogSerializer(workout_log)
            return Response(serializer.data)
            
        except WorkoutLog.DoesNotExist:
            return Response(
                {'error': '운동 로그를 찾을 수 없습니다.'}, 
                status=status.HTTP_404_NOT_FOUND
            ) 