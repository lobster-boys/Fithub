from rest_framework import serializers
from workouts.models import WorkoutSession, SessionExerciseLog, WorkoutRoutine, RoutineExercise
from .exercise_serializers import ExerciseSerializer
from .routine_serializers import RoutineExerciseSerializer


class SessionExerciseLogSerializer(serializers.ModelSerializer):
    """세션 운동 로그 시리얼라이저"""
    
    exercise = ExerciseSerializer(source='routine_exercise.exercise', read_only=True)
    exercise_name = serializers.CharField(source='routine_exercise.exercise.name', read_only=True)
    target_sets = serializers.IntegerField(source='routine_exercise.sets', read_only=True)
    target_reps = serializers.IntegerField(source='routine_exercise.reps', read_only=True)
    rest_time = serializers.IntegerField(source='routine_exercise.rest_time', read_only=True)
    
    class Meta:
        model = SessionExerciseLog
        fields = [
            'id', 'set_number', 'reps_completed', 'weight_used',
            'rest_start_time', 'rest_end_time', 'exercise_start_time', 
            'exercise_end_time', 'is_completed', 'notes',
            'exercise', 'exercise_name', 'target_sets', 'target_reps', 'rest_time',
            'rest_duration_seconds', 'exercise_duration_seconds'
        ]
        read_only_fields = ['rest_duration_seconds', 'exercise_duration_seconds']


class WorkoutSessionListSerializer(serializers.ModelSerializer):
    """운동 세션 목록 시리얼라이저"""
    
    routine_name = serializers.CharField(source='routine.name', read_only=True)
    current_exercise_name = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkoutSession
        fields = [
            'id', 'routine', 'routine_name', 'status', 
            'current_exercise_index', 'current_set',
            'session_start_time', 'total_duration_seconds',
            'current_exercise_name', 'progress_percentage'
        ]
        read_only_fields = ['total_duration_seconds']
    
    def get_current_exercise_name(self, obj):
        """현재 운동 이름 반환"""
        try:
            routine_exercises = obj.routine.routine_exercises.all()
            if obj.current_exercise_index < len(routine_exercises):
                return routine_exercises[obj.current_exercise_index].exercise.name
            return "완료"
        except:
            return "알 수 없음"
    
    def get_progress_percentage(self, obj):
        """진행률 계산"""
        try:
            total_exercises = obj.routine.routine_exercises.count()
            if total_exercises == 0:
                return 0
            return round((obj.current_exercise_index / total_exercises) * 100, 1)
        except:
            return 0


class WorkoutSessionDetailSerializer(serializers.ModelSerializer):
    """운동 세션 상세 시리얼라이저"""
    
    routine_name = serializers.CharField(source='routine.name', read_only=True)
    routine_exercises = RoutineExerciseSerializer(source='routine.routine_exercises', many=True, read_only=True)
    exercise_logs = SessionExerciseLogSerializer(many=True, read_only=True)
    current_exercise = serializers.SerializerMethodField()
    next_exercise = serializers.SerializerMethodField()
    total_exercises = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkoutSession
        fields = [
            'id', 'routine', 'routine_name', 'status',
            'current_exercise_index', 'current_set',
            'session_start_time', 'session_end_time',
            'total_rest_time', 'total_workout_time', 'notes',
            'total_duration_seconds', 'routine_exercises', 'exercise_logs',
            'current_exercise', 'next_exercise', 'total_exercises'
        ]
        read_only_fields = ['total_duration_seconds']
    
    def get_current_exercise(self, obj):
        """현재 운동 정보 반환"""
        try:
            routine_exercises = list(obj.routine.routine_exercises.all())
            if obj.current_exercise_index < len(routine_exercises):
                current_routine_exercise = routine_exercises[obj.current_exercise_index]
                return RoutineExerciseSerializer(current_routine_exercise).data
            return None
        except:
            return None
    
    def get_next_exercise(self, obj):
        """다음 운동 정보 반환"""
        try:
            routine_exercises = list(obj.routine.routine_exercises.all())
            next_index = obj.current_exercise_index + 1
            if next_index < len(routine_exercises):
                next_routine_exercise = routine_exercises[next_index]
                return RoutineExerciseSerializer(next_routine_exercise).data
            return None
        except:
            return None
    
    def get_total_exercises(self, obj):
        """총 운동 개수 반환"""
        return obj.routine.routine_exercises.count()


class WorkoutSessionCreateSerializer(serializers.ModelSerializer):
    """운동 세션 생성 시리얼라이저"""
    
    class Meta:
        model = WorkoutSession
        fields = ['routine']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class SessionExerciseLogCreateSerializer(serializers.ModelSerializer):
    """세션 운동 로그 생성 시리얼라이저"""
    
    class Meta:
        model = SessionExerciseLog
        fields = ['reps_completed', 'weight_used', 'notes']


class SessionControlSerializer(serializers.Serializer):
    """세션 제어 시리얼라이저"""
    
    action = serializers.ChoiceField(
        choices=['pause', 'resume', 'complete', 'cancel', 'next_exercise', 'next_set']
    )
    reps_completed = serializers.IntegerField(required=False, min_value=0)
    weight_used = serializers.FloatField(required=False, min_value=0)
    notes = serializers.CharField(required=False, allow_blank=True) 