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
    
    def dispatch(self, request, *args, **kwargs):
        """요청 처리 전 디버깅 로그"""
        logger.info(f"=== DIET RECOMMEND VIEW DISPATCH ===")
        logger.info(f"Request method: {request.method}")
        logger.info(f"Request path: {request.path}")
        logger.info(f"Request user: {request.user}")
        logger.info(f"User authenticated: {getattr(request.user, 'is_authenticated', False)}")
        logger.info(f"Request headers: {dict(request.headers)}")
        logger.info(f"Auth header: {request.headers.get('Authorization', 'None')}")
        
        # 미들웨어나 권한 체크에서 차단되는지 확인
        try:
            response = super().dispatch(request, *args, **kwargs)
            logger.info(f"Dispatch successful, response status: {response.status_code}")
            return response
        except Exception as e:
            logger.error(f"Dispatch failed with error: {str(e)}")
            logger.error(f"Error type: {type(e)}")
            raise
    
    def get(self, request):
        """기본 추천 제공"""
        # 디버깅 로그 추가
        logger.info(f"Diet recommendation GET request from user: {request.user.id if request.user.is_authenticated else 'Anonymous'}")
        
        # 인증되지 않은 사용자에 대한 명확한 에러 응답
        if not request.user.is_authenticated:
            logger.warning("Diet recommendation requested by unauthenticated user")
            return Response({
                "status": "error",
                "detail": "로그인이 필요한 서비스입니다.",
                "code": "AUTHENTICATION_REQUIRED"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # 사용자 정보 상세 로깅
        logger.info(f"Authenticated user details - ID: {request.user.id}, Username: {request.user.username}")
        
        # 사용자 프로필 존재 여부 미리 확인
        try:
            has_profile = hasattr(request.user, 'profile')
            logger.info(f"User {request.user.id} has profile: {has_profile}")
            
            if has_profile:
                try:
                    profile = request.user.profile
                    target_calories = getattr(profile, 'target_calories', None)
                    logger.info(f"User {request.user.id} target_calories: {target_calories}")
                except Exception as profile_error:
                    logger.error(f"Error accessing profile for user {request.user.id}: {str(profile_error)}")
                    return Response({
                        "status": "error",
                        "detail": "사용자 프로필에 문제가 있습니다. 온보딩을 다시 진행해주세요.",
                        "code": "PROFILE_ERROR"
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                logger.warning(f"User {request.user.id} has no profile")
                # 프로필이 없는 경우에도 기본 추천 제공
                
        except Exception as pre_check_error:
            logger.error(f"Pre-check error for user {request.user.id}: {str(pre_check_error)}")
            
        try:
            logger.info(f"Starting recommendation generation for user {request.user.id}")
            recommendations = recommend_meal_plan_lp(request.user)
            logger.info(f"Recommendation generation successful for user {request.user.id}")
            
            return Response({
                "status": "success",
                "data": recommendations,
                "message": "추천이 성공적으로 생성되었습니다."
            }, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            logger.warning(f"Diet recommendation validation error for user {request.user.id}: {str(e)}")
            return Response({
                "status": "error",
                "detail": str(e),
                "code": "VALIDATION_ERROR"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Unexpected error in diet recommendation for user {request.user.id}: {str(e)}")
            return Response({
                "status": "error", 
                "detail": "추천 시스템에 일시적인 오류가 발생했습니다.",
                "code": "INTERNAL_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """상세 옵션을 포함한 추천"""
        # 디버깅 로그 추가
        logger.info(f"Diet recommendation POST request from user: {request.user.id if request.user.is_authenticated else 'Anonymous'}")
        logger.info(f"Request data: {request.data}")
        
        # 인증되지 않은 사용자에 대한 명확한 에러 응답
        if not request.user.is_authenticated:
            logger.warning("Custom diet recommendation requested by unauthenticated user")
            return Response({
                "status": "error",
                "detail": "로그인이 필요한 서비스입니다.",
                "code": "AUTHENTICATION_REQUIRED"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # 사용자 정보 상세 로깅
        logger.info(f"Authenticated user details - ID: {request.user.id}, Username: {request.user.username}")
        
        try:
            # 요청 데이터 검증
            meal_count = self._validate_meal_count(request.data.get("meal_count", 3))
            top_n = self._validate_top_n(request.data.get("top_n", 5))
            candidate_food_ids = request.data.get("candidate_food_ids")
            meal_type = request.data.get("meal_type")
            
            logger.info(f"Validated parameters - meal_count: {meal_count}, top_n: {top_n}, meal_type: {meal_type}")
            
            # 추천 실행
            logger.info(f"Starting custom recommendation generation for user {request.user.id}")
            recommendations = recommend_meal_plan_lp(
                request.user,
                candidate_food_ids=candidate_food_ids,
                meal_count=meal_count,
                meal_type=meal_type,
                top_n=top_n
            )
            logger.info(f"Custom recommendation generation successful for user {request.user.id}")
            
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
            logger.warning(f"Custom diet recommendation validation error for user {request.user.id}: {str(e)}")
            return Response({
                "status": "error",
                "detail": str(e),
                "code": "VALIDATION_ERROR"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Unexpected error in custom diet recommendation for user {request.user.id}: {str(e)}")
            return Response({
                "status": "error",
                "detail": "추천 시스템에 일시적인 오류가 발생했습니다.",
                "code": "INTERNAL_ERROR"
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
