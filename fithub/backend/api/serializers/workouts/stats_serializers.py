from rest_framework import serializers


class WorkoutStatsSerializer(serializers.Serializer):
    """운동 통계용 serializer"""
    total_workouts = serializers.IntegerField()
    total_duration = serializers.IntegerField()
    total_calories = serializers.IntegerField()
    average_rating = serializers.FloatField()
    this_week_workouts = serializers.IntegerField()
    this_month_workouts = serializers.IntegerField() 