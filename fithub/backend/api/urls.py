from api.views.category_views import categories, category
from api.views.product_views import products, product
from api.views.cart_views import CartAPI
from api.views.order_views import OrdersAPI, OrderAPI
from api.views.recommandation_views import ClickRecommandAPI, BestProductsViewSet, MostSoldProductsViewSet, ScoreBaseRecommandViewSet
from django.urls import path, include
from .views import social_views, profile_views
from rest_framework import routers


app_name = "api"

router = routers.DefaultRouter()
router.register('ecommerce/best-products', BestProductsViewSet, basename='best-product')
router.register('ecommerce/most-products', MostSoldProductsViewSet, basename='most-product')
router.register('ecommerce/rated-recommand', ScoreBaseRecommandViewSet, basename='rated-recommand')

urlpatterns = [
    path('', include(router.urls)),
    # 카테고리 URL
    path("ecommerce/categories/", categories),
    path("ecommerce/category/<int:id>", category),
    # 상품 URL
    path("ecommerce/products/", products),
    path("ecommerce/product/<int:id>", product),
    # 카트 URL
    path("ecommerce/cart/", CartAPI.as_view()),
    # 주문내역 URL
    path("ecommerce/order/", OrdersAPI.as_view()),
    path("ecommerce/order/<int:id>", OrdersAPI.as_view()),
    # 추천 리스트 URL
    path("ecommerce/recommand/clicked/", ClickRecommandAPI.as_view()),
    # 로그인/회원가입 URL
    path("dj-rest-auth/", include("dj_rest_auth.urls")),
    path("dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
    path("dj-rest-auth/kakao/", social_views.KakaoLoginView.as_view(), name="kakao_login"),
    # 유저 프로필 URL
    path("dj-rest-auth/users/profile/", profile_views.UserProfileCreateView.as_view(), name="profile-create"),
    path("dj-rest-auth/users/profile/<int:pk>/", profile_views.UserProfileDetail.as_view(), name="profile-detail"),
]
