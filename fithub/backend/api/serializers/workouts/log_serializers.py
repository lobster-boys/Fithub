from rest_framework import serializers
from workouts.models import WorkoutLog
from .routine_serializers import WorkoutRoutineListSerializer
from .log_exercise_serializers import WorkoutLogExerciseSerializer


class WorkoutLogSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    routine = WorkoutRoutineListSerializer(read_only=True)
    routine_id = serializers.IntegerField(write_only=True, allow_null=True, required=False)
    duration_hours = serializers.ReadOnlyField()
    exercises = WorkoutLogExerciseSerializer(source='log_exercises', many=True, read_only=True)
    
    class Meta:
        model = WorkoutLog
        fields = ['id', 'user', 'routine', 'routine_id', 'start_time', 'end_time', 
                 'duration_minutes', 'duration_hours', 'calories_burned', 'rating', 
                 'mood', 'workout_type', 'notes', 'exercises', 'created_at']
    
    def create(self, validated_data):

        return WorkoutLog.objects.create(**validated_data) 