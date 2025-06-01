from django.urls import path, include
from .views import social_views, profile_views, community_views


app_name = "api"

urlpatterns = [
    # 로그인/회원가입 URL
    path("dj-rest-auth/", include("dj_rest_auth.urls")),
    path("dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
    path("dj-rest-auth/kakao/", social_views.KakaoLoginView.as_view(), name="kakao_login"),
    # 유저 프로필 URL
    path("dj-rest-auth/users/profile/", profile_views.UserProfileCreateView.as_view(), name="profile-create"),
    path("dj-rest-auth/users/profile/<int:pk>/", profile_views.UserProfileDetail.as_view(), name="profile-detail"),
    # 커뮤니티URL
    path('dj-rest-auth/posts/', community_views.UserPostCreateView.as_view(), name='post-creatRead'),
    path('dj-rest-auth/posts/<int:pk>/', community_views.UserPostDetail.as_view(), name='post-detail')
]
