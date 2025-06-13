from django.shortcuts import render
from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from workouts.models import WorkoutLog
from api.serializers.workouts.stats_serializers import WorkoutStatsSerializer


# Statistics Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def workout_stats_view(request):
    """운동 통계 조회"""
    user = request.user
    
    # 전체 통계
    total_workouts = WorkoutLog.objects.filter(user=user).count()
    total_duration = WorkoutLog.objects.filter(user=user).aggregate(
        total=Sum('duration_minutes')
    )['total'] or 0
    total_calories = WorkoutLog.objects.filter(user=user).aggregate(
        total=Sum('calories_burned')
    )['total'] or 0
    average_rating = WorkoutLog.objects.filter(user=user).aggregate(
        avg=Avg('rating')
    )['avg'] or 0
    
    # 이번 주 통계
    week_start = timezone.now() - timedelta(days=7)
    this_week_workouts = WorkoutLog.objects.filter(
        user=user, 
        start_time__gte=week_start
    ).count()
    
    # 이번 달 통계
    month_start = timezone.now() - timedelta(days=30)
    this_month_workouts = WorkoutLog.objects.filter(
        user=user, 
        start_time__gte=month_start
    ).count()
    
    stats_data = {
        'total_workouts': total_workouts,
        'total_duration': total_duration,
        'total_calories': total_calories,
        'average_rating': round(average_rating, 1),
        'this_week_workouts': this_week_workouts,
        'this_month_workouts': this_month_workouts,
    }
    
    serializer = WorkoutStatsSerializer(stats_data)
    return Response(serializer.data) 