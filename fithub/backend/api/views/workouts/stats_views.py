from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from workouts.models import WorkoutLog


class WorkoutStatsViewSet(viewsets.ViewSet):
    """
    운동 통계 ViewSet
    - 기본 통계만 제공
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def basic(self, request):
        """기본 운동 통계 (프론트엔드에서 사용)"""
        user = request.user
        
        # 전체 통계
        total_workouts = WorkoutLog.objects.filter(user=user).count()
        completed_workouts = WorkoutLog.objects.filter(user=user, is_completed=True).count()
        
        # 이번 주 통계
        week_start = timezone.now() - timedelta(days=7)
        weekly_workouts = WorkoutLog.objects.filter(
            user=user, 
            created_at__gte=week_start,
            is_completed=True
        ).count()
        
        # 이번 달 통계
        month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_workouts = WorkoutLog.objects.filter(
            user=user,
            created_at__gte=month_start,
            is_completed=True
        ).count()
        
        return Response({
            'total_workouts': total_workouts,
            'completed_workouts': completed_workouts,
            'completion_rate': round((completed_workouts / total_workouts * 100) if total_workouts > 0 else 0, 2),
            'weekly_workouts': weekly_workouts,
            'monthly_workouts': monthly_workouts
        })


 