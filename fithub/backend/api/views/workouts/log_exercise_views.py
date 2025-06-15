from rest_framework import generics, permissions, status, serializers
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from workouts.models import WorkoutLogExercise, WorkoutLog
from api.serializers.workouts.log_exercise_serializers import (
    WorkoutLogExerciseSerializer,
    WorkoutLogExerciseCreateUpdateSerializer
)
from api.views.base import BaseViewSet, UserOwnedMixin, BulkActionMixin


class WorkoutLogExerciseViewSet(UserOwnedMixin, BulkActionMixin, BaseViewSet):
    """운동 로그별 상세 운동 ViewSet"""
    serializer_class = WorkoutLogExerciseSerializer
    permission_classes = [permissions.IsAuthenticated]
    user_field = 'workout_log__user'
    search_fields = ['exercise__name', 'notes']
    
    def get_queryset(self):
        queryset = WorkoutLogExercise.objects.select_related('exercise', 'workout_log')
        
        # 특정 운동 로그의 운동들만 조회하는 경우
        workout_log_id = self.request.query_params.get('workout_log_id')  # type: ignore
        if workout_log_id:
            queryset = queryset.filter(workout_log_id=workout_log_id)
        
        return super().get_queryset().filter(  # type: ignore
            id__in=queryset.values('id')
        ).order_by('order')
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return WorkoutLogExerciseCreateUpdateSerializer
        return WorkoutLogExerciseSerializer
    
    def perform_create(self, serializer):
        workout_log_id = self.request.data.get('workout_log_id')  # type: ignore
        if not workout_log_id:
            # URL에서 workout_log_id를 가져올 수도 있음
            workout_log_id = self.kwargs.get('workout_log_id')
        
        if workout_log_id:
            try:
                workout_log = WorkoutLog.objects.get(
                    id=workout_log_id, 
                    user=self.request.user
                )
                serializer.save(workout_log=workout_log)
            except WorkoutLog.DoesNotExist:
                raise serializers.ValidationError({'error': '운동 로그를 찾을 수 없습니다.'})
        else:
            super().perform_create(serializer)  # type: ignore
    
    @action(detail=False, methods=['post'])
    def bulk_create_exercises(self, request):
        """여러 운동을 한번에 운동 로그에 추가"""
        workout_log_id = request.data.get('workout_log_id')  # type: ignore
        if not workout_log_id:
            return Response(
                {'error': 'workout_log_id가 필요합니다.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
        
        exercises_data = request.data.get('exercises', [])  # type: ignore
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
    
    @action(detail=False, methods=['get'])
    def by_workout_log(self, request):
        """특정 운동 로그의 운동들 조회"""
        workout_log_id = request.query_params.get('workout_log_id')  # type: ignore
        if not workout_log_id:
            return Response(
                {'error': 'workout_log_id 파라미터가 필요합니다.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(workout_log_id=workout_log_id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """운동 순서 재정렬"""
        exercise_orders = request.data.get('exercise_orders', [])  # type: ignore
        if not exercise_orders:
            return Response(
                {'error': 'exercise_orders 데이터가 필요합니다.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_exercises = []
        for order_data in exercise_orders:
            exercise_id = order_data.get('id')
            new_order = order_data.get('order')
            
            if exercise_id and new_order is not None:
                try:
                    exercise = self.get_queryset().get(id=exercise_id)
                    exercise.order = new_order
                    exercise.save()
                    updated_exercises.append(exercise)
                except WorkoutLogExercise.DoesNotExist:
                    continue
        
        serializer = self.get_serializer(updated_exercises, many=True)
        return Response(serializer.data)


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