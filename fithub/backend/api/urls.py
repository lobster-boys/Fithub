from django.urls import path, include
from rest_framework.routers import DefaultRouter

# ViewSets (단순화된 버전)
from .views.workouts import ExerciseViewSet, WorkoutRoutineViewSet, WorkoutLogViewSet, WorkoutLogExerciseViewSet, WorkoutTypeViewSet, WorkoutStatsViewSet
from .views.ecommerce import CategoryViewSet, ProductViewSet
from .views.ecommerce.cart_views import CartViewSet, CartItemViewSet
from .views.ecommerce.order_views import OrderViewSet
from .views.ecommerce.review_views import ReviewViewSet
from .views.diet.food_views import FoodViewSet
from .views.users.profile_views import UserProfileViewSet
from .views.community.post_views import PostViewSet

app_name = "api"

# Router 설정
router = DefaultRouter()

# Workouts 앱 ViewSets (단순화됨)
router.register(r'workouts/exercises', ExerciseViewSet, basename='exercise')
router.register(r'workouts/routines', WorkoutRoutineViewSet, basename='routine')
router.register(r'workouts/logs', WorkoutLogViewSet, basename='log')
router.register(r'workouts/log-exercises', WorkoutLogExerciseViewSet, basename='log-exercise')
router.register(r'workouts/types', WorkoutTypeViewSet, basename='workout-type')
router.register(r'workouts/stats', WorkoutStatsViewSet, basename='workout-stats')

# Ecommerce 앱 ViewSets (단순화됨)
router.register(r'ecommerce/categories', CategoryViewSet, basename='category')
router.register(r'ecommerce/products', ProductViewSet, basename='product')
router.register(r'ecommerce/carts', CartViewSet, basename='cart')
router.register(r'ecommerce/cart-items', CartItemViewSet, basename='cart-item')
router.register(r'ecommerce/orders', OrderViewSet, basename='order')
router.register(r'ecommerce/reviews', ReviewViewSet, basename='review')

# Diet 앱 ViewSets (단순화됨)
router.register(r'diet/foods', FoodViewSet, basename='food')

# Users 앱 ViewSets (단순화됨)
router.register(r'users/profiles', UserProfileViewSet, basename='user-profile')

# Community 앱 ViewSets (단순화됨)
router.register(r'community/posts', PostViewSet, basename='post')

