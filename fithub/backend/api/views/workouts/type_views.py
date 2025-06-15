from rest_framework import generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from workouts.models import WorkoutType
from api.serializers.workouts.type_serializers import WorkoutTypeSerializer
from api.views.base import BaseViewSet, StatsMixin


class WorkoutTypeViewSet(StatsMixin, BaseViewSet):
    """운동 타입 ViewSet"""
    queryset = WorkoutType.objects.all()
    serializer_class = WorkoutTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name', 'description']
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """인기 운동 타입 목록 (사용자 로그 기준)"""
        from django.db.models import Count
        from workouts.models import WorkoutLog
        
        popular_types = WorkoutType.objects.annotate(
            usage_count=Count('workoutlog')
        ).filter(usage_count__gt=0).order_by('-usage_count')[:10]
        
        serializer = self.get_serializer(popular_types, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def usage_stats(self, request, pk=None):
        """특정 운동 타입의 사용 통계"""
        from django.db.models import Count, Sum, Avg
        from workouts.models import WorkoutLog
        
        workout_type = self.get_object()
        
        # 사용 통계
        logs = WorkoutLog.objects.filter(workout_type=workout_type)
        total_sessions = logs.count()
        total_duration = logs.aggregate(Sum('duration_minutes'))['duration_minutes__sum'] or 0
        avg_duration = logs.aggregate(Avg('duration_minutes'))['duration_minutes__avg'] or 0
        avg_rating = logs.aggregate(Avg('rating'))['rating__avg'] or 0
        
        # 최근 사용자들
        recent_users = logs.order_by('-start_time')[:5].values_list('user__username', flat=True)
        
        stats_data = {
            'workout_type': WorkoutTypeSerializer(workout_type).data,
            'total_sessions': total_sessions,
            'total_duration': total_duration,
            'average_duration': round(avg_duration, 1),
            'average_rating': round(avg_rating, 1),
            'recent_users': list(recent_users),
        }
        
        return Response(stats_data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """카테고리별 운동 타입 분류"""
        category = request.query_params.get('category')
        if category:
            queryset = self.get_queryset().filter(category__icontains=category)
        else:
            # 카테고리별로 그룹핑
            from django.db.models import Q
            
            strength_types = self.get_queryset().filter(
                Q(name__icontains='근력') | Q(name__icontains='웨이트') | Q(name__icontains='스트렝스')
            )
            cardio_types = self.get_queryset().filter(
                Q(name__icontains='유산소') | Q(name__icontains='러닝') | Q(name__icontains='사이클')
            )
            flexibility_types = self.get_queryset().filter(
                Q(name__icontains='요가') | Q(name__icontains='스트레칭') | Q(name__icontains='필라테스')
            )
            
            return Response({
                'strength': WorkoutTypeSerializer(strength_types, many=True).data,
                'cardio': WorkoutTypeSerializer(cardio_types, many=True).data,
                'flexibility': WorkoutTypeSerializer(flexibility_types, many=True).data,
            })
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# 레거시 뷰들 (하위 호환성을 위해 유지)
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