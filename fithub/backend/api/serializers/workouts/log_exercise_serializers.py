from rest_framework import serializers
from workouts.models import WorkoutLogExercise
from .exercise_serializers import ExerciseSerializer


class WorkoutLogExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.IntegerField(write_only=True)
    estimated_calories = serializers.ReadOnlyField()
    
    class Meta:
        model = WorkoutLogExercise
        fields = ['id', 'exercise', 'exercise_id', 'sets_completed', 'reps_completed', 
                 'weight_used', 'rest_time_actual', 'notes', 'order', 'estimated_calories']


class WorkoutLogExerciseCreateUpdateSerializer(serializers.ModelSerializer):
    """운동 로그 상세 생성/수정용 serializer"""
    
    class Meta:
        model = WorkoutLogExercise
        fields = ['exercise_id', 'sets_completed', 'reps_completed', 
                 'weight_used', 'rest_time_actual', 'notes', 'order'] 