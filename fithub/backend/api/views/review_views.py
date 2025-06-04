from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from ecommerce.models import Review, Product, OrderItem
from api.serializers.review_serializers import (
    ReviewSerializer, ReviewCreateSerializer, ReviewGeneratedSerializer
)
from users.models import User

@api_view(["GET"])
def product_reviews(request, product_id):
    """
    특정 상품의 리뷰 목록 조회
    """
    product = get_object_or_404(Product, id=product_id)
    reviews = Review.objects.filter(product=product).order_by('-created_at')
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)

class ReviewAPI(APIView):
    
    def get(self, request):
        """
        사용자의 리뷰 목록 조회
        """
        user = User.objects.get(id="1")  # request.user로 전환 예정
        reviews = Review.objects.filter(user=user).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """
        리뷰 작성
        """
        user = User.objects.get(id="1")  # request.user로 전환 예정
        serializer = ReviewCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            # 구매 확인 로직
            order_item_id = serializer.validated_data.get('order_item').id
            order_item = get_object_or_404(OrderItem, id=order_item_id)
            
            if order_item.order.user != user:
                return Response(
                    {"error": "본인이 구매한 상품만 리뷰를 작성할 수 있습니다."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # 이미 리뷰를 작성했는지 확인
            if Review.objects.filter(user=user, order_item=order_item).exists():
                return Response(
                    {"error": "이미 이 상품에 대한 리뷰를 작성하셨습니다."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            review = serializer.save(user=user, is_verified_purchase=True)
            response_serializer = ReviewSerializer(review)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
def review_detail(request, review_id):
    """
    특정 리뷰 조회, 수정, 삭제
    """
    review = get_object_or_404(Review, id=review_id)
    user = User.objects.get(id="1")  # request.user로 전환 예정
    
    if request.method == "GET":
        serializer = ReviewSerializer(review)
        return Response(serializer.data)
    
    elif request.method == "PUT":
        if review.user != user:
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
        if review.user != user:
            return Response(
                {"error": "본인의 리뷰만 삭제할 수 있습니다."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["GET"])
def product_review_stats(request, product_id):
    """
    상품의 리뷰 통계 조회 (평균 평점, 리뷰 개수 등)
    """
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