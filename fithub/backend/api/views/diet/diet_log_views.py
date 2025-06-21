from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from datetime import datetime, date
from diet.models import DietLog
from ...serializers.diet.diet_log_serializers import (
    DietLogSerializer, DietLogCreateSerializer, DietLogUpdateSerializer,
    DietLogFromRecommendationSerializer
)

class DietLogViewSet(viewsets.ModelViewSet):
    """
    DietLog CRUD 작업을 위한 ViewSet
    
    list: GET /api/diet/log/ - DietLog 목록 조회 (필터링 지원)
    create: POST /api/diet/log/ - 수동 DietLog 생성
    retrieve: GET /api/diet/log/{id}/ - 특정 DietLog 조회
    update: PUT /api/diet/log/{id}/ - DietLog 전체 수정
    partial_update: PATCH /api/diet/log/{id}/ - DietLog 부분 수정
    destroy: DELETE /api/diet/log/{id}/ - DietLog 삭제
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """사용자별 DietLog 조회 및 필터링"""
        queryset = DietLog.objects.filter(user=self.request.user).select_related('food', 'food__category')
        
        # 날짜 필터링
        date_param = self.request.query_params.get('date')
        if date_param:
            try:
                filter_date = datetime.strptime(date_param, '%Y-%m-%d').date()
                queryset = queryset.filter(date=filter_date)
            except ValueError:
                pass  # 잘못된 날짜 형식은 무시
        
        # 날짜 범위 필터링
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            try:
                from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(date__gte=from_date)
            except ValueError:
                pass
        
        if date_to:
            try:
                to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
                queryset = queryset.filter(date__lte=to_date)
            except ValueError:
                pass
        
        # 식사 타입 필터링
        meal_type = self.request.query_params.get('meal_type')
        if meal_type and meal_type in ['breakfast', 'lunch', 'dinner', 'snack']:
            queryset = queryset.filter(meal_type=meal_type)
        
        # 추천 기반 여부 필터링
        is_recommended = self.request.query_params.get('is_recommended')
        if is_recommended is not None:
            if is_recommended.lower() == 'true':
                queryset = queryset.filter(recommended_at__isnull=False)
            elif is_recommended.lower() == 'false':
                queryset = queryset.filter(recommended_at__isnull=True)
        
        # 정렬 (최신순)
        return queryset.order_by('-date', '-created_at')
    
    def get_serializer_class(self):
        """액션별 적절한 Serializer 반환"""
        if self.action == 'create':
            return DietLogCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return DietLogUpdateSerializer
        return DietLogSerializer
    
    def list(self, request, *args, **kwargs):
        """DietLog 목록 조회 (필터링 지원)"""
        queryset = self.get_queryset()
        
        # 필터 검증
        meal_type = request.query_params.get('meal_type')
        if meal_type and meal_type not in ['breakfast', 'lunch', 'dinner', 'snack']:
            return Response({
                "status": "error",
                "detail": "meal_type은 breakfast, lunch, dinner, snack 중 하나여야 합니다."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        date_param = request.query_params.get('date')
        if date_param:
            try:
                datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                return Response({
                    "status": "error",
                    "detail": "날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식을 사용해주세요."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "status": "success",
            "count": queryset.count(),
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    def create(self, request, *args, **kwargs):
        """수동 DietLog 생성"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            diet_log = serializer.save()
            output_serializer = DietLogSerializer(diet_log)
            return Response({
                "status": "success",
                "data": output_serializer.data,
                "message": "식단 기록이 생성되었습니다."
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            "status": "error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, *args, **kwargs):
        """특정 DietLog 조회"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "status": "success",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    def partial_update(self, request, *args, **kwargs):
        """DietLog 부분 수정"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated_diet_log = serializer.save()
            output_serializer = DietLogSerializer(updated_diet_log)
            return Response({
                "status": "success",
                "data": output_serializer.data,
                "message": "식단 기록이 수정되었습니다."
            }, status=status.HTTP_200_OK)
        
        return Response({
            "status": "error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """DietLog 삭제"""
        instance = self.get_object()
        instance.delete()
        return Response({
            "status": "success",
            "message": "식단 기록이 삭제되었습니다."
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'], url_path='from-recommendation')
    def from_recommendation(self, request):
        """
        추천 기반 DietLog 생성
        POST /api/diet/log/from-recommendation/
        """
        serializer = DietLogFromRecommendationSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            created_logs = serializer.save()
            output_serializer = DietLogSerializer(created_logs, many=True)
            return Response({
                "status": "success",
                "count": len(created_logs),
                "data": output_serializer.data,
                "message": f"{len(created_logs)}개의 추천 기반 식단 기록이 생성되었습니다."
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            "status": "error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        식단 통계 조회
        GET /api/diet/log/stats/
        """
        date_param = request.query_params.get('date', date.today().strftime('%Y-%m-%d'))
        
        try:
            target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                "status": "error",
                "detail": "날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식을 사용해주세요."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 해당 날짜의 식단 기록
        daily_logs = DietLog.objects.filter(
            user=request.user,
            date=target_date
        ).select_related('food')
        
        # 식사별 통계
        stats = {
            'date': target_date.strftime('%Y-%m-%d'),
            'total_calories': 0,
            'total_protein': 0,
            'total_carbs': 0,
            'total_fat': 0,
            'meal_breakdown': {
                'breakfast': {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0, 'count': 0},
                'lunch': {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0, 'count': 0},
                'dinner': {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0, 'count': 0},
                'snack': {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0, 'count': 0},
            },
            'recommended_vs_manual': {
                'recommended_count': 0,
                'manual_count': 0
            }
        }
        
        for log in daily_logs:
            # 전체 통계
            stats['total_calories'] += float(log.calories)
            
            # 식사별 통계
            meal_stats = stats['meal_breakdown'][log.meal_type]
            meal_stats['calories'] += float(log.calories)
            meal_stats['count'] += 1
            
            # 추천 vs 수동 통계
            if log.recommended_at:
                stats['recommended_vs_manual']['recommended_count'] += 1
            else:
                stats['recommended_vs_manual']['manual_count'] += 1
            
            # 영양소 계산 (정확한 계산을 위해 비율 적용)
            try:
                food = log.food
                serving_g = food.get_standard_serving()
                ratio = log.quantity / serving_g if serving_g > 0 else 0
                
                protein_amount = float(food.protein) * ratio
                carbs_amount = float(food.carbs) * ratio
                fat_amount = float(food.fat) * ratio
                
                stats['total_protein'] += protein_amount
                stats['total_carbs'] += carbs_amount
                stats['total_fat'] += fat_amount
                
                meal_stats['protein'] += protein_amount
                meal_stats['carbs'] += carbs_amount
                meal_stats['fat'] += fat_amount
                
            except Exception:
                continue
        
        # 소수점 정리
        for key in ['total_calories', 'total_protein', 'total_carbs', 'total_fat']:
            stats[key] = round(stats[key], 2)
        
        for meal_type in stats['meal_breakdown']:
            for nutrient in ['calories', 'protein', 'carbs', 'fat']:
                stats['meal_breakdown'][meal_type][nutrient] = round(
                    stats['meal_breakdown'][meal_type][nutrient], 2
                )
        
        return Response({
            "status": "success",
            "data": stats
        }, status=status.HTTP_200_OK)
