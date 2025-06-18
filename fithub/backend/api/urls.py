from api.views.ecommerce.category_views import categories, category
from api.views.ecommerce.product_views import products, product
from api.views.ecommerce.cart_views import CartAPI
from api.views.ecommerce.order_views import OrdersAPI, OrderAPI
from api.views.recommandation_views import ClickRecommandAPI
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.challenge_views import ChallengeViewSet,ChallengePointViewSet,SocialShareViewSet
from .views.point_transaction_views import PointTransactionViewSet
from .views.challenge_participant_views import ChallengeParticipantViewSet
from .views.challenge_ranking_views import ChallengeRankingAPIView
from api.views.routine_share_permission_viewset import RoutineSharePermissionViewSet
from .views.routine_viewset import RoutineViewSet

# ViewSets (단순화된 버전)
from .views.workouts import ExerciseViewSet, WorkoutRoutineViewSet, WorkoutLogViewSet, WorkoutLogExerciseViewSet, WorkoutTypeViewSet, WorkoutStatsViewSet
from .views.ecommerce import CategoryViewSet, ProductViewSet
from .views.ecommerce.cart_views import CartViewSet, CartItemViewSet
from .views.ecommerce.order_views import OrderViewSet
from .views.ecommerce.review_views import ReviewViewSet
from .views.diet.food_views import FoodViewSet
from .views.users.profile_views import UserProfileViewSet
from .views.community.post_views import PostViewSet
from .views.community import post_views, comment_views, post_like_views, comment_like_views
from .views.social import social_views
from .views.users import profile_views
from .views.audit import changelog_views
from .views.diet import food_views, food_search_views, mealplan_views

app_name = "api"

# Router 설정
router = DefaultRouter()
router.register(r"challenges", ChallengeViewSet, basename="challenge")
router.register(r"points", ChallengePointViewSet, basename="challenge-point")
router.register(r"shares", SocialShareViewSet, basename="social-share")

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

# Challenge 및 권한 관련 ViewSets
router.register(
    r"challenges/(?P<challenge_pk>\d+)/participants",
    ChallengeParticipantViewSet,
    basename="challenge-participant",
)
router.register(
    r"routine-share", RoutineSharePermissionViewSet, basename="routine-share"
)

router.register(r"routines", RoutineViewSet, basename="routine")

