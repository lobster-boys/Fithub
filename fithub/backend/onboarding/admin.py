from django.contrib import admin
from .models import OnboardingData, OnboardingHistory


@admin.register(OnboardingData)
class OnboardingDataAdmin(admin.ModelAdmin):
    """온보딩 데이터 관리"""
    
    list_display = [
        'user', 'fitness_level', 'height', 'weight', 'age', 
        'bmi', 'completed', 'created_at', 'updated_at'
    ]
    list_filter = [
        'fitness_level', 'completed', 'created_at', 'updated_at'
    ]
    search_fields = [
        'user__username',
        'user__email',
        'user__first_name',
        'user__last_name'
    ]
    readonly_fields = [
        'bmi',
        'created_at',
        'updated_at',
        'completed_at'
    ]
    
    fieldsets = (
        ('사용자 정보', {
            'fields': ('user',)
        }),
        ('기본 정보', {
            'fields': ('fitness_level',)
        }),
        ('신체 정보', {
            'fields': ('height', 'weight', 'age', 'bmi')
        }),
        ('선호도', {
            'fields': ('goals', 'methods', 'equipment'),
            'classes': ('collapse',)
        }),
        ('메타 정보', {
            'fields': ('completed', 'created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def get_goals_display(self, obj):
        """목표 목록을 한국어로 표시"""
        return ', '.join(obj.get_goals_display())
    get_goals_display.short_description = '운동 목표'
    
    def get_methods_display(self, obj):
        """운동 방법 목록을 한국어로 표시"""
        return ', '.join(obj.get_methods_display())
    get_methods_display.short_description = '운동 방법'
    
    def get_equipment_display(self, obj):
        """장비 목록을 한국어로 표시"""
        return ', '.join(obj.get_equipment_display())
    get_equipment_display.short_description = '사용 장비'


@admin.register(OnboardingHistory)
class OnboardingHistoryAdmin(admin.ModelAdmin):
    """온보딩 변경 이력 관리"""
    
    list_display = ['user', 'change_reason', 'created_at']
    list_filter = ['created_at', 'change_reason']
    search_fields = ['user__username', 'user__email', 'change_reason']
    readonly_fields = ['user', 'previous_data', 'new_data', 'change_reason', 'created_at']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('user', 'change_reason', 'created_at')
        }),
        ('변경 데이터', {
            'fields': ('previous_data', 'new_data'),
            'classes': ('collapse',)
        })
    )
    
    def has_add_permission(self, request):
        """추가 권한 없음 (시스템에서 자동 생성)"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """수정 권한 없음 (읽기 전용)"""
        return False
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
