from api.views.category_views import categories, category
from api.views.product_views import products, product
from api.views.cart_views import CartAPI
from api.views.order_views import OrdersAPI, OrderAPI
from django.urls import path, include
from .views.community import post_views, comment_views, post_like_views, comment_like_views
from .views.social import social_views
from .views.users import profile_views


app_name = "api"

urlpatterns = [
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
    # 로그인/회원가입 URL
    path("dj-rest-auth/", include("dj_rest_auth.urls")),
    path("dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
    # 소셜 로그인 URL
    path("dj-rest-auth/kakao/", social_views.KakaoLoginView.as_view(), name="kakao-login"),
    path("dj-rest-auth/naver/", social_views.NaverLoginView.as_view(), name="naver-login"),
    path("dj-rest-auth/google/", social_views.GoogleLoginView.as_view(), name="google-login"),
    # 유저 프로필 URL
    path("dj-rest-auth/users/profile/", profile_views.UserProfileCreateView.as_view(), name="profile-create"),
    path("dj-rest-auth/users/profile/<int:pk>/", profile_views.UserProfileDetail.as_view(), name="profile-detail"),
    # 게시글 CRUD URL
    path('dj-rest-auth/posts/', post_views.UserPostCreateView.as_view(), name='post-creat'),
    path('dj-rest-auth/posts/<int:pk>/', post_views.UserPostDetail.as_view(), name='post-detail'),
    # 댓글 CRUD URL
    path('dj-rest-auth/posts/<int:post_id>/comments/', comment_views.UserCommentDetail.as_view(), name='comment-create'),
    path('dj-rest-auth/posts/<int:post_id>/comments/<int:pk>/', comment_views.UserCommentDetail.as_view(), name='comment-detail'),
    # 게시글 좋아요 URL
    path('dj-rest-auth/posts/<int:pk>/like/', post_like_views.PostLikeView.as_view(), name="post-like"),
    # 댓글 좋아요 URL
    path('dj-rest-auth/comments/<int:pk>/like/', comment_like_views.CommentLikeView.as_view(), name='comment-like'),
]
