from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status, permissions
from rest_framework.decorators import api_view, action
from ecommerce.models import Review, Product, OrderItem
from api.serializers.ecommerce.review_serializers import (
    ReviewSerializer, ReviewCreateSerializer, ReviewGeneratedSerializer
)
from api.views.base import BaseViewSet, UserOwnedMixin
from rest_framework import viewsets
from django.db.models import Q

class ReviewViewSet(viewsets.ModelViewSet):
    """
    리뷰 ViewSet
    - 기본 CRUD 작업
    - 상품별 리뷰 조회
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

    def perform_create(self, serializer):
        """리뷰 생성 시 현재 사용자를 자동으로 설정"""
        serializer.save(user=self.request.user)


# 레거시 함수 기반 뷰들 (하위 호환성을 위해 유지)
@api_view(["GET"])
def product_reviews(request, product_id):
    """특정 상품의 리뷰 목록 조회"""
    product = get_object_or_404(Product, id=product_id)
    reviews = Review.objects.filter(product=product).order_by('-created_at')
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


class ReviewAPI(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """사용자의 리뷰 목록 조회"""
        reviews = Review.objects.filter(user=request.user).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """리뷰 작성"""
        serializer = ReviewCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            # 구매 확인 로직
            order_item = serializer.validated_data.get('order_item')  # type: ignore
            if order_item and hasattr(order_item, 'order'):
                if order_item.order.user != request.user:  # type: ignore
                    return Response(
                        {"error": "본인이 구매한 상품만 리뷰를 작성할 수 있습니다."}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # 이미 리뷰를 작성했는지 확인
                if Review.objects.filter(user=request.user, order_item=order_item).exists():
                    return Response(
                        {"error": "이미 이 상품에 대한 리뷰를 작성하셨습니다."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            review = serializer.save(user=request.user, is_verified_purchase=True)
            response_serializer = ReviewSerializer(review)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
def review_detail(request, review_id):
    """특정 리뷰 조회, 수정, 삭제"""
    review = get_object_or_404(Review, id=review_id)
    
    if request.method == "GET":
        serializer = ReviewSerializer(review)
        return Response(serializer.data)
    
    elif request.method == "PUT":
        if not request.user.is_authenticated or review.user != request.user:
            return Response(
                {"error": "본인의 리뷰만 수정할 수 있습니다."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ReviewCreateSerializer(review, data=request.data)
        if serializer.is_valid():
            serializer.save()
            response_serializer = ReviewSerializer(review)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == "DELETE":
        if not request.user.is_authenticated or review.user != request.user:
            return Response(
                {"error": "본인의 리뷰만 삭제할 수 있습니다."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
def product_review_stats(request, product_id):
    """상품의 리뷰 통계 조회 (평균 평점, 리뷰 개수 등)"""
    product = get_object_or_404(Product, id=product_id)
    reviews = Review.objects.filter(product=product)
    
    if reviews.exists():
        from django.db.models import Avg, Count
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