urlpatterns = [
    # ViewSet 라우터 URL들
    path('', include(router.urls)),
    
    # =================== 이커머스 추천 시스템 (추가) ===================
    # 카테고리 URL (추천용)
    path("ecommerce/categories/", categories),
    path("ecommerce/category/<int:id>", category),
    # 상품 URL (추천용)
    path("ecommerce/products/", products),
    path("ecommerce/product/<int:id>", product),
    # 카트 URL (추천용)
    path("ecommerce/cart/", CartAPI.as_view()),
    # 주문내역 URL (추천용)
    path("ecommerce/order/", OrdersAPI.as_view()),
    path("ecommerce/order/<int:id>", OrdersAPI.as_view()),
    # 추천 리스트 URL
    path("ecommerce/recommand/clicked/", ClickRecommandAPI.as_view()),
    
    # =================== 인증 및 소셜 로그인 ===================
    # 로그인/회원가입 URL
    path("dj-rest-auth/", include("dj_rest_auth.urls")),
    path("dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
    # 소셜 로그인 URL
    path("dj-rest-auth/kakao/", social_views.KakaoLoginView.as_view(), name="kakao-login"),
    path("dj-rest-auth/naver/", social_views.NaverLoginView.as_view(), name="naver-login"),
    path("dj-rest-auth/google/", social_views.GoogleLoginView.as_view(), name="google-login"),
    
    # =================== 사용자 프로필 ===================
    # 유저 프로필 URL
    path("users/profile/", profile_views.UserProfileCreateView.as_view(), name="profile-create"),
    path("users/profile/<int:pk>/", profile_views.UserProfileDetail.as_view(), name="profile-detail"),
    
    # =================== 커뮤니티 ===================
    # 게시글 CRUD URL
    path('community/posts/', post_views.UserPostCreateView.as_view(), name='post-create'),
    path('community/posts/<int:pk>/', post_views.UserPostDetail.as_view(), name='post-detail'),
    # 댓글 CRUD URL
    path('community/posts/<int:post_id>/comments/', comment_views.UserCommentDetail.as_view(), name='comment-create'),
    path('community/posts/<int:post_id>/comments/<int:pk>/', comment_views.UserCommentDetail.as_view(), name='comment-detail'),
    # 게시글 좋아요 URL
    path('community/posts/<int:pk>/like/', post_like_views.PostLikeView.as_view(), name="post-like"),
    # 댓글 좋아요 URL
    path('community/comments/<int:pk>/like/', comment_like_views.CommentLikeView.as_view(), name='comment-like'),
    
    # =================== 감사/변경 로그 ===================
    # 변경 로그 감지 URL
    path('audit/change-logs/', changelog_views.ChangeLogListView.as_view(), name='change-log-list'),
    path('audit/change-logs/<int:log_id>/', changelog_views.ChangeLogDetailView.as_view(), name='change-log-detail'),
    path('audit/restore-data/', changelog_views.RestoreDataView.as_view(), name='restore-data'),
    path('audit/sync-failed-logs/', changelog_views.SyncFailedLogsView.as_view(), name='sync-failed-logs'),
    path('audit/sync-status/', changelog_views.SyncStatusView.as_view(), name='sync-status'),
    
    # =================== 식단 관련 ===================
    # diet URL
    path('diet/foods/', food_views.FoodListView.as_view(), name='food-list'),
    path('diet/foods/<int:pk>/', food_views.FoodDetailView.as_view(), name='food-detail'),
    path('diet/foods/search/', food_search_views.FoodSearchListView.as_view(), name='food-search'),
    # diet-MealPlan URL (새로 추가된 식단 계산 기능)
    path('diet/mealplan/', mealplan_views.MealPlanListView.as_view(), name='mealplan-list-create'),
    path('diet/mealplan/<int:pk>/', mealplan_views.MealPlanDetailView.as_view(), name='mealplan-detail'),
    
    # =================== 단순화된 API 엔드포인트 문서 ===================
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
    # GET    /api/ecommerce/categories/                  -> 카테고리 목록 (Router 기반)
    # GET    /api/ecommerce/categories/{id}/             -> 카테고리 상세 (Router 기반)
    # GET    /api/ecommerce/categories/                  -> 카테고리 목록 (추천용)
    # GET    /api/ecommerce/category/{id}                -> 카테고리 상세 (추천용)
    #
    # GET    /api/ecommerce/products/                    -> 상품 목록 (Router 기반)
    # GET    /api/ecommerce/products/{id}/               -> 상품 상세 (Router 기반)
    # GET    /api/ecommerce/products/                    -> 상품 목록 (추천용)
    # GET    /api/ecommerce/product/{id}                 -> 상품 상세 (추천용)
    #
    # GET    /api/ecommerce/carts/                       -> 장바구니 목록 (Router 기반)
    # POST   /api/ecommerce/carts/                       -> 장바구니 생성 (Router 기반)
    # GET    /api/ecommerce/carts/{id}/                  -> 장바구니 상세 (Router 기반)
    # PUT    /api/ecommerce/carts/{id}/                  -> 장바구니 수정 (Router 기반)
    # DELETE /api/ecommerce/carts/{id}/                  -> 장바구니 삭제 (Router 기반)
    # GET    /api/ecommerce/carts/my_cart/               -> 내 장바구니 조회 (Router 기반)
    # POST   /api/ecommerce/carts/add_item/              -> 장바구니에 상품 추가 (Router 기반)
    # GET    /api/ecommerce/cart/                        -> 카트 조회 (추천용)
    # POST   /api/ecommerce/cart/                        -> 카트 조작 (추천용)
    #
    # GET    /api/ecommerce/cart-items/                  -> 장바구니 아이템 목록
    # POST   /api/ecommerce/cart-items/                  -> 장바구니 아이템 생성
    # GET    /api/ecommerce/cart-items/{id}/             -> 장바구니 아이템 상세
    # PUT    /api/ecommerce/cart-items/{id}/             -> 장바구니 아이템 수정
    # DELETE /api/ecommerce/cart-items/{id}/             -> 장바구니 아이템 삭제
    #
    # GET    /api/ecommerce/orders/                      -> 주문 목록 (Router 기반)
    # POST   /api/ecommerce/orders/                      -> 주문 생성 (Router 기반)
    # GET    /api/ecommerce/orders/{id}/                 -> 주문 상세 (Router 기반)
    # PUT    /api/ecommerce/orders/{id}/                 -> 주문 수정 (Router 기반)
    # DELETE /api/ecommerce/orders/{id}/                 -> 주문 삭제 (Router 기반)
    # GET    /api/ecommerce/order/                       -> 주문 목록 (추천용)
    # POST   /api/ecommerce/order/                       -> 주문 생성 (추천용)
    # GET    /api/ecommerce/order/{id}                   -> 주문 상세 (추천용)
    #
    # GET    /api/ecommerce/reviews/                     -> 리뷰 목록
    # POST   /api/ecommerce/reviews/                     -> 리뷰 생성
    # GET    /api/ecommerce/reviews/{id}/                -> 리뷰 상세
    # PUT    /api/ecommerce/reviews/{id}/                -> 리뷰 수정
    # DELETE /api/ecommerce/reviews/{id}/                -> 리뷰 삭제
    #
    # POST   /api/ecommerce/recommand/clicked/           -> 클릭 기반 추천 시스템
    #
    # Diet API (프론트엔드 요구사항에 맞춘 핵심 기능만):
    # GET    /api/diet/foods/                            -> 음식 목록 (필터링: search)
    # POST   /api/diet/foods/                            -> 음식 생성
    # GET    /api/diet/foods/{id}/                       -> 음식 상세
    # PUT    /api/diet/foods/{id}/                       -> 음식 수정
    # DELETE /api/diet/foods/{id}/                       -> 음식 삭제
    # GET    /api/diet/foods/search/                     -> 음식 검색
    # GET    /api/diet/mealplan/                         -> 식단 계획 목록
    # POST   /api/diet/mealplan/                         -> 식단 계획 생성
    # GET    /api/diet/mealplan/{id}/                    -> 식단 계획 상세
    # PUT    /api/diet/mealplan/{id}/                    -> 식단 계획 수정
    # DELETE /api/diet/mealplan/{id}/                    -> 식단 계획 삭제
    #
    # Users API (프론트엔드 요구사항에 맞춘 핵심 기능만):
    # GET    /api/users/profiles/                        -> 프로필 목록
    # POST   /api/users/profiles/                        -> 프로필 생성
    # GET    /api/users/profiles/{id}/                   -> 프로필 상세
    # PUT    /api/users/profiles/{id}/                   -> 프로필 수정
    # DELETE /api/users/profiles/{id}/                   -> 프로필 삭제
    # GET    /api/users/profiles/me/                     -> 현재 사용자 프로필 조회
    # GET    /api/users/profile/                         -> 내 프로필 조회 (레거시)
    # POST   /api/users/profile/                         -> 내 프로필 생성 (레거시)
    # GET    /api/users/profile/{id}/                    -> 특정 프로필 상세 (레거시)
    #
    # Community API (프론트엔드 요구사항에 맞춘 핵심 기능만):
    # GET    /api/community/posts/                       -> 게시글 목록 (필터링: category, search, tags)
    # POST   /api/community/posts/                       -> 게시글 생성
    # GET    /api/community/posts/{id}/                  -> 게시글 상세
    # PUT    /api/community/posts/{id}/                  -> 게시글 수정
    # DELETE /api/community/posts/{id}/                  -> 게시글 삭제
    # GET    /api/community/posts/my_posts/              -> 내 게시글 목록
    # POST   /api/community/posts/{id}/like/             -> 게시글 좋아요
    # GET    /api/community/posts/{post_id}/comments/    -> 댓글 목록
    # POST   /api/community/posts/{post_id}/comments/    -> 댓글 생성
    # GET    /api/community/posts/{post_id}/comments/{id}/ -> 댓글 상세
    # PUT    /api/community/posts/{post_id}/comments/{id}/ -> 댓글 수정
    # DELETE /api/community/posts/{post_id}/comments/{id}/ -> 댓글 삭제
    # POST   /api/community/comments/{id}/like/          -> 댓글 좋아요
    #
    # Challenge API:
    # GET    /api/challenges/                            -> 챌린지 목록
    # POST   /api/challenges/                            -> 챌린지 생성
    # GET    /api/challenges/{id}/                       -> 챌린지 상세
    # PUT    /api/challenges/{id}/                       -> 챌린지 수정
    # DELETE /api/challenges/{id}/                       -> 챌린지 삭제
    #
    # GET    /api/points/                                -> 포인트 목록
    # POST   /api/points/                                -> 포인트 생성
    #
    # GET    /api/shares/                                -> 소셜 공유 목록
    # POST   /api/shares/                                -> 소셜 공유 생성
    #
    # Routine Share Permission API:
    # GET    /api/routine-share/                         -> 루틴 공유 권한 목록
    # POST   /api/routine-share/                         -> 루틴 공유 권한 생성
    # GET    /api/routine-share/{id}/                    -> 루틴 공유 권한 상세
    # PUT    /api/routine-share/{id}/                    -> 루틴 공유 권한 수정
    # DELETE /api/routine-share/{id}/                    -> 루틴 공유 권한 삭제
    #
    # GET    /api/routines/                              -> 루틴 목록
    # POST   /api/routines/                              -> 루틴 생성
    # GET    /api/routines/{id}/                         -> 루틴 상세
    # PUT    /api/routines/{id}/                         -> 루틴 수정
    # DELETE /api/routines/{id}/                         -> 루틴 삭제
    #
    # Authentication API:
    # POST   /api/dj-rest-auth/login/                    -> 로그인
    # POST   /api/dj-rest-auth/logout/                   -> 로그아웃
    # POST   /api/dj-rest-auth/registration/             -> 회원가입
    # POST   /api/dj-rest-auth/kakao/                    -> 카카오 로그인
    # POST   /api/dj-rest-auth/naver/                    -> 네이버 로그인
    # POST   /api/dj-rest-auth/google/                   -> 구글 로그인
    #
    # Audit API:
    # GET    /api/audit/change-logs/                     -> 변경 로그 목록
    # GET    /api/audit/change-logs/{id}/                -> 변경 로그 상세
    # POST   /api/audit/restore-data/                    -> 데이터 복원
    # POST   /api/audit/sync-failed-logs/                -> 실패 로그 동기화
    # GET    /api/audit/sync-status/                     -> 동기화 상태 조회
]
