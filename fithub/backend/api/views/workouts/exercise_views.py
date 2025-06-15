from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from workouts.models import Exercise
from api.serializers.workouts.exercise_serializers import ExerciseSerializer


class ExerciseViewSet(viewsets.ModelViewSet):
    """
    운동 종목 관리 ViewSet
    프론트엔드 요구사항에 맞춘 단순화된 버전
    """
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """기본 운동 목록 조회"""
        queryset = Exercise.objects.all()
        
        # 근육군별 필터링 (프론트엔드에서 사용)
        muscle_group = self.request.query_params.get('muscle_group', None)
        if muscle_group:
            queryset = queryset.filter(primary_muscle_group__icontains=muscle_group)
        
        # 운동 타입별 필터링
        exercise_type = self.request.query_params.get('type', None)
        if exercise_type:
            queryset = queryset.filter(exercise_type=exercise_type)
            
        # 검색 (프론트엔드에서 사용)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
        
        return queryset.order_by('name')
    
    def list(self, request, *args, **kwargs):
        """운동 목록 조회"""
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """운동 상세 조회"""
        return super().retrieve(request, *args, **kwargs) 