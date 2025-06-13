from django.shortcuts import render
from rest_framework import generics, permissions
from workouts.models import Exercise
from api.serializers.workouts.exercise_serializers import ExerciseSerializer


# Exercise Views
class ExerciseListView(generics.ListAPIView):
    """운동 목록 조회"""
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Exercise.objects.all()
        
        # 근육군 필터
        muscle_group = self.request.query_params.get('muscle_group')
        if muscle_group:
            queryset = queryset.filter(muscle_group=muscle_group)
        
        # 난이도 필터
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # 장비 필터
        equipment = self.request.query_params.get('equipment')
        if equipment:
            queryset = queryset.filter(equipment_needed=equipment)
        
        # 검색어 필터 (name 또는 search 파라미터 모두 지원)
        search = self.request.query_params.get('search') or self.request.query_params.get('name')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset.order_by('name')


class ExerciseDetailView(generics.RetrieveAPIView):
    """운동 상세 조회"""
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.IsAuthenticated] 