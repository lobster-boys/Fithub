from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


# ==================== Exercise Models ====================
class Exercise(models.Model):
    """운동 종목 모델"""
    
    DIFFICULTY_CHOICES = [
        ('beginner', '초급'),
        ('intermediate', '중급'), 
        ('advanced', '고급')
    ]
    
    name = models.CharField(max_length=200, verbose_name="운동명", unique=True)
    description = models.TextField(blank=True, verbose_name="설명")
    muscle_groups = models.CharField(max_length=500, verbose_name="주요 근육군")
    equipment_needed = models.CharField(max_length=200, blank=True, verbose_name="필요 장비")
    difficulty_level = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES,
        default='beginner',
        verbose_name="난이도",
        db_index=True
    )
    instructions = models.TextField(blank=True, verbose_name="운동 방법")
    video_url = models.URLField(blank=True, verbose_name="시연 영상 URL")
    calories_per_minute = models.PositiveIntegerField(
        default=5, 
        verbose_name="분당 칼로리 소모량"
    )
    is_active = models.BooleanField(default=True, verbose_name="활성 상태")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")
    
    class Meta:
        verbose_name = "운동"
        verbose_name_plural = "운동"
        ordering = ['name']
        indexes = [
            models.Index(fields=['difficulty_level']),
            models.Index(fields=['is_active']),
        ]
        
    def __str__(self):
        return f"{self.name} ({self.get_difficulty_level_display()})"
    
    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('exercise-detail', kwargs={'pk': self.pk})


