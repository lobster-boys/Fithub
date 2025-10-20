from rest_framework import serializers
from django.contrib.auth import get_user_model
from workouts.models import WorkoutRoutine, RoutineExercise
from .exercise_serializers import ExerciseSerializer
import logging

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """기본 사용자 정보 시리얼라이저"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']
        read_only_fields = ['id', 'username', 'first_name', 'last_name']
        ref_name = 'RoutineExerciseUserBasic'


class RoutineExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.IntegerField(write_only=True)
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)
    target_sets = serializers.IntegerField(source='sets', read_only=True)
    target_reps = serializers.IntegerField(source='reps', read_only=True)
    
    class Meta:
        model = RoutineExercise
        fields = ['id', 'exercise', 'exercise_id', 'sets', 'reps', 'rest_time', 
                 'max_exercise_time', 'order', 'exercise_name', 'target_sets', 'target_reps']


class WorkoutRoutineListSerializer(serializers.ModelSerializer):
    """루틴 목록용 serializer"""
    user = UserBasicSerializer(read_only=True)
    exercise_count = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    
    # 운동 목록도 포함 (목록에서도 운동 정보가 필요함)
    routine_exercises = RoutineExerciseSerializer(many=True, read_only=True)
    
    # 복사된 루틴 정보 추가
    is_copied = serializers.SerializerMethodField()
    original_author = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkoutRoutine
        fields = ['id', 'name', 'description', 'user', 'difficulty_level', 
                 'estimated_duration', 'target_muscle_groups', 'is_public', 'is_featured',
                 'exercise_count', 'average_rating', 'created_at', 'is_copied', 'original_author',
                 'routine_exercises']
        read_only_fields = ['id', 'user', 'exercise_count', 'average_rating', 'created_at']

    def get_is_copied(self, obj):
        """복사된 루틴인지 여부"""
        return obj.copied_from is not None

    def get_original_author(self, obj):
        """원본 작성자 (복사된 루틴인 경우)"""
        if obj.copied_from and obj.copied_from.user:
            return obj.copied_from.user.username
        return None


class WorkoutRoutineDetailSerializer(serializers.ModelSerializer):
    """루틴 상세 조회용 serializer"""
    exercises = RoutineExerciseSerializer(source='routine_exercises', many=True, read_only=True)
    routine_exercises = RoutineExerciseSerializer(many=True, read_only=True)  # 일관성을 위해 추가
    user = UserBasicSerializer(read_only=True)
    exercise_count = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    estimated_calories = serializers.ReadOnlyField()
    
    # 복사된 루틴 관련 필드 추가
    copied_from = serializers.SerializerMethodField()
    is_copied = serializers.SerializerMethodField()
    original_author = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkoutRoutine
        fields = ['id', 'name', 'description', 'difficulty_level', 'estimated_duration',
                 'target_muscle_groups', 'is_public', 'is_featured', 'is_template',
                 'usage_count', 'average_rating', 'exercises', 'routine_exercises', 'user', 'exercise_count',
                 'estimated_calories', 'created_at', 'updated_at', 'copied_from', 
                 'is_copied', 'original_author']
        read_only_fields = ['id', 'user', 'usage_count', 'created_at', 'updated_at']

    def get_copied_from(self, obj):
        """원본 루틴 ID 반환"""
        if obj.copied_from:
            return {
                'id': obj.copied_from.id,
                'name': obj.copied_from.name,
                'author': obj.copied_from.user.username
            }
        return None

    def get_is_copied(self, obj):
        """복사된 루틴인지 여부"""
        return obj.copied_from is not None

    def get_original_author(self, obj):
        """원본 작성자 (복사된 루틴인 경우)"""
        if obj.copied_from and obj.copied_from.user:
            return obj.copied_from.user.username
        return None


class WorkoutRoutineCreateUpdateSerializer(serializers.ModelSerializer):
    """루틴 생성/수정용 serializer"""
    exercises = serializers.ListField(write_only=True, child=serializers.DictField(), required=False)
    routine_exercises = serializers.ListField(write_only=True, child=serializers.DictField(), required=False)
    
    class Meta:
        model = WorkoutRoutine
        fields = ['name', 'description', 'difficulty_level', 'estimated_duration', 
                 'is_public', 'exercises', 'routine_exercises']
    
    def create(self, validated_data):
        from workouts.models import Exercise
        
        logger = logging.getLogger(__name__)
        logger.info(f"루틴 생성 시작: {validated_data}")
        
        # exercises 또는 routine_exercises 중 하나를 사용
        exercises_data = validated_data.pop('exercises', []) or validated_data.pop('routine_exercises', [])
        logger.info(f"운동 데이터: {exercises_data}")
        
        # user는 perform_create에서 이미 전달되므로 validated_data에서 가져오기
        routine = WorkoutRoutine.objects.create(**validated_data)
        logger.info(f"루틴 생성 완료: ID={routine.id}")
        
        for idx, exercise_data in enumerate(exercises_data):
            logger.info(f"운동 {idx + 1} 처리 중: {exercise_data}")
            
            exercise_id = exercise_data.get('exercise_id')
            exercise_name = exercise_data.get('exercise_name')
            
            # exercise_id가 있으면 해당 운동 사용, 없으면 이름으로 찾기
            if exercise_id:
                try:
                    exercise = Exercise.objects.get(id=exercise_id)
                    logger.info(f"운동 ID {exercise_id}로 찾음: {exercise.name}")
                except Exercise.DoesNotExist:
                    logger.warning(f"운동 ID {exercise_id}를 찾을 수 없음, 이름으로 생성: {exercise_name}")
                    # ID로 찾을 수 없으면 이름으로 찾기
                    exercise, created = Exercise.objects.get_or_create(
                        name=exercise_name or f'운동 {idx + 1}',
                        defaults={
                            'muscle_groups': '전신',
                            'difficulty_level': 'beginner'
                        }
                    )
                    if created:
                        logger.info(f"새 운동 생성: {exercise.name}")
            else:
                # 운동 이름으로 찾거나 생성
                exercise_name = exercise_name or f'운동 {idx + 1}'
                exercise, created = Exercise.objects.get_or_create(
                    name=exercise_name,
                    defaults={
                        'muscle_groups': '전신',
                        'difficulty_level': 'beginner'
                    }
                )
                if created:
                    logger.info(f"새 운동 생성: {exercise.name}")
                else:
                    logger.info(f"기존 운동 사용: {exercise.name}")
            
            try:
                routine_exercise = RoutineExercise.objects.create(
                    routine=routine,
                    exercise=exercise,
                    sets=exercise_data.get('sets', 3),
                    reps=exercise_data.get('reps', 10),
                    order=exercise_data.get('order', idx + 1)
                )
                logger.info(f"RoutineExercise 생성 완료: {routine_exercise.id}")
            except Exception as e:
                logger.error(f"RoutineExercise 생성 실패: {str(e)}")
                raise
        
        logger.info(f"루틴 생성 전체 완료: {routine.name}")
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