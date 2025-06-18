from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.exceptions import ValidationError
from diet.recommendation_lp import recommend_meal_plan_lp
import logging

logger = logging.getLogger(__name__) # 디버깅용 로그 기록


class DietRecommendView(APIView):
    """
    /api/diet/recommend/ 엔드포인트
    
    GET: 기본 추천 (사용자 프로필 기반)
    POST: 상세 옵션을 포함한 추천
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """기본 추천 제공"""
        try:
            recommendations = recommend_meal_plan_lp(request.user)
            return Response({
                "status": "success",
                "data": recommendations,
                "message": "추천이 성공적으로 생성되었습니다."
            }, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            logger.warning(f"Diet recommendation validation error for user {request.user.id}: {str(e)}")
            return Response({
                "status": "error",
                "detail": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Unexpected error in diet recommendation for user {request.user.id}: {str(e)}")
            return Response({
                "status": "error", 
                "detail": "추천 시스템에 일시적인 오류가 발생했습니다."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """상세 옵션을 포함한 추천"""
        try:
            # 요청 데이터 검증
            meal_count = self._validate_meal_count(request.data.get("meal_count", 3))
            top_n = self._validate_top_n(request.data.get("top_n", 5))
            candidate_food_ids = request.data.get("candidate_food_ids")
            meal_type = request.data.get("meal_type")
            
            # 추천 실행
            recommendations = recommend_meal_plan_lp(
                request.user,
                candidate_food_ids=candidate_food_ids,
                meal_count=meal_count,
                meal_type=meal_type,
                top_n=top_n
            )
            
            return Response({
                "status": "success",
                "data": recommendations,
                "parameters": {
                    "meal_count": meal_count,
                    "top_n": top_n,
                    "meal_type": meal_type,
                    "candidate_foods_count": len(candidate_food_ids) if candidate_food_ids else None
                },
                "message": "맞춤형 추천이 성공적으로 생성되었습니다."
            }, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            logger.warning(f"Diet recommendation validation error for user {request.user.id}: {str(e)}")
            return Response({
                "status": "error",
                "detail": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Unexpected error in diet recommendation for user {request.user.id}: {str(e)}")
            return Response({
                "status": "error",
                "detail": "추천 시스템에 일시적인 오류가 발생했습니다."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _validate_meal_count(self, meal_count):
        """식사 횟수 검증"""
        try:
            meal_count = int(meal_count)
            if meal_count < 1 or meal_count > 10:
                raise ValidationError("식사 횟수는 1~10 사이여야 합니다.")
            return meal_count
        except (ValueError, TypeError):
            raise ValidationError("식사 횟수는 정수여야 합니다.")
    
    def _validate_top_n(self, top_n):
        """추천 개수 검증"""
        try:
            top_n = int(top_n)
            if top_n < 1 or top_n > 20:
                raise ValidationError("추천 개수는 1~20 사이여야 합니다.")
            return top_n
        except (ValueError, TypeError):
            raise ValidationError("추천 개수는 정수여야 합니다.")
