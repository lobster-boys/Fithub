from rest_framework import generics, permissions
from workouts.models import WorkoutType
from api.serializers.workouts.type_serializers import WorkoutTypeSerializer


class WorkoutTypeListView(generics.ListAPIView):
    """운동 타입 목록 조회"""
    queryset = WorkoutType.objects.all()
    serializer_class = WorkoutTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class WorkoutTypeDetailView(generics.RetrieveAPIView):
    """운동 타입 상세 조회"""
    queryset = WorkoutType.objects.all()
    serializer_class = WorkoutTypeSerializer
    permission_classes = [permissions.IsAuthenticated] 