urlpatterns = [
    # ViewSet 라우터 URL들
    path('', include(router.urls)),
    
    # =================== 단순화된 API 엔드포인트 ===================
    # 
    # Workouts API (프론트엔드 요구사항에 맞춘 핵심 기능만):
    # GET    /api/workouts/exercises/                    -> 운동 목록 (필터링: muscle_group, type, search)
    # GET    /api/workouts/exercises/{id}/               -> 운동 상세
    #
    # GET    /api/workouts/routines/                     -> 루틴 목록 (필터링: difficulty)
    # POST   /api/workouts/routines/                     -> 루틴 생성
    # GET    /api/workouts/routines/{id}/                -> 루틴 상세
    # PUT    /api/workouts/routines/{id}/                -> 루틴 수정
    # DELETE /api/workouts/routines/{id}/                -> 루틴 삭제
    # POST   /api/workouts/routines/{id}/copy/           -> 루틴 복사
    #
    # GET    /api/workouts/logs/                         -> 운동 로그 목록 (필터링: date, completed)
    # POST   /api/workouts/logs/                         -> 운동 로그 생성
    # GET    /api/workouts/logs/{id}/                    -> 운동 로그 상세
    # PUT    /api/workouts/logs/{id}/                    -> 운동 로그 수정
    # DELETE /api/workouts/logs/{id}/                    -> 운동 로그 삭제
    # POST   /api/workouts/logs/{id}/complete/           -> 운동 완료
    #
    # GET    /api/workouts/log-exercises/                -> 운동 로그 상세 운동 목록
    # POST   /api/workouts/log-exercises/                -> 운동 로그 상세 운동 생성
    # GET    /api/workouts/log-exercises/{id}/           -> 운동 로그 상세 운동 상세
    # PUT    /api/workouts/log-exercises/{id}/           -> 운동 로그 상세 운동 수정
    # DELETE /api/workouts/log-exercises/{id}/           -> 운동 로그 상세 운동 삭제
    #
    # GET    /api/workouts/types/                        -> 운동 타입 목록
    # GET    /api/workouts/types/{id}/                   -> 운동 타입 상세
    #
    # GET    /api/workouts/stats/basic/                  -> 기본 운동 통계
    #
    # Ecommerce API (프론트엔드 요구사항에 맞춘 핵심 기능만):
    # GET    /api/ecommerce/categories/                  -> 카테고리 목록
    # GET    /api/ecommerce/categories/{id}/             -> 카테고리 상세
    #
    # GET    /api/ecommerce/products/                    -> 상품 목록 (필터링: category, search, min_price, max_price)
    # GET    /api/ecommerce/products/{id}/               -> 상품 상세
    #
    # GET    /api/ecommerce/carts/                       -> 장바구니 목록
    # POST   /api/ecommerce/carts/                       -> 장바구니 생성
    # GET    /api/ecommerce/carts/{id}/                  -> 장바구니 상세
    # PUT    /api/ecommerce/carts/{id}/                  -> 장바구니 수정
    # DELETE /api/ecommerce/carts/{id}/                  -> 장바구니 삭제
    # GET    /api/ecommerce/carts/my_cart/               -> 내 장바구니 조회
    # POST   /api/ecommerce/carts/add_item/              -> 장바구니에 상품 추가
    #
    # GET    /api/ecommerce/cart-items/                  -> 장바구니 아이템 목록
    # POST   /api/ecommerce/cart-items/                  -> 장바구니 아이템 생성
    # GET    /api/ecommerce/cart-items/{id}/             -> 장바구니 아이템 상세
    # PUT    /api/ecommerce/cart-items/{id}/             -> 장바구니 아이템 수정
    # DELETE /api/ecommerce/cart-items/{id}/             -> 장바구니 아이템 삭제
    #
    # GET    /api/ecommerce/orders/                      -> 주문 목록
    # POST   /api/ecommerce/orders/                      -> 주문 생성
    # GET    /api/ecommerce/orders/{id}/                 -> 주문 상세
    # PUT    /api/ecommerce/orders/{id}/                 -> 주문 수정
    # DELETE /api/ecommerce/orders/{id}/                 -> 주문 삭제
    #
    # GET    /api/ecommerce/reviews/                     -> 리뷰 목록
    # POST   /api/ecommerce/reviews/                     -> 리뷰 생성
    # GET    /api/ecommerce/reviews/{id}/                -> 리뷰 상세
    # PUT    /api/ecommerce/reviews/{id}/                -> 리뷰 수정
    # DELETE /api/ecommerce/reviews/{id}/                -> 리뷰 삭제
    #
    # Diet API (프론트엔드 요구사항에 맞춘 핵심 기능만):
    # GET    /api/diet/foods/                            -> 음식 목록 (필터링: search)
    # POST   /api/diet/foods/                            -> 음식 생성
    # GET    /api/diet/foods/{id}/                       -> 음식 상세
    # PUT    /api/diet/foods/{id}/                       -> 음식 수정
    # DELETE /api/diet/foods/{id}/                       -> 음식 삭제
    #
    # Users API (프론트엔드 요구사항에 맞춘 핵심 기능만):
    # GET    /api/users/profiles/                        -> 프로필 목록
    # POST   /api/users/profiles/                        -> 프로필 생성
    # GET    /api/users/profiles/{id}/                   -> 프로필 상세
    # PUT    /api/users/profiles/{id}/                   -> 프로필 수정
    # DELETE /api/users/profiles/{id}/                   -> 프로필 삭제
    #
    # Community API (프론트엔드 요구사항에 맞춘 핵심 기능만):
    # GET    /api/community/posts/                       -> 게시글 목록 (필터링: category, search, tags)
    # POST   /api/community/posts/                       -> 게시글 생성
    # GET    /api/community/posts/{id}/                  -> 게시글 상세
    # PUT    /api/community/posts/{id}/                  -> 게시글 수정
    # DELETE /api/community/posts/{id}/                  -> 게시글 삭제
    # GET    /api/community/posts/my_posts/              -> 내 게시글 목록
    # POST   /api/community/posts/{id}/like/             -> 게시글 좋아요
]
