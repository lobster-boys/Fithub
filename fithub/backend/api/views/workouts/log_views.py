from django.shortcuts import render
from rest_framework import generics, permissions
from workouts.models import WorkoutLog
from api.serializers.workouts.log_serializers import WorkoutLogSerializer


# Workout Log Views
class WorkoutLogListView(generics.ListAPIView):
    """운동 기록 목록 조회"""
    serializer_class = WorkoutLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = WorkoutLog.objects.filter(user=user)
        
        # 날짜 필터링
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(start_time__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(start_time__date__lte=end_date)
            
        return queryset.select_related('routine', 'user')


class WorkoutLogCreateView(generics.CreateAPIView):
    """운동 기록 생성"""
    serializer_class = WorkoutLogSerializer
    permission_classes = [permissions.IsAuthenticated]


class WorkoutLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    """운동 기록 상세 조회/수정/삭제"""
    serializer_class = WorkoutLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return WorkoutLog.objects.filter(user=self.request.user) 