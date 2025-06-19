from django.shortcuts import render
from django.db.models import Q
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from workouts.models import WorkoutRoutine, RoutineExercise
from api.serializers.workouts.routine_serializers import (
    WorkoutRoutineListSerializer, 
    WorkoutRoutineDetailSerializer,
    WorkoutRoutineCreateUpdateSerializer
)
from api.permissions import IsOwnerOnly


class WorkoutRoutineViewSet(viewsets.ModelViewSet):
    """
    운동 루틴 ViewSet
    - 공개 루틴: 모든 사용자 조회 가능
    - 개인 루틴: 소유자만 모든 권한
    """
    
    def get_permissions(self):
        """액션에 따른 권한 설정"""
        if self.action == 'list':
            # 목록 조회는 인증 없이도 가능 (공개 루틴만 조회)
            permission_classes = [permissions.AllowAny]
        elif self.action == 'retrieve':
            # 상세 조회는 공개 루틴이면 인증 없이도 가능
            permission_classes = [permissions.AllowAny]
        else:
            # 생성, 수정, 삭제는 인증 필요
            permission_classes = [IsAuthenticated, IsOwnerOnly]
        
        return [permission() for permission in permission_classes]
    
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
            if user.is_authenticated:
                return WorkoutRoutine.objects.filter(user=user)
            else:
                return WorkoutRoutine.objects.none()
        
        # 기본 queryset 설정
        if user.is_authenticated:
            # 인증된 사용자: 내 루틴 + 공개 루틴
            is_public = self.request.query_params.get('is_public')
            if is_public == 'true':
                queryset = WorkoutRoutine.objects.filter(is_public=True)
            else:
                queryset = WorkoutRoutine.objects.filter(
                    Q(user=user) | Q(is_public=True)
                )
        else:
            # 비인증 사용자: 공개 루틴만
            queryset = WorkoutRoutine.objects.filter(is_public=True)
        
        # 난이도 필터링
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty_level=difficulty)
        
        # 피처드 루틴 필터링    
        is_featured = self.request.query_params.get('is_featured')
        if is_featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # 제한 개수
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                limit = int(limit)
                queryset = queryset[:limit]
            except ValueError:
                pass
            
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