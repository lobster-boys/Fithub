from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# swagger
schema_view = get_schema_view(
    openapi.Info(
        title="FitHub Project",
        default_version='FitHub 1.0.0',
        description="fithub-project API 문서",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)


app_name = "api"

urlpatterns = [
    # swagger
    path(r'swagger(?P<format>\.json|\.yaml)', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path(r'swagger', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path(r'redoc', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc-v1'),

    # url
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("users/", include("allauth.urls")), # 소셜로그인
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)