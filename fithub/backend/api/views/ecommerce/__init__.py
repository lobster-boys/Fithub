# ViewSets (리팩토링 완료)
from .category_views import CategoryViewSet
from .product_views import ProductViewSet

# Legacy views (점진적 교체를 위해 임시 유지)
from .category_views import categories, category
from .product_views import products, product

# Cart views
from .cart_views import CartAPI

# Order views
from .order_views import OrdersAPI, OrderAPI

# Coupon views
from .coupon_views import (
    coupons, coupon_detail, UserCouponAPI, use_coupon
)

# Point views
from .point_views import (
    UserPointAPI, PointTransactionAPI, earn_points, use_points
)

# Review views
from .review_views import (
    product_reviews, ReviewAPI, review_detail, product_review_stats
)

__all__ = [
    # New ViewSets
    'CategoryViewSet',
    'ProductViewSet',
    
    # Legacy views (추후 ViewSet으로 전환 예정)
    'categories',
    'category',
    'products', 
    'product',
    'CartAPI',
    'OrdersAPI',
    'OrderAPI',
    'coupons',
    'coupon_detail', 
    'UserCouponAPI',
    'use_coupon',
    'UserPointAPI',
    'PointTransactionAPI',
    'earn_points',
    'use_points',
    'product_reviews',
    'ReviewAPI',
    'review_detail',
    'product_review_stats',
] 