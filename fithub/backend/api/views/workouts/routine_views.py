from django.shortcuts import render
from django.db.models import Q
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from workouts.models import WorkoutRoutine, RoutineExercise
from api.serializers.workouts.routine_serializers import (
    WorkoutRoutineListSerializer, 
    WorkoutRoutineDetailSerializer,
    WorkoutRoutineCreateUpdateSerializer
)


# Workout Routine Views
class WorkoutRoutineListView(generics.ListAPIView):
    """운동 루틴 목록 조회"""
    serializer_class = WorkoutRoutineListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        show_type = self.request.query_params.get('type', 'my')
        
        if show_type == 'public':
            # 공개 루틴들
            queryset = WorkoutRoutine.objects.filter(is_public=True)
        elif show_type == 'featured':
            # 추천 루틴들
            queryset = WorkoutRoutine.objects.filter(is_featured=True)
        elif show_type == 'template':
            # 템플릿 루틴들
            queryset = WorkoutRoutine.objects.filter(is_template=True)
        else:
            # 내 루틴들
            queryset = WorkoutRoutine.objects.filter(user=user)
        
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty_level=difficulty)
            
        return queryset.select_related('user').prefetch_related('routine_exercises')


class WorkoutRoutineDetailView(generics.RetrieveAPIView):
    """운동 루틴 상세 조회"""
    serializer_class = WorkoutRoutineDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return WorkoutRoutine.objects.filter(
            Q(user=user) | Q(is_public=True) | Q(is_featured=True) | Q(is_template=True)
        ).select_related('user').prefetch_related('routine_exercises__exercise')


class WorkoutRoutineCreateView(generics.CreateAPIView):
    """운동 루틴 생성"""
    serializer_class = WorkoutRoutineCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]


class WorkoutRoutineUpdateView(generics.UpdateAPIView):
    """운동 루틴 수정"""
    serializer_class = WorkoutRoutineCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return WorkoutRoutine.objects.filter(user=self.request.user)


class WorkoutRoutineDeleteView(generics.DestroyAPIView):
    """운동 루틴 삭제"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return WorkoutRoutine.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def copy_routine_view(request, pk):
    """루틴 복사"""
    try:
        original_routine = WorkoutRoutine.objects.get(
            Q(pk=pk) & (Q(is_public=True) | Q(is_featured=True) | Q(is_template=True) | Q(user=request.user))
        )
        
        # 새 루틴 생성
        new_routine = WorkoutRoutine.objects.create(
            user=request.user,
            name=f"{original_routine.name} (복사본)",
            description=original_routine.description,
            difficulty_level=original_routine.difficulty_level,
            estimated_duration=original_routine.estimated_duration,
            is_public=False
        )
        
        # 운동들 복사
        for routine_exercise in original_routine.routine_exercises.all():
            RoutineExercise.objects.create(
                routine=new_routine,
                exercise=routine_exercise.exercise,
                sets=routine_exercise.sets,
                reps=routine_exercise.reps,
                order=routine_exercise.order
            )
        
        serializer = WorkoutRoutineDetailSerializer(new_routine)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except WorkoutRoutine.DoesNotExist:
        return Response(
            {'error': '루틴을 찾을 수 없습니다.'}, 
            status=status.HTTP_404_NOT_FOUND
        ) 