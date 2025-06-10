from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta, date
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from workouts.models import WorkoutLog, WorkoutStats
from api.serializers.workouts.advanced_stats_serializers import (
    AdvancedWorkoutStatsSerializer,
    WorkoutStreakSerializer,
    WorkoutTypeDistributionSerializer
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def advanced_workout_stats_view(request):
    """확장된 운동 통계 조회"""
    user = request.user
    
    # 기본 통계
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
    
    # 이번 주/달 통계
    week_start = timezone.now() - timedelta(days=7)
    month_start = timezone.now() - timedelta(days=30)
    
    this_week_workouts = WorkoutLog.objects.filter(
        user=user, start_time__gte=week_start
    ).count()
    this_month_workouts = WorkoutLog.objects.filter(
        user=user, start_time__gte=month_start
    ).count()
    
    # 연속 운동일 계산
    workout_stats, created = WorkoutStats.objects.get_or_create(user=user)
    if created or not workout_stats.updated_at or \
       (timezone.now() - workout_stats.updated_at).days > 0:
        workout_stats.update_stats()
    
    # 운동 타입별 분포
    workout_type_distribution = {}
    type_stats = WorkoutLog.objects.filter(user=user).values('workout_type').annotate(
        count=Count('workout_type')
    )
    for stat in type_stats:
        workout_type_distribution[stat['workout_type']] = stat['count']
    
    # 월간 목표 달성률
    monthly_goal = 20
    monthly_goal_completion = min((this_month_workouts / monthly_goal) * 100, 100) if monthly_goal > 0 else 0
    
    # 주간 운동 패턴 (요일별)
    weekly_pattern = {}
    week_logs = WorkoutLog.objects.filter(user=user, start_time__gte=week_start)
    for log in week_logs:
        weekday = log.start_time.strftime('%A')
        weekly_pattern[weekday] = weekly_pattern.get(weekday, 0) + 1
    
    # 월별 추세 (최근 6개월)
    monthly_trend = []
    for i in range(6):
        month_date = timezone.now() - timedelta(days=30*i)
        month_start_calc = month_date.replace(day=1)
        month_end = (month_start_calc + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_workouts = WorkoutLog.objects.filter(
            user=user,
            start_time__gte=month_start_calc,
            start_time__lte=month_end
        ).count()
        
        monthly_trend.append({
            'month': month_date.strftime('%Y-%m'),
            'workouts': month_workouts
        })
    
    stats_data = {
        'total_workouts': total_workouts,
        'total_duration': total_duration,
        'total_calories': total_calories,
        'average_rating': round(average_rating, 1),
        'this_week_workouts': this_week_workouts,
        'this_month_workouts': this_month_workouts,
        'current_streak_days': workout_stats.current_streak_days,
        'max_streak_days': workout_stats.max_streak_days,
        'workout_type_distribution': workout_type_distribution,
        'monthly_goal_completion': round(monthly_goal_completion, 1),
        'weekly_pattern': weekly_pattern,
        'monthly_trend': monthly_trend,
    }
    
    serializer = AdvancedWorkoutStatsSerializer(stats_data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def workout_streak_view(request):
    """연속 운동일 상세 조회"""
    user = request.user
    
    workout_stats, created = WorkoutStats.objects.get_or_create(user=user)
    if created or not workout_stats.updated_at:
        workout_stats.update_stats()
    
    # 다음 마일스톤 계산
    milestones = [7, 14, 30, 50, 100, 365]
    next_milestone = None
    for milestone in milestones:
        if workout_stats.current_streak_days < milestone:
            next_milestone = milestone
            break
    
    streak_data = {
        'current_streak_days': workout_stats.current_streak_days,
        'max_streak_days': workout_stats.max_streak_days,
        'last_workout_date': workout_stats.last_workout_date,
        'next_milestone': next_milestone or 365
    }
    
    serializer = WorkoutStreakSerializer(streak_data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def workout_type_distribution_view(request):
    """운동 타입별 분포 상세 조회"""
    user = request.user
    
    total_workouts = WorkoutLog.objects.filter(user=user).count()
    
    type_stats = WorkoutLog.objects.filter(user=user).values('workout_type').annotate(
        count=Count('workout_type'),
        total_duration=Sum('duration_minutes'),
        total_calories=Sum('calories_burned')
    )
    
    distribution_data = []
    for stat in type_stats:
        percentage = (stat['count'] / total_workouts * 100) if total_workouts > 0 else 0
        distribution_data.append({
            'workout_type': stat['workout_type'],
            'count': stat['count'],
            'percentage': round(percentage, 1),
            'total_duration': stat['total_duration'] or 0,
            'total_calories': stat['total_calories'] or 0
        })
    
    serializer = WorkoutTypeDistributionSerializer(distribution_data, many=True)
    return Response(serializer.data) 