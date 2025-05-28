from api.views.category_views import categories, category
from api.views.product_views import products, product
from django.urls import path, include

app_name = "api"

urlpatterns = [
    path("ecommerce/categories/", categories),
    path("ecommerce/category/<int:id>", category),
    path("ecommerce/products/", products),
    path("ecommerce/product/<int:id>", product),
    # 로그인/회원가입 URL
    path("dj-rest-auth/", include("dj_rest_auth.urls")),
    path("dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
]
