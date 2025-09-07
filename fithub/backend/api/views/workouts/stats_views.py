from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from workouts.models import WorkoutLog


class WorkoutStatsViewSet(viewsets.ViewSet):
    """
    운동 통계 ViewSet
    - 기본 통계만 제공
    """
    permission_classes = [IsAuthenticated]  # 인증된 사용자만

    @action(detail=False, methods=['get'])
    def basic(self, request):
        """기본 운동 통계 (프론트엔드에서 사용)"""
        # 인증되지 않은 사용자의 경우 기본값 반환
        if not request.user.is_authenticated:
            return Response({
                'total_workouts': 0,
                'completed_workouts': 0,
                'completion_rate': 0,
                'total_duration_minutes': 0,
                'total_calories_burned': 0,
                'average_rating': 0,
                'weekly_workouts': 0,
                'current_streak': 0
            })
        
        user = request.user
        
        # 전체 운동 로그 기준으로 통계 계산
        total_workouts = WorkoutLog.objects.filter(user=user).count()
        
        # 완료된 운동 (end_time이 있는 것)
        completed_workouts = WorkoutLog.objects.filter(user=user, end_time__isnull=False).count()  
        completion_rate = (completed_workouts / total_workouts * 100) if total_workouts > 0 else 0
        
        # 완료된 운동들의 통계
        completed_logs = WorkoutLog.objects.filter(user=user, end_time__isnull=False)
        
        total_duration = completed_logs.aggregate(total=Sum('duration_minutes'))['total'] or 0
        total_calories = completed_logs.aggregate(total=Sum('calories_burned'))['total'] or 0
        avg_rating = completed_logs.aggregate(avg=Avg('rating'))['avg'] or 0
        
        # 최근 7일간 운동 횟수
        week_ago = timezone.now() - timedelta(days=7)
        weekly_workouts = WorkoutLog.objects.filter(
            user=user, 
            end_time__isnull=False,
            start_time__gte=week_ago
        ).count()
        
        # 현재 연속 운동일 계산 (간단화)
        current_streak = self._calculate_current_streak(user)
        
        return Response({
            'total_workouts': total_workouts,
            'completed_workouts': completed_workouts,
            'completion_rate': round(completion_rate, 1),
            'total_duration_minutes': total_duration,
            'total_calories_burned': total_calories,
            'average_rating': round(avg_rating, 1) if avg_rating else 0,
            'weekly_workouts': weekly_workouts,
            'current_streak': current_streak
        })

    def _calculate_current_streak(self, user):
        """현재 연속 운동일 계산 (간단한 버전)"""
        try:
            # 최근 완료된 운동들의 날짜 조회
            recent_dates = WorkoutLog.objects.filter(
                user=user, 
                end_time__isnull=False
            ).values_list('start_time__date', flat=True).distinct().order_by('-start_time__date')[:30]
            
            if not recent_dates:
                return 0
            
            streak = 0
            today = timezone.now().date()
            
            for workout_date in recent_dates:
                expected_date = today - timedelta(days=streak)
                if workout_date == expected_date:
                    streak += 1
                else:
                    break
            
            return streak
        except Exception:
            return 0


 