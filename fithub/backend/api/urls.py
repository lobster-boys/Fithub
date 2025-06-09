from django.urls import path, include
from .views.community import post_views, comment_views, post_like_views, comment_like_views
from .views.social import social_views
from .views.users import profile_views
from .views.audit import changelog_views

app_name = "api"

urlpatterns = [
    # 로그인/회원가입 URL
    path("dj-rest-auth/", include("dj_rest_auth.urls")),
    path("dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
    # 소셜 로그인 URL
    path("dj-rest-auth/kakao/", social_views.KakaoLoginView.as_view(), name="kakao-login"),
    path("dj-rest-auth/naver/", social_views.NaverLoginView.as_view(), name="naver-login"),
    path("dj-rest-auth/google/", social_views.GoogleLoginView.as_view(), name="google-login"),
    # 유저 프로필 URL
    path("users/profile/", profile_views.UserProfileCreateView.as_view(), name="profile-create"),
    path("users/profile/<int:pk>/", profile_views.UserProfileDetail.as_view(), name="profile-detail"),
    # 게시글 CRUD URL
    path('community/posts/', post_views.UserPostCreateView.as_view(), name='post-creat'),
    path('community/posts/<int:pk>/', post_views.UserPostDetail.as_view(), name='post-detail'),
    # 댓글 CRUD URL
    path('community/posts/<int:post_id>/comments/', comment_views.UserCommentDetail.as_view(), name='comment-create'),
    path('community/posts/<int:post_id>/comments/<int:pk>/', comment_views.UserCommentDetail.as_view(), name='comment-detail'),
    # 게시글 좋아요 URL
    path('community/posts/<int:pk>/like/', post_like_views.PostLikeView.as_view(), name="post-like"),
    # 댓글 좋아요 URL
    path('community/comments/<int:pk>/like/', comment_like_views.CommentLikeView.as_view(), name='comment-like'),
    # 변경 로그 감지 URL
    path('audit/change-logs/', changelog_views.ChangeLogListView.as_view(), name='change-log-list'),
    path('audit/change-logs/<int:log_id>/', changelog_views.ChangeLogDetailView.as_view(), name='change-log-detail'),
    path('audit/restore-data/', changelog_views.RestoreDataView.as_view(), name='restore-data'),
    path('audit/sync-failed-logs/', changelog_views.SyncFailedLogsView.as_view(), name='sync-failed-logs'),
    path('audit/sync-status/', changelog_views.SyncStatusView.as_view(), name='sync-status')
]
