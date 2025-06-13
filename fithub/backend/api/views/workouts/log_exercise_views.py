from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from workouts.models import WorkoutLogExercise, WorkoutLog
from api.serializers.workouts.log_exercise_serializers import (
    WorkoutLogExerciseSerializer,
    WorkoutLogExerciseCreateUpdateSerializer
)


class WorkoutLogExerciseListView(generics.ListAPIView):
    """운동 로그별 상세 운동 목록 조회"""
    serializer_class = WorkoutLogExerciseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        workout_log_id = self.kwargs.get('workout_log_id')
        return WorkoutLogExercise.objects.filter(
            workout_log_id=workout_log_id,
            workout_log__user=self.request.user
        ).select_related('exercise', 'workout_log').order_by('order')


class WorkoutLogExerciseCreateView(generics.CreateAPIView):
    """운동 로그에 상세 운동 추가"""
    serializer_class = WorkoutLogExerciseCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        workout_log_id = self.kwargs.get('workout_log_id')
        workout_log = WorkoutLog.objects.get(
            id=workout_log_id, 
            user=self.request.user
        )
        serializer.save(workout_log=workout_log)


class WorkoutLogExerciseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """운동 로그 상세 운동 조회/수정/삭제"""
    serializer_class = WorkoutLogExerciseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return WorkoutLogExercise.objects.filter(
            workout_log__user=self.request.user
        ).select_related('exercise', 'workout_log')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_create_log_exercises(request, workout_log_id):
    """여러 운동을 한번에 운동 로그에 추가"""
    try:
        workout_log = WorkoutLog.objects.get(
            id=workout_log_id, 
            user=request.user
        )
    except WorkoutLog.DoesNotExist:
        return Response(
            {'error': '운동 로그를 찾을 수 없습니다.'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    exercises_data = request.data.get('exercises', [])
    if not exercises_data:
        return Response(
            {'error': '운동 데이터가 필요합니다.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    created_exercises = []
    for exercise_data in exercises_data:
        serializer = WorkoutLogExerciseCreateUpdateSerializer(data=exercise_data)
        if serializer.is_valid():
            log_exercise = serializer.save(workout_log=workout_log)
            created_exercises.append(log_exercise)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    response_serializer = WorkoutLogExerciseSerializer(created_exercises, many=True)
    return Response(response_serializer.data, status=status.HTTP_201_CREATED) 