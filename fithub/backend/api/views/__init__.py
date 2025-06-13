# Ecommerce views
from .ecommerce import *

# Workout views
from .workouts import *

# Users views
from .users import *

__all__ = [
    # Ecommerce
    'categories',
    'category',
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
    
    # Workouts
    'ExerciseListView',
    'ExerciseDetailView',
    'WorkoutRoutineListView',
    'WorkoutRoutineDetailView',
    'WorkoutRoutineCreateView',
    'WorkoutRoutineUpdateView', 
    'WorkoutRoutineDeleteView',
    'WorkoutLogListView',
    'WorkoutLogCreateView',
    'WorkoutLogDetailView',
    'workout_stats_view',
    'copy_routine_view',
    
    # Users
    'UserProfileCreateView',
    'UserProfileDetail',
    'KakaoLoginView',
] 