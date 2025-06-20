from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.exceptions import ValidationError
from diet.recommendation_lp import recommend_meal_plan_lp
import logging

logger = logging.getLogger(__name__)

class DietRecommendView(APIView):
    """
    /api/diet/recommend/ 엔드포인트
    GET: 식단 추천 
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """식단 추천 - meal_type만 지원"""
        try:
            # 사용자 목표 칼로리 확인
            profile = request.user.profile
            if not profile.target_calories or profile.target_calories <= 0:
                return Response({
                    "status": "error",
                    "detail": "목표 칼로리가 설정되지 않았습니다. 프로필에서 목표 칼로리를 설정해 주세요."
                }, status=status.HTTP_400_BAD_REQUEST)

            # JSON 바디에서 meal_type만 추출
            meal_type = request.data.get("meal_type")
            
            # meal_type 검증 (snack 제외)
            if meal_type and meal_type not in ['breakfast', 'lunch', 'dinner']:
                return Response({
                    "status": "error",
                    "detail": "meal_type은 breakfast, lunch, dinner 중 하나여야 합니다."
                }, status=status.HTTP_400_BAD_REQUEST)

            # 추천 실행
            recommendations = recommend_meal_plan_lp(
                request.user,
                meal_type=meal_type
            )
            
            return Response({
                "status": "success",
                "data": recommendations,
                "message": "식사 추천이 성공적으로 생성되었습니다."
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
