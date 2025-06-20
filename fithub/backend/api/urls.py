from api.views.ecommerce.category_views import categories, category
from api.views.ecommerce.product_views import products, product
from api.views.ecommerce.order_views import OrdersAPI, OrderAPI
from api.views.recommandation_views import ClickRecommandAPI
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views.challenge_views import (
    ChallengeViewSet,
    ChallengePointViewSet,
    SocialShareViewSet,
)
from api.views.point_transaction_views import PointTransactionViewSet
from api.views.challenge_participant_views import ChallengeParticipantViewSet
from api.views.routine_share_permission_viewset import RoutineSharePermissionViewSet
from api.views.routine_viewset import RoutineViewSet
from api.views.routine_share_link_viewset import RoutineShareLinkViewSet
from api.views.routine_feed_viewset import RoutineFeedViewSet

# ViewSets (단순화된 버전)
from .views.workouts import ExerciseViewSet, WorkoutRoutineViewSet, WorkoutLogViewSet, WorkoutLogExerciseViewSet, WorkoutTypeViewSet, WorkoutStatsViewSet
from .views.workouts.session_views import WorkoutSessionViewSet
from .views.ecommerce import CategoryViewSet, ProductViewSet
from .views.ecommerce.cart_views import CartViewSet, CartItemViewSet
from .views.ecommerce.order_views import OrderViewSet
from .views.ecommerce.review_views import ReviewViewSet
from .views.diet.food_views import FoodViewSet
from .views.users.profile_views import UserProfileViewSet
from .views.onboarding.onboarding_views import OnboardingViewSet
from .views.community.post_views import PostViewSet
from .views.community import post_views, comment_views, comment_like_views
from .views.social import social_views
from .views.users import profile_views
from .views.users import CustomRegisterView
from .views.users.csrf_views import get_csrf_token
from .views.audit import changelog_views
from .views.diet import food_views, food_search_views, mealplan_views, recommend_views
from .views.users.auth_views import CustomLogoutView, current_user_info

app_name = "api"

# Router 설정
router = DefaultRouter()

# ── 챌린지 관련 ───────────────────────────────────────
router.register(r"challenges", ChallengeViewSet, basename="challenge")
router.register(r"points", ChallengePointViewSet, basename="challenge-point")
router.register(r"shares", SocialShareViewSet, basename="social-share")
router.register(r"transactions", PointTransactionViewSet, basename="point-transaction")

# Workouts 앱 ViewSets
router.register(r'workouts/exercises', ExerciseViewSet, basename='exercise')
router.register(r'workouts/routines', WorkoutRoutineViewSet, basename='routine')
router.register(r'workouts/sessions', WorkoutSessionViewSet, basename='workout-session')
router.register(r'workouts/logs', WorkoutLogViewSet, basename='log')
router.register(r'workouts/log-exercises', WorkoutLogExerciseViewSet, basename='log-exercise')
router.register(r'workouts/types', WorkoutTypeViewSet, basename='workout-type')
router.register(r'workouts/stats', WorkoutStatsViewSet, basename='workout-stats')

# Ecommerce 앱 ViewSets
router.register(r'ecommerce/categories', CategoryViewSet, basename='category')
router.register(r'ecommerce/products', ProductViewSet, basename='product')
router.register(r'ecommerce/carts', CartViewSet, basename='cart')
router.register(r'ecommerce/cart-items', CartItemViewSet, basename='cart-item')
router.register(r'ecommerce/orders', OrderViewSet, basename='order')
router.register(r'ecommerce/reviews', ReviewViewSet, basename='review')

# Diet 앱 ViewSets
router.register(r'diet/foods', FoodViewSet, basename='food')

# Users 앱 ViewSets
router.register(r'users/profiles', UserProfileViewSet, basename='user-profile')

# Onboarding 앱 ViewSets
router.register(r'onboarding', OnboardingViewSet, basename='onboarding')

