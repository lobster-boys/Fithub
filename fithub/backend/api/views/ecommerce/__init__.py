# ViewSets (주 구조)
from .category_views import CategoryViewSet
from .product_views import ProductViewSet
from .cart_views import CartViewSet, CartItemViewSet
from .order_views import OrderViewSet
from .coupon_views import CouponViewSet, UserCouponViewSet
from .point_views import UserPointViewSet, PointTransactionViewSet
from .review_views import ReviewViewSet

# 하위 호환성을 위한 레거시 뷰들
from .category_views import categories, category
from .product_views import products, product
from .order_views import OrdersAPI, OrderAPI
from .coupon_views import coupons, coupon_detail, UserCouponAPI, use_coupon
from .point_views import UserPointAPI, PointTransactionAPI, earn_points, use_points
from .review_views import product_reviews, ReviewAPI, review_detail, product_review_stats

__all__ = [
    # ViewSets (주 구조)
    'CategoryViewSet',
    'ProductViewSet',
    'CartViewSet',
    'CartItemViewSet',
    'OrderViewSet',
    'CouponViewSet',
    'UserCouponViewSet',
    'UserPointViewSet',
    'PointTransactionViewSet',
    'ReviewViewSet',
    
    # 하위 호환성을 위한 레거시 뷰들
    'categories',
    'category',
    'products', 
    'product',
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