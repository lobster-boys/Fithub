from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.views.base import BaseViewSet
from api.serializers.onboarding.onboarding_serializers import (
    OnboardingDataSerializer,
    OnboardingStatusSerializer,
    OnboardingResponseSerializer
)
from users.models import UserProfile
from onboarding.models import OnboardingData, OnboardingHistory
from django.utils import timezone
from django.db import transaction
import json


class OnboardingViewSet(BaseViewSet):
    """
    온보딩 관련 API ViewSet
    사용자의 온보딩 데이터 저장, 조회, 업데이트 기능 제공
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return OnboardingData.objects.filter(user=self.request.user)
    
    def list(self, request):
        """기본 list 액션 비활성화"""
        return Response(
            {'detail': '이 액션은 지원되지 않습니다. /onboarding/data/를 사용하세요.'}, 
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def create(self, request):
        """기본 create 액션 비활성화"""
        return Response(
            {'detail': '이 액션은 지원되지 않습니다. /onboarding/save/를 사용하세요.'}, 
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def retrieve(self, request, pk=None):
        """기본 retrieve 액션 비활성화"""
        return Response(
            {'detail': '이 액션은 지원되지 않습니다. /onboarding/data/를 사용하세요.'}, 
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def update(self, request, pk=None):
        """기본 update 액션 비활성화"""
        return Response(
            {'detail': '이 액션은 지원되지 않습니다. /onboarding/update/를 사용하세요.'}, 
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def destroy(self, request, pk=None):
        """기본 destroy 액션 비활성화"""
        return Response(
            {'detail': '이 액션은 지원되지 않습니다. /onboarding/reset/을 사용하세요.'}, 
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    @action(detail=False, methods=['get'])
    def data(self, request):
        """현재 사용자의 온보딩 데이터 조회"""
        try:
            onboarding_data = OnboardingData.objects.get(user=request.user)
            
            response_data = {
                'completed': onboarding_data.completed,
                'completed_at': onboarding_data.completed_at,
                'data': {
                    'fitness_level': onboarding_data.fitness_level,
                    'height': onboarding_data.height,
                    'weight': str(onboarding_data.weight),
                    'age': onboarding_data.age,
                    'goals': onboarding_data.goals,
                    'methods': onboarding_data.methods,
                    'equipment': onboarding_data.equipment,
                    'bmi': onboarding_data.bmi,
                    'created_at': onboarding_data.created_at,
                    'updated_at': onboarding_data.updated_at,
                }
            }
            
            serializer = OnboardingResponseSerializer(response_data)
            return Response(serializer.data)
                
        except OnboardingData.DoesNotExist:
            response_data = {
                'completed': False,
                'completed_at': None,
                'data': None,
                'message': '온보딩을 아직 완료하지 않았습니다.'
            }
            serializer = OnboardingResponseSerializer(response_data)
            return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def save(self, request):
        """온보딩 데이터 저장"""
        try:
            # 시리얼라이저로 데이터 검증
            serializer = OnboardingDataSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {'errors': serializer.errors}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            validated_data = serializer.validated_data
            
            with transaction.atomic():
                # 기존 온보딩 데이터가 있는지 확인
                onboarding_data, created = OnboardingData.objects.get_or_create(
                    user=request.user,
                    defaults={
                        'fitness_level': validated_data['fitness_level'],
                        'height': validated_data['height'],
                        'weight': validated_data['weight'],
                        'age': validated_data['age'],
                        'goals': validated_data['goals'],
                        'methods': validated_data['methods'],
                        'equipment': validated_data.get('equipment', []),
                        'completed': True,
                        'completed_at': timezone.now()
                    }
                )
                
                if not created:
                    # 기존 데이터가 있으면 업데이트
                    old_data = {
                        'fitness_level': onboarding_data.fitness_level,
                        'height': onboarding_data.height,
                        'weight': str(onboarding_data.weight),
                        'age': onboarding_data.age,
                        'goals': onboarding_data.goals,
                        'methods': onboarding_data.methods,
                        'equipment': onboarding_data.equipment,
                    }
                    
                    # 변경 이력 저장
                    OnboardingHistory.objects.create(
                        user=request.user,
                        previous_data=old_data,
                        new_data=validated_data,
                        change_reason='온보딩 재수행'
                    )
                    
                    # 데이터 업데이트
                    onboarding_data.fitness_level = validated_data['fitness_level']
                    onboarding_data.height = validated_data['height']
                    onboarding_data.weight = validated_data['weight']
                    onboarding_data.age = validated_data['age']
                    onboarding_data.goals = validated_data['goals']
                    onboarding_data.methods = validated_data['methods']
                    onboarding_data.equipment = validated_data.get('equipment', [])
                    onboarding_data.completed = True
                    onboarding_data.completed_at = timezone.now()
                    onboarding_data.save()
                
                # UserProfile도 동시에 업데이트
                profile, _ = UserProfile.objects.get_or_create(user=request.user)
                profile.height = validated_data['height']
                profile.weight = validated_data['weight']
                profile.onboarding_completed = True
                profile.onboarding_completed_at = timezone.now()
                profile.onboarding_data = {
                    'fitness_level': validated_data['fitness_level'],
                    'height': validated_data['height'],
                    'weight': str(validated_data['weight']),
                    'age': validated_data['age'],
                    'goals': validated_data['goals'],
                    'methods': validated_data['methods'],
                    'equipment': validated_data.get('equipment', []),
                    'completed_at': timezone.now().isoformat()
                }
                profile.save()
            
            return Response({
                'message': '온보딩이 완료되었습니다.' if created else '온보딩 데이터가 업데이트되었습니다.',
                'data': {
                    'fitness_level': onboarding_data.fitness_level,
                    'height': onboarding_data.height,
                    'weight': str(onboarding_data.weight),
                    'age': onboarding_data.age,
                    'goals': onboarding_data.goals,
                    'methods': onboarding_data.methods,
                    'equipment': onboarding_data.equipment,
                    'bmi': onboarding_data.bmi,
                    'completed_at': onboarding_data.completed_at,
                }
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'온보딩 저장 중 오류가 발생했습니다: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['put', 'patch'])
    def update_data(self, request):
        """온보딩 데이터 업데이트"""
        try:
            onboarding_data = OnboardingData.objects.get(user=request.user)
            
            # PATCH의 경우 부분 업데이트, PUT의 경우 전체 업데이트
            partial = request.method == 'PATCH'
            
            if partial:
                # 부분 업데이트: 기존 데이터와 병합
                current_data = {
                    'fitness_level': onboarding_data.fitness_level,
                    'height': onboarding_data.height,
                    'weight': onboarding_data.weight,
                    'age': onboarding_data.age,
                    'goals': onboarding_data.goals,
                    'methods': onboarding_data.methods,
                    'equipment': onboarding_data.equipment,
                }
                merged_data = current_data.copy()
                merged_data.update(request.data)
                serializer = OnboardingDataSerializer(data=merged_data, partial=True)
            else:
                # 전체 업데이트
                serializer = OnboardingDataSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(
                    {'errors': serializer.errors}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            validated_data = serializer.validated_data
            
            with transaction.atomic():
                # 변경 이력 저장
                old_data = {
                    'fitness_level': onboarding_data.fitness_level,
                    'height': onboarding_data.height,
                    'weight': str(onboarding_data.weight),
                    'age': onboarding_data.age,
                    'goals': onboarding_data.goals,
                    'methods': onboarding_data.methods,
                    'equipment': onboarding_data.equipment,
                }
                
                OnboardingHistory.objects.create(
                    user=request.user,
                    previous_data=old_data,
                    new_data=validated_data,
                    change_reason='데이터 수정'
                )
                
                # 새로운 데이터로 업데이트
                onboarding_data.fitness_level = validated_data.get('fitness_level', onboarding_data.fitness_level)
                onboarding_data.height = validated_data.get('height', onboarding_data.height)
                onboarding_data.weight = validated_data.get('weight', onboarding_data.weight)
                onboarding_data.age = validated_data.get('age', onboarding_data.age)
                onboarding_data.goals = validated_data.get('goals', onboarding_data.goals)
                onboarding_data.methods = validated_data.get('methods', onboarding_data.methods)
                onboarding_data.equipment = validated_data.get('equipment', onboarding_data.equipment)
                onboarding_data.save()
            
            return Response({
                'message': '온보딩 데이터가 업데이트되었습니다.',
                'data': {
                    'fitness_level': onboarding_data.fitness_level,
                    'height': onboarding_data.height,
                    'weight': str(onboarding_data.weight),
                    'age': onboarding_data.age,
                    'goals': onboarding_data.goals,
                    'methods': onboarding_data.methods,
                    'equipment': onboarding_data.equipment,
                    'bmi': onboarding_data.bmi,
                    'updated_at': onboarding_data.updated_at,
                }
            })
            
        except OnboardingData.DoesNotExist:
            return Response(
                {'error': '온보딩 데이터가 존재하지 않습니다. 먼저 온보딩을 완료해주세요.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'온보딩 업데이트 중 오류가 발생했습니다: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """온보딩 완료 상태 확인"""
        try:
            onboarding_data = OnboardingData.objects.get(user=request.user)
            is_completed = onboarding_data.completed
            
            return Response({
                'user_id': request.user.id,
                'username': request.user.username,
                'onboarding_completed': is_completed,
                'completed_at': onboarding_data.completed_at,
                'bmi': onboarding_data.bmi if is_completed else None,
            })
        except OnboardingData.DoesNotExist:
            return Response({
                'user_id': request.user.id,
                'username': request.user.username,
                'onboarding_completed': False,
                'completed_at': None,
                'bmi': None,
            })
    
    @action(detail=False, methods=['post'])
    def reset(self, request):
        """온보딩 데이터 초기화"""
        try:
            with transaction.atomic():
                # 기존 데이터가 있으면 이력에 저장
                try:
                    onboarding_data = OnboardingData.objects.get(user=request.user)
                    
                    old_data = {
                        'fitness_level': onboarding_data.fitness_level,
                        'height': onboarding_data.height,
                        'weight': str(onboarding_data.weight),
                        'age': onboarding_data.age,
                        'goals': onboarding_data.goals,
                        'methods': onboarding_data.methods,
                        'equipment': onboarding_data.equipment,
                    }
                    
                    OnboardingHistory.objects.create(
                        user=request.user,
                        previous_data=old_data,
                        new_data={},
                        change_reason='온보딩 초기화'
                    )
                    
                    onboarding_data.delete()
                    
                    # UserProfile의 온보딩 관련 필드도 초기화
                    try:
                        profile = UserProfile.objects.get(user=request.user)
                        profile.onboarding_completed = False
                        profile.onboarding_completed_at = None
                        profile.onboarding_data = None
                        profile.save()
                    except UserProfile.DoesNotExist:
                        pass
                    
                    return Response({
                        'message': '온보딩 데이터가 초기화되었습니다.',
                        'reset_at': timezone.now()
                    })
                    
                except OnboardingData.DoesNotExist:
                    return Response({
                        'message': '초기화할 온보딩 데이터가 없습니다.'
                    })
                    
        except Exception as e:
            return Response(
                {'error': f'온보딩 초기화 중 오류가 발생했습니다: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def choices(self, request):
        """온보딩에서 사용 가능한 선택지들 반환"""
        return Response({
            'fitness_levels': OnboardingData.FITNESS_LEVEL_CHOICES,
            'goals': OnboardingData.GOAL_CHOICES,
            'methods': OnboardingData.METHOD_CHOICES,
            'equipment': OnboardingData.EQUIPMENT_CHOICES,
        })
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """온보딩 변경 이력 조회"""
        try:
            history = OnboardingHistory.objects.filter(user=request.user).order_by('-created_at')
            
            history_data = []
            for record in history:
                history_data.append({
                    'id': record.id,
                    'previous_data': record.previous_data,
                    'new_data': record.new_data,
                    'change_reason': record.change_reason,
                    'created_at': record.created_at,
                })
            
            return Response({
                'history': history_data,
                'total_count': len(history_data)
            })
            
        except Exception as e:
            return Response(
                {'error': f'이력 조회 중 오류가 발생했습니다: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 