# ==================== Routine Models ====================
class WorkoutRoutine(models.Model):
    """운동 루틴 모델"""
    
    DIFFICULTY_CHOICES = [
        ('beginner', '초급'),
        ('intermediate', '중급'),
        ('advanced', '고급')
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        verbose_name="사용자",
        related_name='workout_routines'
    )
    name = models.CharField(max_length=200, verbose_name="루틴명")
    description = models.TextField(blank=True, verbose_name="설명")
    difficulty_level = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES,
        default='beginner',
        verbose_name="난이도",
        db_index=True
    )
    estimated_duration = models.PositiveIntegerField(
        help_text="분 단위", 
        verbose_name="예상 소요시간"
    )
    target_muscle_groups = models.CharField(
        max_length=500, 
        blank=True, 
        verbose_name="목표 근육군"
    )
    is_public = models.BooleanField(
        default=False, 
        verbose_name="공개 여부",
        db_index=True
    )
    is_featured = models.BooleanField(
        default=False, 
        verbose_name="추천 루틴",
        db_index=True
    )
    is_template = models.BooleanField(
        default=False, 
        verbose_name="템플릿 루틴",
        db_index=True
    )
    usage_count = models.PositiveIntegerField(
        default=0, 
        verbose_name="사용 횟수"
    )
    rating_sum = models.PositiveIntegerField(default=0, verbose_name="평점 합계")
    rating_count = models.PositiveIntegerField(default=0, verbose_name="평점 개수")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")
    
    class Meta:
        verbose_name = "운동 루틴"
        verbose_name_plural = "운동 루틴"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['is_public', 'is_featured']),
            models.Index(fields=['difficulty_level']),
        ]
        
    def __str__(self):
        return f"{self.user.username} - {self.name}"
    
    @property
    def exercise_count(self):
        """루틴에 포함된 운동 개수"""
        return self.routine_exercises.count()
    
    @property
    def average_rating(self):
        """평균 평점"""
        if self.rating_count == 0:
            return 0
        return round(self.rating_sum / self.rating_count, 1)
    
    @property
    def estimated_calories(self):
        """예상 칼로리 소모량"""
        total_calories = 0
        for routine_exercise in self.routine_exercises.select_related('exercise'):
            exercise_duration = routine_exercise.sets * routine_exercise.reps * 0.5  # 대략적인 시간 계산
            total_calories += exercise_duration * routine_exercise.exercise.calories_per_minute
        return int(total_calories)
    
    def increment_usage(self):
        """사용 횟수 증가"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])
    
    def add_rating(self, rating):
        """평점 추가"""
        self.rating_sum += rating
        self.rating_count += 1
        self.save(update_fields=['rating_sum', 'rating_count'])


class RoutineExercise(models.Model):
    """루틴-운동 연결 모델"""
    routine = models.ForeignKey(
        WorkoutRoutine, 
        on_delete=models.CASCADE, 
        related_name='routine_exercises',
        verbose_name="루틴"
    )
    exercise = models.ForeignKey(
        Exercise, 
        on_delete=models.CASCADE, 
        verbose_name="운동",
        related_name='routine_exercises'
    )
    sets = models.PositiveIntegerField(verbose_name="세트 수")
    reps = models.PositiveIntegerField(verbose_name="반복 횟수")
    weight = models.FloatField(
        null=True, 
        blank=True, 
        verbose_name="무게(kg)",
        help_text="해당하는 경우만"
    )
    rest_time = models.PositiveIntegerField(
        default=60, 
        verbose_name="세트간 휴식시간(초)"
    )
    order = models.PositiveIntegerField(verbose_name="순서")
    notes = models.TextField(blank=True, verbose_name="특이사항")
    
    class Meta:
        verbose_name = "루틴 운동"
        verbose_name_plural = "루틴 운동"
        ordering = ['order']
        unique_together = ['routine', 'order']
        indexes = [
            models.Index(fields=['routine', 'order']),
        ]
        
    def __str__(self):
        return f"{self.routine.name} - {self.exercise.name} ({self.order}순서)"
    
    @property
    def estimated_duration_minutes(self):
        """예상 소요시간(분)"""
        exercise_time = self.sets * self.reps * 0.5  # 대략적인 운동 시간
        rest_time = (self.sets - 1) * (self.rest_time / 60)  # 휴식 시간
        return round(exercise_time + rest_time, 1)


# ==================== Log Models ====================
class WorkoutLog(models.Model):
    """운동 기록 모델"""
    
    MOOD_CHOICES = [
        ('excellent', '최고'),
        ('good', '좋음'),
        ('normal', '보통'),
        ('tired', '피곤'),
        ('bad', '나쁨')
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        verbose_name="사용자",
        related_name='workout_logs'
    )
    routine = models.ForeignKey(
        WorkoutRoutine, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="사용된 루틴",
        related_name='workout_logs'
    )
    start_time = models.DateTimeField(verbose_name="시작 시간", db_index=True)
    end_time = models.DateTimeField(verbose_name="종료 시간")
    duration_minutes = models.PositiveIntegerField(verbose_name="운동 시간(분)")
    calories_burned = models.PositiveIntegerField(verbose_name="소모 칼로리")
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="1-5점 평가",
        verbose_name="만족도",
        db_index=True
    )
    mood = models.CharField(
        max_length=50,
        choices=MOOD_CHOICES,
        verbose_name="컨디션",
        db_index=True
    )
    notes = models.TextField(blank=True, verbose_name="운동 메모")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")
    
    class Meta:
        verbose_name = "운동 기록"
        verbose_name_plural = "운동 기록"
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['user', '-start_time']),
            models.Index(fields=['start_time']),
            models.Index(fields=['rating']),
            models.Index(fields=['mood']),
        ]
        
    def __str__(self):
        return f"{self.user.username} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"
    
    def save(self, *args, **kwargs):
        # 루틴 사용 횟수 증가 및 평점 추가
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new and self.routine:
            self.routine.increment_usage()
            self.routine.add_rating(self.rating)
    
    @property
    def duration_hours(self):
        """운동 시간을 시간 단위로 반환"""
        return round(self.duration_minutes / 60, 2)
    
    @property
    def workout_date(self):
        """운동 날짜"""
        return self.start_time.date()
    
    @property
    def calories_per_minute(self):
        """분당 칼로리 소모량"""
        if self.duration_minutes == 0:
            return 0
        return round(self.calories_burned / self.duration_minutes, 1)


# ==================== Statistics & Analytics ====================
class WorkoutStats(models.Model):
    """운동 통계 모델 (캐시용)"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        verbose_name="사용자",
        related_name='workout_stats'
    )
    total_workouts = models.PositiveIntegerField(default=0, verbose_name="총 운동 횟수")
    total_duration_minutes = models.PositiveIntegerField(default=0, verbose_name="총 운동 시간(분)")
    total_calories_burned = models.PositiveIntegerField(default=0, verbose_name="총 소모 칼로리")
    average_rating = models.FloatField(default=0.0, verbose_name="평균 만족도")
    favorite_mood = models.CharField(max_length=50, blank=True, verbose_name="주요 컨디션")
    longest_workout_minutes = models.PositiveIntegerField(default=0, verbose_name="최장 운동시간(분)")
    current_streak_days = models.PositiveIntegerField(default=0, verbose_name="현재 연속 운동일")
    max_streak_days = models.PositiveIntegerField(default=0, verbose_name="최대 연속 운동일")
    last_workout_date = models.DateField(null=True, blank=True, verbose_name="마지막 운동일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="갱신일")
    
    class Meta:
        verbose_name = "운동 통계"
        verbose_name_plural = "운동 통계"
        
    def __str__(self):
        return f"{self.user.username} 통계"
    
    def update_stats(self):
        """통계 업데이트"""
        from django.db.models import Count, Sum, Avg
        
        logs = WorkoutLog.objects.filter(user=self.user)
        
        self.total_workouts = logs.count()
        self.total_duration_minutes = logs.aggregate(Sum('duration_minutes'))['duration_minutes__sum'] or 0
        self.total_calories_burned = logs.aggregate(Sum('calories_burned'))['calories_burned__sum'] or 0
        self.average_rating = logs.aggregate(Avg('rating'))['rating__avg'] or 0.0
        
        # 가장 자주 나타나는 컨디션
        mood_stats = logs.values('mood').annotate(count=Count('mood')).order_by('-count')
        if mood_stats:
            self.favorite_mood = mood_stats[0]['mood']
        
        # 최장 운동시간
        longest = logs.aggregate(models.Max('duration_minutes'))['duration_minutes__max']
        self.longest_workout_minutes = longest or 0
        
        # 연속 운동일 계산
        self._calculate_streaks()
        
        self.save()
    
    def _calculate_streaks(self):
        """연속 운동일 계산"""
        from datetime import date, timedelta
        
        workout_dates = set(
            WorkoutLog.objects.filter(user=self.user)
            .values_list('start_time__date', flat=True)
            .distinct()
        )
        
        if not workout_dates:
            self.current_streak_days = 0
            self.max_streak_days = 0
            self.last_workout_date = None
            return
        
        sorted_dates = sorted(workout_dates, reverse=True)
        self.last_workout_date = sorted_dates[0]
        
        # 현재 연속일 계산
        today = date.today()
        current_streak = 0
        check_date = today
        
        for workout_date in sorted_dates:
            if workout_date == check_date or workout_date == check_date - timedelta(days=1):
                current_streak += 1
                check_date = workout_date - timedelta(days=1)
            else:
                break
        
        self.current_streak_days = current_streak
        
        # 최대 연속일 계산
        max_streak = 0
        current_temp_streak = 1
        prev_date = None
        
        for workout_date in sorted(workout_dates):
            if prev_date and workout_date == prev_date + timedelta(days=1):
                current_temp_streak += 1
            else:
                max_streak = max(max_streak, current_temp_streak)
                current_temp_streak = 1
            prev_date = workout_date
            
        self.max_streak_days = max(max_streak, current_temp_streak)
