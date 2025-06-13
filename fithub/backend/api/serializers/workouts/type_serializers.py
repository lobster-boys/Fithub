from rest_framework import serializers
from workouts.models import WorkoutType


class WorkoutTypeSerializer(serializers.ModelSerializer):
    """운동 타입 serializer"""
    
    class Meta:
        model = WorkoutType
        fields = ['id', 'name', 'description', 'color_code', 'icon']


class WorkoutTypeSimpleSerializer(serializers.ModelSerializer):
    """운동 타입 간단 serializer"""
    display_name = serializers.CharField(source='get_name_display', read_only=True)
    
    class Meta:
        model = WorkoutType
        fields = ['name', 'display_name', 'color_code'] 