# Community 앱 ViewSets
router.register(r'community/posts', PostViewSet, basename='post')

# Challenge 및 권한 관련 ViewSets
router.register(
    r"challenges/(?P<challenge_pk>\d+)/participants",
    ChallengeParticipantViewSet,
    basename="challenge-participant",
)

# ── 루틴 기본 CRUD ─────────────────────────────────────
router.register(r"routines", RoutineViewSet, basename="community-routine")

# ── 공유 링크 생성·관리 (cc-share-1) ─────────────────────
router.register(
    r"routine-shares",
    RoutineShareLinkViewSet,
    basename="routine-share-link",
)

# ── 공유 권한 부여·관리 (cc-share-2) ────────────────────
router.register(
    r"routine-share-permissions",
    RoutineSharePermissionViewSet,
    basename="routine-share-permission",
)

# ── 피드 추천 루틴 노출 (cr-share-2) ────────────────────
router.register(
    r"feed/routines",
    RoutineFeedViewSet,
    basename="routine-feed",
)

urlpatterns = [
    # ViewSet 라우터 URL들
    path('', include(router.urls)),
    
    # =================== 사용자 인증 정보 확인 ===================
    path("auth/user-info/", current_user_info, name="current-user-info"),
    
    # =================== 추천 시스템 (이커머스 전용) ===================
    # Router 기반 API와 별도로 추천 시스템용 API 유지
    path("ecommerce/recommand/clicked/", ClickRecommandAPI.as_view(), name="click-recommendation"),
    
    # =================== JWT 기반 인증 및 소셜 로그인 ===================
    path("dj-rest-auth/", include("dj_rest_auth.urls")),
    # JWT 회원가입 URL
    path("dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
    # 커스텀 회원가입 뷰 (디버깅을 위해)
    path("dj-rest-auth/custom-registration/", CustomRegisterView.as_view(), name="rest_register"),
    # 소셜 로그인 URL
    path("dj-rest-auth/kakao/", social_views.KakaoLoginView.as_view(), name="kakao-login"),
    path("dj-rest-auth/naver/", social_views.NaverLoginView.as_view(), name="naver-login"),
    path("dj-rest-auth/google/", social_views.GoogleLoginView.as_view(), name="google-login"),
    
    # =================== 사용자 프로필 ===================
    # 유저 프로필 URL
    path("users/profile/", profile_views.UserProfileCreateView.as_view(), name="profile-create"),
    path("users/profile/<int:pk>/", profile_views.UserProfileDetail.as_view(), name="profile-detail"),
    
    # =================== 커뮤니티 ===================
    # 게시글 CRUD 및 좋아요는 router 기반 PostViewSet 사용
    # - 게시글 목록: GET /api/community/posts/
    # - 게시글 상세: GET /api/community/posts/{id}/
    # - 게시글 좋아요: POST /api/community/posts/{id}/like/
    # 댓글 CRUD URL
    path('community/posts/<int:post_id>/comments/', comment_views.UserCommentDetail.as_view(), name='comment-create'),
    path('community/posts/<int:post_id>/comments/<int:pk>/', comment_views.UserCommentDetail.as_view(), name='comment-detail'),
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
    # diet URL은 router 기반 FoodViewSet 사용 (/api/diet/foods/)
    # diet-MealPlan URL (새로 추가된 식단 계산 기능)
    path('diet/mealplan/', mealplan_views.MealPlanListView.as_view(), name='mealplan-list-create'),
    path('diet/mealplan/<int:pk>/', mealplan_views.MealPlanDetailView.as_view(), name='mealplan-detail'),
    # diet-recommend URL
    path('diet/recommend/', recommend_views.DietRecommendView.as_view(), name='diet-recommend'),
    
    # =================== 챌린지 랭킹 ===================
    # path('challenges/ranking/', ChallengeRankingAPIView.as_view(), name='challenge-ranking'),
]
