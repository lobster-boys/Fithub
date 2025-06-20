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
import logging

logger = logging.getLogger(__name__)


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
                # 공개 루틴만
                queryset = WorkoutRoutine.objects.filter(is_public=True)
            elif is_public == 'false':
                # 사용자의 개인 루틴만 (공개/비공개 모두 포함하되 자신의 것만)
                queryset = WorkoutRoutine.objects.filter(user=user)
            else:
                # 기본: 내 루틴 + 공개 루틴
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

    def create(self, request, *args, **kwargs):
        """루틴 생성 - 상세 정보 포함하여 반환"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 루틴 생성
        routine = serializer.save(user=request.user)
        
        # 상세 정보로 다시 조회하여 운동 목록 포함해서 반환
        detail_serializer = WorkoutRoutineDetailSerializer(routine)
        headers = self.get_success_headers(detail_serializer.data)
        
        logger.info(f"루틴 생성 API 완료: ID={routine.id}, 운동 개수={routine.routine_exercises.count()}")
        
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        """루틴 삭제 - 커스텀 에러 처리"""
        try:
            instance = self.get_object()
            logger.info(f"루틴 삭제 시도: ID={instance.id}, 사용자={request.user.username}, 소유자={instance.user.username}")
            
            # 권한 확인: 루틴의 소유자이거나 관리자만 삭제 가능
            if instance.user != request.user and not request.user.is_staff:
                logger.warning(f"권한 없는 삭제 시도: 사용자={request.user.username}, 루틴 소유자={instance.user.username}")
                return Response(
                    {'error': '이 루틴을 삭제할 권한이 없습니다.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # 복사된 루틴인지 확인 (로깅용)
            if instance.copied_from:
                logger.info(f"복사된 루틴 삭제: 원본 루틴 ID={instance.copied_from.id}")
            
            # 관련된 RoutineExercise들 먼저 삭제
            routine_exercises_count = instance.routine_exercises.count()
            logger.info(f"삭제할 루틴 운동 개수: {routine_exercises_count}")
            
            # 삭제 실행
            self.perform_destroy(instance)
            logger.info(f"루틴 삭제 완료: ID={kwargs.get('pk')}")
            
            return Response(
                {'message': '루틴이 성공적으로 삭제되었습니다.'}, 
                status=status.HTTP_204_NO_CONTENT
            )
            
        except Exception as e:
            logger.error(f"루틴 삭제 중 에러 발생: {str(e)}", exc_info=True)
            return Response(
                {'error': f'루틴 삭제 중 오류가 발생했습니다: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def copy(self, request, pk=None):
        """루틴 복사 (프론트엔드에서 사용)"""
        try:
            # 원본 루틴 조회 (공개 루틴이거나 자신의 루틴만 복사 가능)
            original_routine = self.get_object()
            
            # 공개 루틴이 아니고 본인 루틴도 아닌 경우 권한 확인
            if not original_routine.is_public and original_routine.user != request.user:
                return Response(
                    {'error': '이 루틴을 복사할 권한이 없습니다.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # 새 루틴 생성 (원본 정보 포함)
            new_routine = WorkoutRoutine.objects.create(
                user=request.user,
                name=f"{original_routine.name} (복사본)",
                description=original_routine.description,
                difficulty_level=original_routine.difficulty_level,
                estimated_duration=original_routine.estimated_duration,
                target_muscle_groups=original_routine.target_muscle_groups,
                is_public=False,  # 복사된 루틴은 기본적으로 비공개
                copied_from=original_routine  # 원본 루틴 설정
            )
            
            # 운동들 복사
            for routine_exercise in original_routine.routine_exercises.all():
                RoutineExercise.objects.create(
                    routine=new_routine,
                    exercise=routine_exercise.exercise,
                    sets=routine_exercise.sets,
                    reps=routine_exercise.reps,
                    weight=routine_exercise.weight,
                    rest_time=routine_exercise.rest_time,
                    order=routine_exercise.order,
                    notes=routine_exercise.notes
                )
            
            logger.info(f"루틴 복사 완료: 원본={original_routine.id}, 복사본={new_routine.id}, 사용자={request.user.username}")
            
            serializer = WorkoutRoutineDetailSerializer(new_routine)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except WorkoutRoutine.DoesNotExist:
            return Response(
                {'error': '루틴을 찾을 수 없습니다.'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def toggle_public(self, request, pk=None):
        """루틴 공개 상태 토글"""
        try:
            routine = self.get_object()
            
            # 권한 확인: 루틴의 소유자만 공개 상태 변경 가능
            if routine.user != request.user:
                return Response(
                    {'error': '이 루틴의 공개 상태를 변경할 권한이 없습니다.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # 공개 상태 토글
            routine.is_public = not routine.is_public
            routine.save()
            
            logger.info(f"루틴 공개 상태 변경: ID={routine.id}, 사용자={request.user.username}, 공개상태={routine.is_public}")
            
            return Response({
                'id': routine.id,
                'is_public': routine.is_public,
                'message': f'루틴이 {"공개" if routine.is_public else "비공개"}로 변경되었습니다.'
            }, status=status.HTTP_200_OK)
            
        except WorkoutRoutine.DoesNotExist:
            return Response(
                {'error': '루틴을 찾을 수 없습니다.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"루틴 공개 상태 토글 중 에러 발생: {str(e)}", exc_info=True)
            return Response(
                {'error': f'공개 상태 변경 중 오류가 발생했습니다: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 