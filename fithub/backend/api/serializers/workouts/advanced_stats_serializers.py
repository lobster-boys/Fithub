from rest_framework import serializers


class AdvancedWorkoutStatsSerializer(serializers.Serializer):
    """확장된 운동 통계용 serializer"""
    # 기본 통계
    total_workouts = serializers.IntegerField()
    total_duration = serializers.IntegerField()
    total_calories = serializers.IntegerField()
    average_rating = serializers.FloatField()
    this_week_workouts = serializers.IntegerField()
    this_month_workouts = serializers.IntegerField()
    
    # 연속 운동일
    current_streak_days = serializers.IntegerField()
    max_streak_days = serializers.IntegerField()
    
    # 운동 타입별 분포
    workout_type_distribution = serializers.DictField(child=serializers.IntegerField())
    
    # 목표 달성률
    monthly_goal_completion = serializers.FloatField()
    
    # 주간 운동 패턴
    weekly_pattern = serializers.DictField(child=serializers.IntegerField())
    
    # 월별 추세
    monthly_trend = serializers.ListField(child=serializers.DictField())


class WorkoutStreakSerializer(serializers.Serializer):
    """연속 운동일 관련 serializer"""
    current_streak_days = serializers.IntegerField()
    max_streak_days = serializers.IntegerField()
    last_workout_date = serializers.DateField()
    next_milestone = serializers.IntegerField()


class WorkoutTypeDistributionSerializer(serializers.Serializer):
    """운동 타입별 분포 serializer"""
    workout_type = serializers.CharField()
    count = serializers.IntegerField()
    percentage = serializers.FloatField()
    total_duration = serializers.IntegerField()
    total_calories = serializers.IntegerField() 