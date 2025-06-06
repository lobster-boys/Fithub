from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Avg
from .models import Exercise, WorkoutRoutine, RoutineExercise, WorkoutLog, WorkoutStats


# ==================== Exercise Admin ====================
@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'difficulty_level', 'muscle_groups', 'equipment_needed', 
        'calories_per_minute', 'is_active', 'usage_count'
    ]
    list_filter = [
        'difficulty_level', 'is_active', 'created_at',
        ('muscle_groups', admin.SimpleListFilter)
    ]
    search_fields = ['name', 'description', 'muscle_groups', 'equipment_needed']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at', 'usage_count']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('name', 'description', 'difficulty_level', 'is_active')
        }),
        ('운동 상세', {
            'fields': ('muscle_groups', 'equipment_needed', 'instructions', 'video_url')
        }),
        ('칼로리 정보', {
            'fields': ('calories_per_minute',)
        }),
        ('시스템 정보', {
            'fields': ('usage_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def usage_count(self, obj):
        """운동 사용 횟수"""
        return obj.routine_exercises.count()
    usage_count.short_description = '사용 횟수'
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('routine_exercises')


# ==================== Routine Admin ====================
class RoutineExerciseInline(admin.TabularInline):
    model = RoutineExercise
    extra = 0
    min_num = 1
    ordering = ['order']
    fields = ['exercise', 'sets', 'reps', 'weight', 'rest_time', 'order', 'notes']
    autocomplete_fields = ['exercise']


@admin.register(WorkoutRoutine)
class WorkoutRoutineAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'user', 'difficulty_level', 'estimated_duration', 
        'exercise_count_display', 'usage_count', 'average_rating_display',
        'is_public', 'is_featured', 'is_template', 'created_at'
    ]
    list_filter = [
        'difficulty_level', 'is_public', 'is_featured', 'is_template',
        'created_at', 'user'
    ]
    search_fields = [
        'name', 'description', 'user__username', 'user__first_name', 
        'user__last_name', 'target_muscle_groups'
    ]
    ordering = ['-created_at']
    readonly_fields = [
        'usage_count', 'rating_sum', 'rating_count', 'average_rating_display',
        'estimated_calories_display', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('user', 'name', 'description', 'difficulty_level')
        }),
        ('운동 상세', {
            'fields': ('estimated_duration', 'target_muscle_groups')
        }),
        ('공개 설정', {
            'fields': ('is_public', 'is_featured', 'is_template')
        }),
        ('통계 정보', {
            'fields': (
                'usage_count', 'average_rating_display', 'estimated_calories_display',
                'rating_sum', 'rating_count'
            ),
            'classes': ('collapse',)
        }),
        ('시스템 정보', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [RoutineExerciseInline]
    autocomplete_fields = ['user']
    
    def exercise_count_display(self, obj):
        """운동 개수 표시"""
        count = obj.routine_exercises.count()
        if count > 0:
            return format_html(
                '<span style="color: green; font-weight: bold;">{}</span>', 
                count
            )
        return count
    exercise_count_display.short_description = '운동 개수'
    
    def average_rating_display(self, obj):
        """평균 평점 표시"""
        if obj.rating_count == 0:
            return "평가 없음"
        
        avg_rating = obj.average_rating
        color = 'green' if avg_rating >= 4 else 'orange' if avg_rating >= 3 else 'red'
        stars = '★' * int(avg_rating) + '☆' * (5 - int(avg_rating))
        
        return format_html(
            '<span style="color: {};">{} ({})</span>',
            color, stars, avg_rating
        )
    average_rating_display.short_description = '평균 평점'
    
    def estimated_calories_display(self, obj):
        """예상 칼로리 표시"""
        calories = obj.estimated_calories
        return f"{calories} kcal"
    estimated_calories_display.short_description = '예상 칼로리'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user').prefetch_related(
            'routine_exercises__exercise'
        )


@admin.register(RoutineExercise)
class RoutineExerciseAdmin(admin.ModelAdmin):
    list_display = [
        'routine', 'exercise', 'sets', 'reps', 'weight', 
        'rest_time', 'order', 'estimated_duration_display'
    ]
    list_filter = [
        'routine__difficulty_level', 'exercise__difficulty_level',
        'routine__user'
    ]
    search_fields = [
        'routine__name', 'exercise__name', 'routine__user__username'
    ]
    ordering = ['routine', 'order']
    autocomplete_fields = ['routine', 'exercise']
    
    def estimated_duration_display(self, obj):
        """예상 소요시간 표시"""
        duration = obj.estimated_duration_minutes
        return f"{duration}분"
    estimated_duration_display.short_description = '예상 소요시간'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'routine', 'routine__user', 'exercise'
        )


