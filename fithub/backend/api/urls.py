from django.urls import path
from api.views.category_views import categories, category
from api.views.product_views import products, product

app_name = "api"

urlpatterns = [
    path("ecommerce/categories/", categories),
    path("ecommerce/category/<int:id>", category),
    path("ecommerce/products/", products),
    path("ecommerce/product/<int:id>", product),
]