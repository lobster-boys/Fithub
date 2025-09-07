from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, date

from diet.models import MealPlan, MealPlanLike
from ...serializers.diet.mealplan_serializers import (
    MealPlanDetailSerializer, 
    MealPlanWriteSerializer,
    MealPlanLikeSerializer,
    PublicMealPlanSerializer
)
from ...permissions import PublicReadOnly


class MealPlanViewSet(viewsets.ModelViewSet):
    """
    식단 계획 ViewSet
    - 개인 식단 계획 CRUD
    - 좋아요 기능
    - 공개 식단 목록 조회
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """사용자별 식단 계획 조회"""
        if self.action in ['public_list', 'public_detail']:
            # 공개 식단은 모든 사용자가 조회 가능
            return MealPlan.objects.filter(is_public=True).select_related('user').prefetch_related('items__food')
        
        # 개인 식단은 본인만 조회 가능
        return MealPlan.objects.filter(user=self.request.user).select_related('user').prefetch_related('items__food')
    
    def get_serializer_class(self):
        """액션별 적절한 Serializer 반환"""
        if self.action in ['create', 'update', 'partial_update']:
            return MealPlanWriteSerializer
        elif self.action == 'public_list':
            return PublicMealPlanSerializer
        return MealPlanDetailSerializer
    
    def get_serializer_context(self):
        """Serializer context에 request 추가"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def list(self, request, *args, **kwargs):
        """개인 식단 계획 목록 조회"""
        queryset = self.get_queryset()
        
        # 날짜 필터링
        date_param = request.query_params.get('date')
        if date_param:
            try:
                filter_date = datetime.strptime(date_param, '%Y-%m-%d').date()
                queryset = queryset.filter(
                    start_date__lte=filter_date,
                    end_date__gte=filter_date
                )
            except ValueError:
                return Response({
                    "error": "날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식을 사용해주세요."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # 활성 상태 필터링
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            if is_active.lower() == 'true':
                queryset = queryset.filter(is_active=True)
            elif is_active.lower() == 'false':
                queryset = queryset.filter(is_active=False)
        
        # 정렬
        queryset = queryset.order_by('-created_at')
        
        # 페이지네이션 처리
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        """개인 식단 계획 상세 조회"""
        instance = self.get_object()
        # 조회수 증가
        instance.increment_views()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """식단 계획 생성"""
        print(f"MealPlanViewSet.create - 받은 데이터: {request.data}")
        print(f"MealPlanViewSet.create - 사용자: {request.user}")
        print(f"MealPlanViewSet.create - 인증 여부: {request.user.is_authenticated}")
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            meal_plan = serializer.save()
            output_serializer = MealPlanDetailSerializer(meal_plan, context=self.get_serializer_context())
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        
        print(f"MealPlanViewSet.create - 검증 실패: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """식단 계획 전체 수정"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            meal_plan = serializer.save()
            output_serializer = MealPlanDetailSerializer(meal_plan, context=self.get_serializer_context())
            return Response(output_serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        """식단 계획 부분 수정"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            meal_plan = serializer.save()
            output_serializer = MealPlanDetailSerializer(meal_plan, context=self.get_serializer_context())
            return Response(output_serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """식단 계획 삭제"""
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='like')
    def like(self, request, pk=None):
        """식단 계획 좋아요/좋아요 취소 (토글)"""
        meal_plan = self.get_object()
        
        # 공개된 식단만 좋아요 가능
        if not meal_plan.is_public:
            return Response({
                "detail": "공개된 식단만 좋아요를 누를 수 있습니다."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 자신의 식단에는 좋아요 불가
        if meal_plan.user == request.user:
            return Response({
                "detail": "자신의 식단에는 좋아요를 누를 수 없습니다."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        existing_like = MealPlanLike.objects.filter(
            user=request.user,
            meal_plan=meal_plan
        ).first()
        
        if existing_like:
            # 좋아요 취소
            existing_like.delete()
            meal_plan.likes_count = max(0, meal_plan.likes_count - 1)
            meal_plan.save(update_fields=['likes_count'])
            return Response({
                "is_liked": False,
                "likes_count": meal_plan.likes_count
            }, status=status.HTTP_200_OK)
        else:
            # 좋아요 추가
            MealPlanLike.objects.create(user=request.user, meal_plan=meal_plan)
            meal_plan.likes_count += 1
            meal_plan.save(update_fields=['likes_count'])
            return Response({
                "is_liked": True,
                "likes_count": meal_plan.likes_count
            }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[PublicReadOnly], url_path='public')
    def public_list(self, request):
        """공개 식단 계획 목록 조회 (비로그인 사용자도 접근 가능)"""
        queryset = self.get_queryset()
        
        # 검색 필터
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(user__username__icontains=search)
            )
        
        # 목표별 필터
        target_goal = request.query_params.get('target_goal')
        if target_goal:
            queryset = queryset.filter(target_goal=target_goal)
        
        # 난이도별 필터
        difficulty = request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # 칼로리 범위 필터
        min_calories = request.query_params.get('min_calories')
        max_calories = request.query_params.get('max_calories')
        if min_calories:
            try:
                queryset = queryset.filter(target_calories_min__gte=int(min_calories))
            except ValueError:
                pass
        if max_calories:
            try:
                queryset = queryset.filter(target_calories_max__lte=int(max_calories))
            except ValueError:
                pass
        
        # 정렬 (인기순, 최신순, 좋아요순)
        order_by = request.query_params.get('order_by', '-created_at')
        if order_by == 'popular':
            queryset = queryset.order_by('-views_count', '-likes_count')
        elif order_by == 'likes':
            queryset = queryset.order_by('-likes_count', '-created_at')
        else:
            queryset = queryset.order_by('-created_at')
        
        # 페이지네이션 처리
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[PublicReadOnly], url_path='public-detail')
    def public_detail(self, request, pk=None):
        """공개 식단 계획 상세 조회 (비로그인 사용자도 접근 가능)"""
        meal_plan = get_object_or_404(MealPlan, pk=pk, is_public=True)
        
        # 조회수 증가
        meal_plan.increment_views()
        
        serializer = MealPlanDetailSerializer(meal_plan, context=self.get_serializer_context())
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='recommended')
    def recommended(self, request):
        """추천 식단 목록 조회"""
        queryset = self.get_queryset().filter(is_recommended=True, is_public=True)
        
        # 사용자별 맞춤 추천 (추후 확장 가능)
        # user_profile = getattr(request.user, 'profile', None)
        # if user_profile:
        #     queryset = queryset.filter(target_goal=user_profile.fitness_goal)
        
        queryset = queryset.order_by('-likes_count', '-views_count')[:10]
        
        serializer = PublicMealPlanSerializer(queryset, many=True, context=self.get_serializer_context())
        return Response(serializer.data, status=status.HTTP_200_OK)