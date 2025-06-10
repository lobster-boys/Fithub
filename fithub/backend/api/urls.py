from django.urls import path, include
from .views.ecommerce.category_views import categories, category
from .views.ecommerce.product_views import products, product
from .views.ecommerce.cart_views import CartAPI
from .views.ecommerce.order_views import OrdersAPI, OrderAPI
from .views import users, workouts


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
    path("dj-rest-auth/kakao/", users.KakaoLoginView.as_view(), name="kakao_login"),
    # 유저 프로필 URL
    path("dj-rest-auth/users/profile/", users.UserProfileCreateView.as_view(), name="profile-create"),
    path("dj-rest-auth/users/profile/<int:pk>/", users.UserProfileDetail.as_view(), name="profile-detail"),
    
    # 운동 앱 URL
    path("workouts/exercises/", workouts.ExerciseListView.as_view(), name="exercise-list"),
    path("workouts/exercises/<int:pk>/", workouts.ExerciseDetailView.as_view(), name="exercise-detail"),
    path("workouts/routines/", workouts.WorkoutRoutineListView.as_view(), name="routine-list"),
    path("workouts/routines/<int:pk>/", workouts.WorkoutRoutineDetailView.as_view(), name="routine-detail"),
    path("workouts/routines/create/", workouts.WorkoutRoutineCreateView.as_view(), name="routine-create"),
    path("workouts/routines/<int:pk>/update/", workouts.WorkoutRoutineUpdateView.as_view(), name="routine-update"),
    path("workouts/routines/<int:pk>/delete/", workouts.WorkoutRoutineDeleteView.as_view(), name="routine-delete"),
    path("workouts/routines/<int:pk>/copy/", workouts.copy_routine_view, name="routine-copy"),
    path("workouts/logs/", workouts.WorkoutLogListView.as_view(), name="log-list"),
    path("workouts/logs/create/", workouts.WorkoutLogCreateView.as_view(), name="log-create"),
    path("workouts/logs/<int:pk>/", workouts.WorkoutLogDetailView.as_view(), name="log-detail"),
    
    # 운동 로그 상세 운동 관리 URL
    path("workouts/logs/<int:workout_log_id>/exercises/", workouts.WorkoutLogExerciseListView.as_view(), name="log-exercise-list"),
    path("workouts/logs/<int:workout_log_id>/exercises/create/", workouts.WorkoutLogExerciseCreateView.as_view(), name="log-exercise-create"),
    path("workouts/logs/<int:workout_log_id>/exercises/bulk-create/", workouts.bulk_create_log_exercises, name="log-exercise-bulk-create"),
    path("workouts/log-exercises/<int:pk>/", workouts.WorkoutLogExerciseDetailView.as_view(), name="log-exercise-detail"),
    
    # 운동 타입 URL
    path("workouts/types/", workouts.WorkoutTypeListView.as_view(), name="workout-type-list"),
    path("workouts/types/<int:pk>/", workouts.WorkoutTypeDetailView.as_view(), name="workout-type-detail"),
    
    # 기본 통계 URL
    path("workouts/stats/", workouts.workout_stats_view, name="workout-stats"),
    
    # 확장 통계 URL
    path("workouts/stats/advanced/", workouts.advanced_workout_stats_view, name="advanced-workout-stats"),
    path("workouts/stats/streak/", workouts.workout_streak_view, name="workout-streak"),
    path("workouts/stats/type-distribution/", workouts.workout_type_distribution_view, name="workout-type-distribution"),
]
