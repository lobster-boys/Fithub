# Exercise views
from .exercise_views import (
    ExerciseListView,
    ExerciseDetailView
)

# Routine views
from .routine_views import (
    WorkoutRoutineListView,
    WorkoutRoutineDetailView,
    WorkoutRoutineCreateView,
    WorkoutRoutineUpdateView,
    WorkoutRoutineDeleteView,
    copy_routine_view
)

# Log views
from .log_views import (
    WorkoutLogListView,
    WorkoutLogCreateView,
    WorkoutLogDetailView
)

# Log Exercise views
from .log_exercise_views import (
    WorkoutLogExerciseListView,
    WorkoutLogExerciseCreateView,
    WorkoutLogExerciseDetailView,
    bulk_create_log_exercises
)

# Type views
from .type_views import (
    WorkoutTypeListView,
    WorkoutTypeDetailView
)

# Stats views
from .stats_views import (
    workout_stats_view
)

# Advanced Stats views
from .advanced_stats_views import (
    advanced_workout_stats_view,
    workout_streak_view,
    workout_type_distribution_view
)

__all__ = [
    # Exercise
    'ExerciseListView',
    'ExerciseDetailView',
    
    # Routine
    'WorkoutRoutineListView',
    'WorkoutRoutineDetailView',
    'WorkoutRoutineCreateView',
    'WorkoutRoutineUpdateView',
    'WorkoutRoutineDeleteView',
    'copy_routine_view',
    
    # Log
    'WorkoutLogListView',
    'WorkoutLogCreateView',
    'WorkoutLogDetailView',
    
    # Log Exercise
    'WorkoutLogExerciseListView',
    'WorkoutLogExerciseCreateView',
    'WorkoutLogExerciseDetailView',
    'bulk_create_log_exercises',
    
    # Type
    'WorkoutTypeListView',
    'WorkoutTypeDetailView',
    
    # Stats
    'workout_stats_view',
    
    # Advanced Stats
    'advanced_workout_stats_view',
    'workout_streak_view',
    'workout_type_distribution_view',
] 