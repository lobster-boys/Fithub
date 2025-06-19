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
    exercises = serializers.ListField(write_only=True, child=serializers.DictField())
    
    class Meta:
        model = WorkoutRoutine
        fields = ['name', 'description', 'difficulty_level', 'estimated_duration', 
                 'is_public', 'exercises']
    
    def create(self, validated_data):
        from workouts.models import Exercise
        
        exercises_data = validated_data.pop('exercises', [])
        
        # user는 perform_create에서 이미 전달되므로 validated_data에서 가져오기
        routine = WorkoutRoutine.objects.create(**validated_data)
        
        for idx, exercise_data in enumerate(exercises_data):
            exercise_id = exercise_data.get('exercise_id')
            exercise_name = exercise_data.get('exercise_name')
            
            # exercise_id가 있으면 해당 운동 사용, 없으면 이름으로 찾기
            if exercise_id:
                try:
                    exercise = Exercise.objects.get(id=exercise_id)
                except Exercise.DoesNotExist:
                    # ID로 찾을 수 없으면 이름으로 찾기
                    exercise, created = Exercise.objects.get_or_create(
                        name=exercise_name,
                        defaults={
                            'muscle_groups': '전신',
                            'difficulty_level': 'beginner'
                        }
                    )
            else:
                # 운동 이름으로 찾거나 생성
                exercise, created = Exercise.objects.get_or_create(
                    name=exercise_name,
                    defaults={
                        'muscle_groups': '전신',
                        'difficulty_level': 'beginner'
                    }
                )
            
            RoutineExercise.objects.create(
                routine=routine,
                exercise=exercise,
                sets=exercise_data.get('sets', 3),
                reps=exercise_data.get('reps', 10),
                order=exercise_data.get('order', idx + 1)
            )
        
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