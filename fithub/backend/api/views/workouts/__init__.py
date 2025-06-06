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

# Stats views
from .stats_views import (
    workout_stats_view
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
    
    # Stats
    'workout_stats_view',
] 