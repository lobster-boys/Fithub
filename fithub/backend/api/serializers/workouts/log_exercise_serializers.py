from rest_framework import serializers
from workouts.models import WorkoutLogExercise, Exercise
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
    exercise_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = WorkoutLogExercise
        fields = ['exercise_id', 'exercise_name', 'sets_completed', 'reps_completed', 
                 'weight_used', 'rest_time_actual', 'notes', 'order']
    
    def validate(self, data):
        exercise_name = data.get('exercise_name')
        exercise_id = data.get('exercise_id')
        
        if not exercise_name and not exercise_id:
            raise serializers.ValidationError('exercise_name 또는 exercise_id 중 하나는 필수입니다.')
        
        if exercise_name and not exercise_id:
            try:
                exercise = Exercise.objects.get(name=exercise_name)
                data['exercise_id'] = exercise.id
            except Exercise.DoesNotExist:
                # 운동이 없으면 새로 생성
                exercise = Exercise.objects.create(
                    name=exercise_name,
                    muscle_groups='사용자 정의',
                    difficulty_level='beginner'
                )
                data['exercise_id'] = exercise.id
        
        # exercise_name은 저장하지 않음
        data.pop('exercise_name', None)
        return data 