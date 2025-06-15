from django.shortcuts import render
from django.db.models import Q
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from workouts.models import WorkoutRoutine, RoutineExercise
from api.serializers.workouts.routine_serializers import (
    WorkoutRoutineListSerializer, 
    WorkoutRoutineDetailSerializer,
    WorkoutRoutineCreateUpdateSerializer
)


class WorkoutRoutineViewSet(viewsets.ModelViewSet):
    """
    운동 루틴 ViewSet
    프론트엔드 요구사항에 맞춘 단순화된 버전
    - 기본 CRUD 작업
    - 루틴 복사 기능
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return WorkoutRoutineListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return WorkoutRoutineCreateUpdateSerializer
        return WorkoutRoutineDetailSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if self.action in ['update', 'partial_update', 'destroy']:
            # 수정/삭제는 본인 루틴만
            return WorkoutRoutine.objects.filter(user=user)
        
        # 기본적으로 내 루틴만 조회 (프론트엔드에서 주로 사용)
        queryset = WorkoutRoutine.objects.filter(user=user)
        
        # 난이도 필터링 (프론트엔드에서 사용)
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty_level=difficulty)
            
        return queryset.select_related('user').prefetch_related('routine_exercises')

    def perform_create(self, serializer):
        """루틴 생성 시 현재 사용자를 자동으로 설정"""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def copy(self, request, pk=None):
        """루틴 복사 (프론트엔드에서 사용)"""
        try:
            original_routine = WorkoutRoutine.objects.get(
                Q(pk=pk) & Q(user=request.user)
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