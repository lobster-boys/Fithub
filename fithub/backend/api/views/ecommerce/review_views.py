from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status, permissions, serializers
from rest_framework.decorators import api_view, action
from ecommerce.models import Review, Product, OrderItem
from api.serializers.ecommerce.review_serializers import (
    ReviewSerializer, ReviewCreateSerializer, ReviewGeneratedSerializer
)
from api.views.base import BaseViewSet, UserOwnedMixin
from rest_framework import viewsets
from django.db.models import Q, Avg, Count

class ReviewViewSet(viewsets.ModelViewSet):
    """
    리뷰 ViewSet
    - 기본 CRUD 작업
    - 상품별 리뷰 조회
    - 리뷰 통계
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """리뷰 목록 조회 (필터링 지원)"""
        queryset = Review.objects.all()
        
        # 상품별 필터링 (프론트엔드에서 사용)
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        # 평점 필터링
        rating = self.request.query_params.get('rating')
        if rating:
            queryset = queryset.filter(rating=rating)
        
        return queryset.select_related('user', 'product').order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer

    def perform_create(self, serializer):
        """리뷰 생성 시 현재 사용자를 자동으로 설정"""
        # 구매 확인 로직 (order_item이 있는 경우에만)
        order_item = serializer.validated_data.get('order_item')
        is_verified = False
        
        if order_item and hasattr(order_item, 'order'):
            if order_item.order.user != self.request.user:
                raise serializers.ValidationError("본인이 구매한 상품만 리뷰를 작성할 수 있습니다.")
            
            # 이미 리뷰를 작성했는지 확인
            if Review.objects.filter(user=self.request.user, order_item=order_item).exists():
                raise serializers.ValidationError("이미 이 상품에 대한 리뷰를 작성하셨습니다.")
            
            is_verified = True
        else:
            # order_item이 없는 경우, 같은 상품에 대한 리뷰가 이미 있는지 확인
            product = serializer.validated_data.get('product')
            if Review.objects.filter(user=self.request.user, product=product, order_item__isnull=True).exists():
                raise serializers.ValidationError("이미 이 상품에 대한 리뷰를 작성하셨습니다.")
        
        serializer.save(user=self.request.user, is_verified_purchase=is_verified)

    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        """내 리뷰 목록 조회"""
        reviews = Review.objects.filter(user=request.user).order_by('-created_at')
        page = self.paginate_queryset(reviews)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='product/(?P<product_id>[^/.]+)')
    def product_reviews(self, request, product_id=None):
        """특정 상품의 리뷰 목록 조회"""
        product = get_object_or_404(Product, id=product_id)
        reviews = Review.objects.filter(product=product).order_by('-created_at')
        page = self.paginate_queryset(reviews)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='product/(?P<product_id>[^/.]+)/stats')
    def product_review_stats(self, request, product_id=None):
        """상품의 리뷰 통계 조회 (평균 평점, 리뷰 개수 등)"""
        product = get_object_or_404(Product, id=product_id)
        reviews = Review.objects.filter(product=product)
        
        if reviews.exists():
            stats = reviews.aggregate(
                average_rating=Avg('rating'),
                total_reviews=Count('id')
            )
            
            # 평점별 개수
            rating_distribution = {}
            for i in range(1, 6):
                rating_distribution[f'rating_{i}'] = reviews.filter(rating=i).count()
            
            stats.update(rating_distribution)
        else:
            stats = {
                'average_rating': 0,
                'total_reviews': 0,
                'rating_1': 0,
                'rating_2': 0,
                'rating_3': 0,
                'rating_4': 0,
                'rating_5': 0,
            }
        
        return Response(stats)

    def update(self, request, *args, **kwargs):
        """리뷰 수정 (본인의 리뷰만 수정 가능)"""
        review = self.get_object()
        if review.user != request.user:
            return Response(
                {"error": "본인의 리뷰만 수정할 수 있습니다."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """리뷰 삭제 (본인의 리뷰만 삭제 가능)"""
        review = self.get_object()
        if review.user != request.user:
            return Response(
                {"error": "본인의 리뷰만 삭제할 수 있습니다."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

# 하위 호환성을 위한 레거시 뷰들
@api_view(["GET"])
def product_reviews(request, product_id):
    """레거시 호환: ReviewViewSet.product_reviews로 redirect"""
    viewset = ReviewViewSet()
    viewset.request = request
    return viewset.product_reviews(request, product_id=product_id)

class ReviewAPI:
    """레거시 호환을 위한 클래스 (ReviewViewSet으로 redirect)"""
    def __new__(cls):
        return ReviewViewSet()

@api_view(["GET", "PUT", "DELETE"])
def review_detail(request, review_id):
    """레거시 호환: ReviewViewSet으로 redirect"""
    viewset = ReviewViewSet()
    viewset.request = request
    if request.method == "GET":
        return viewset.retrieve(request, pk=review_id)
    elif request.method == "PUT":
        return viewset.update(request, pk=review_id)
    elif request.method == "DELETE":
        return viewset.destroy(request, pk=review_id)

@api_view(["GET"])
def product_review_stats(request, product_id):
    """레거시 호환: ReviewViewSet.product_review_stats로 redirect"""
    viewset = ReviewViewSet()
    viewset.request = request
    return viewset.product_review_stats(request, product_id=product_id) 