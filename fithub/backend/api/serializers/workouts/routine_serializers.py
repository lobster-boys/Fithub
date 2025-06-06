from rest_framework import serializers
from workouts.models import WorkoutRoutine, RoutineExercise
from .exercise_serializers import ExerciseSerializer


class RoutineExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = RoutineExercise
        fields = ['id', 'exercise', 'exercise_id', 'sets', 'reps', 'order']


class WorkoutRoutineListSerializer(serializers.ModelSerializer):
    """루틴 목록용 간단한 serializer"""
    user = serializers.StringRelatedField(read_only=True)
    exercise_count = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkoutRoutine
        fields = ['id', 'name', 'description', 'user', 'difficulty_level', 
                 'estimated_duration', 'is_public', 'is_featured', 'exercise_count', 
                 'created_at']
    
    def get_exercise_count(self, obj):
        return obj.routine_exercises.count()


class WorkoutRoutineDetailSerializer(serializers.ModelSerializer):
    """루틴 상세용 serializer"""
    user = serializers.StringRelatedField(read_only=True)
    routine_exercises = RoutineExerciseSerializer(many=True, read_only=True)
    
    class Meta:
        model = WorkoutRoutine
        fields = ['id', 'name', 'description', 'user', 'difficulty_level', 
                 'estimated_duration', 'is_public', 'is_featured', 'is_template',
                 'routine_exercises', 'created_at', 'updated_at']


class WorkoutRoutineCreateUpdateSerializer(serializers.ModelSerializer):
    """루틴 생성/수정용 serializer"""
    exercises = RoutineExerciseSerializer(many=True, write_only=True, source='routine_exercises')
    
    class Meta:
        model = WorkoutRoutine
        fields = ['name', 'description', 'difficulty_level', 'estimated_duration', 
                 'is_public', 'exercises']
    
    def create(self, validated_data):
        exercises_data = validated_data.pop('routine_exercises', [])
        user = self.context['request'].user
        routine = WorkoutRoutine.objects.create(user=user, **validated_data)
        
        for exercise_data in exercises_data:
            RoutineExercise.objects.create(routine=routine, **exercise_data)
        
        return routine
    
    def update(self, instance, validated_data):
        exercises_data = validated_data.pop('routine_exercises', [])
        
        # 기본 필드 업데이트
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 기존 운동들 삭제 후 새로 생성
        instance.routine_exercises.all().delete()
        for exercise_data in exercises_data:
            RoutineExercise.objects.create(routine=instance, **exercise_data)
        
        return instance 