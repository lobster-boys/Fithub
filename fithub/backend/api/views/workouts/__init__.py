# 운동 관련 ViewSet들
from .exercise_views import ExerciseViewSet
from .routine_views import WorkoutRoutineViewSet
from .log_views import WorkoutLogViewSet
from .log_exercise_views import WorkoutLogExerciseViewSet
from .type_views import WorkoutTypeViewSet
from .stats_views import WorkoutStatsViewSet

# Legacy views (추후 ViewSet으로 전환 예정)
from .log_exercise_views import (
    WorkoutLogExerciseListView,
    WorkoutLogExerciseCreateView,
    WorkoutLogExerciseDetailView,
    bulk_create_log_exercises
)
from .type_views import (
    WorkoutTypeListView,
    WorkoutTypeDetailView
)

__all__ = [
    'ExerciseViewSet',
    'WorkoutRoutineViewSet',
    'WorkoutLogViewSet',
    'WorkoutLogExerciseViewSet',
    'WorkoutTypeViewSet',
    'WorkoutStatsViewSet',
    
    # Legacy views
    'WorkoutLogExerciseListView',
    'WorkoutLogExerciseCreateView',
    'WorkoutLogExerciseDetailView',
    'bulk_create_log_exercises',
    'WorkoutTypeListView',
    'WorkoutTypeDetailView',
] 