# ==================== Log Admin ====================
@admin.register(WorkoutLog)
class WorkoutLogAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'routine', 'workout_date_display', 'duration_hours_display',
        'calories_burned', 'rating_display', 'mood_display'
    ]
    list_filter = [
        'rating', 'mood', 'start_time', 'routine__difficulty_level',
        'user'
    ]
    search_fields = [
        'user__username', 'user__first_name', 'user__last_name',
        'routine__name', 'notes'
    ]
    ordering = ['-start_time']
    date_hierarchy = 'start_time'
    readonly_fields = [
        'duration_hours_display', 'workout_date', 'calories_per_minute_display',
        'created_at'
    ]
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('user', 'routine', 'start_time', 'end_time')
        }),
        ('운동 결과', {
            'fields': (
                'duration_minutes', 'duration_hours_display', 
                'calories_burned', 'calories_per_minute_display'
            )
        }),
        ('평가', {
            'fields': ('rating', 'mood', 'notes')
        }),
        ('시스템 정보', {
            'fields': ('workout_date', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    autocomplete_fields = ['user', 'routine']
    
    def workout_date_display(self, obj):
        """운동 날짜 표시"""
        return obj.start_time.strftime('%Y-%m-%d (%a)')
    workout_date_display.short_description = '운동 날짜'
    
    def duration_hours_display(self, obj):
        """운동 시간 표시"""
        hours = obj.duration_hours
        return f"{obj.duration_minutes}분 ({hours}시간)"
    duration_hours_display.short_description = '운동 시간'
    
    def rating_display(self, obj):
        """평점 표시"""
        stars = '★' * obj.rating + '☆' * (5 - obj.rating)
        color = 'green' if obj.rating >= 4 else 'orange' if obj.rating >= 3 else 'red'
        return format_html(
            '<span style="color: {};">{}</span>', 
            color, stars
        )
    rating_display.short_description = '만족도'
    
    def mood_display(self, obj):
        """컨디션 표시"""
        mood_colors = {
            'excellent': 'green',
            'good': 'lightgreen', 
            'normal': 'orange',
            'tired': 'red',
            'bad': 'darkred'
        }
        color = mood_colors.get(obj.mood, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_mood_display()
        )
    mood_display.short_description = '컨디션'
    
    def calories_per_minute_display(self, obj):
        """분당 칼로리 표시"""
        return f"{obj.calories_per_minute} kcal/분"
    calories_per_minute_display.short_description = '분당 칼로리'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'routine')


# ==================== Stats Admin ====================
@admin.register(WorkoutStats)
class WorkoutStatsAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'total_workouts', 'total_duration_display',
        'total_calories_burned', 'average_rating_display',
        'current_streak_days', 'max_streak_days', 'last_workout_date'
    ]
    list_filter = ['last_workout_date', 'current_streak_days']
    search_fields = ['user__username', 'user__first_name', 'user__last_name']
    ordering = ['-total_workouts']
    readonly_fields = [
        'total_duration_display', 'average_rating_display',
        'favorite_mood_display', 'updated_at'
    ]
    
    fieldsets = (
        ('사용자', {
            'fields': ('user',)
        }),
        ('운동 통계', {
            'fields': (
                'total_workouts', 'total_duration_minutes', 'total_duration_display',
                'total_calories_burned', 'longest_workout_minutes'
            )
        }),
        ('평가 통계', {
            'fields': (
                'average_rating', 'average_rating_display',
                'favorite_mood', 'favorite_mood_display'
            )
        }),
        ('연속 운동', {
            'fields': (
                'current_streak_days', 'max_streak_days', 'last_workout_date'
            )
        }),
        ('시스템 정보', {
            'fields': ('updated_at',),
            'classes': ('collapse',)
        }),
    )
    
    autocomplete_fields = ['user']
    
    def total_duration_display(self, obj):
        """총 운동시간 표시"""
        hours = obj.total_duration_minutes / 60
        return f"{obj.total_duration_minutes}분 ({hours:.1f}시간)"
    total_duration_display.short_description = '총 운동시간'
    
    def average_rating_display(self, obj):
        """평균 평점 표시"""
        if obj.average_rating == 0:
            return "평가 없음"
        
        stars = '★' * int(obj.average_rating) + '☆' * (5 - int(obj.average_rating))
        color = 'green' if obj.average_rating >= 4 else 'orange' if obj.average_rating >= 3 else 'red'
        
        return format_html(
            '<span style="color: {};">{} ({})</span>',
            color, stars, obj.average_rating
        )
    average_rating_display.short_description = '평균 만족도'
    
    def favorite_mood_display(self, obj):
        """주요 컨디션 표시"""
        if not obj.favorite_mood:
            return "데이터 없음"
        
        mood_colors = {
            'excellent': 'green',
            'good': 'lightgreen',
            'normal': 'orange', 
            'tired': 'red',
            'bad': 'darkred'
        }
        mood_labels = {
            'excellent': '최고',
            'good': '좋음',
            'normal': '보통',
            'tired': '피곤',
            'bad': '나쁨'
        }
        
        color = mood_colors.get(obj.favorite_mood, 'black')
        label = mood_labels.get(obj.favorite_mood, obj.favorite_mood)
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, label
        )
    favorite_mood_display.short_description = '주요 컨디션'
    
    actions = ['update_stats']
    
    def update_stats(self, request, queryset):
        """통계 업데이트 액션"""
        updated_count = 0
        for stats in queryset:
            stats.update_stats()
            updated_count += 1
        
        self.message_user(
            request,
            f"{updated_count}개의 통계가 업데이트되었습니다."
        )
    update_stats.short_description = "선택된 통계 업데이트"


# ==================== Custom Admin Actions ====================
def reset_routine_stats(modeladmin, request, queryset):
    """루틴 통계 초기화"""
    for routine in queryset:
        routine.usage_count = 0
        routine.rating_sum = 0
        routine.rating_count = 0
        routine.save(update_fields=['usage_count', 'rating_sum', 'rating_count'])
    
    modeladmin.message_user(
        request,
        f"{queryset.count()}개 루틴의 통계가 초기화되었습니다."
    )

reset_routine_stats.short_description = "선택된 루틴 통계 초기화"


# Admin actions 등록
WorkoutRoutineAdmin.actions = [reset_routine_stats]


# ==================== Admin Site Configuration ====================
admin.site.site_header = "Fithub 운동 관리"
admin.site.site_title = "Fithub Admin"
admin.site.index_title = "운동 관리 시스템"
