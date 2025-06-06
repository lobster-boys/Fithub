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
        queryset = super().get_queryset()
        difficulty = self.request.query_params.get('difficulty')
        muscle_group = self.request.query_params.get('muscle_group')
        
        if difficulty:
            queryset = queryset.filter(difficulty_level=difficulty)
        if muscle_group:
            queryset = queryset.filter(muscle_groups__icontains=muscle_group)
            
        return queryset


class ExerciseDetailView(generics.RetrieveAPIView):
    """운동 상세 조회"""
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.IsAuthenticated] 