from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import UserPoint, PointTransaction, PointPolicy, PointExpiry


@admin.register(UserPoint)
class UserPointAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'balance', 'created_at', 'updated_at'
    ]
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-balance']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(PointTransaction)
class PointTransactionAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'amount_display', 'transaction_type', 'reference_type', 
        'description_short', 'balance_after', 'created_at'
    ]
    list_filter = [
        'transaction_type', 'reference_type', 'created_at'
    ]
    search_fields = [
        'user__username', 'user__email', 'description', 'reference_id'
    ]
    readonly_fields = [
        'created_at', 'balance_after', 'content_type', 'object_id'
    ]
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'content_type')
    
    def amount_display(self, obj):
        if obj.amount >= 0:
            return format_html(
                '<span style="color: green;">+{}</span>', 
                obj.amount
            )
        else:
            return format_html(
                '<span style="color: red;">{}</span>', 
                obj.amount
            )
    amount_display.short_description = '포인트'
    amount_display.admin_order_field = 'amount'
    
    def description_short(self, obj):
        if len(obj.description) > 50:
            return obj.description[:50] + '...'
        return obj.description
    description_short.short_description = '설명'
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('user', 'amount', 'transaction_type', 'balance_after')
        }),
        ('참조 정보', {
            'fields': ('reference_type', 'reference_id', 'description')
        }),
        ('연관 객체', {
            'fields': ('content_type', 'object_id'),
            'classes': ('collapse',)
        }),
        ('시스템 정보', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(PointPolicy)
class PointPolicyAdmin(admin.ModelAdmin):
    list_display = [
        'policy_type', 'points_amount', 'percentage_rate', 
        'min_amount', 'max_amount', 'is_active', 'updated_at'
    ]
    list_filter = ['is_active', 'policy_type', 'created_at']
    list_editable = ['is_active']
    search_fields = ['description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('정책 기본 정보', {
            'fields': ('policy_type', 'description', 'is_active')
        }),
        ('포인트 설정', {
            'fields': ('points_amount', 'percentage_rate', 'min_amount', 'max_amount')
        }),
        ('시스템 정보', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PointExpiry)
class PointExpiryAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'points_amount', 'earned_date', 'expiry_date', 
        'is_expired', 'days_until_expiry'
    ]
    list_filter = [
        'is_expired', 'expiry_date', 'earned_date'
    ]
    search_fields = ['user__username', 'user__email']
    readonly_fields = [
        'earned_date', 'expired_at', 'source_transaction', 'days_until_expiry'
    ]
    ordering = ['expiry_date']
    date_hierarchy = 'expiry_date'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'user', 'source_transaction'
        )
    
    def days_until_expiry(self, obj):
        if obj.is_expired:
            return format_html('<span style="color: red;">만료됨</span>')
        
        from django.utils import timezone
        days = (obj.expiry_date - timezone.now()).days
        
        if days < 0:
            return format_html('<span style="color: red;">만료됨</span>')
        elif days <= 7:
            return format_html('<span style="color: orange;">{}일</span>', days)
        elif days <= 30:
            return format_html('<span style="color: yellow;">{}일</span>', days)
        else:
            return format_html('<span style="color: green;">{}일</span>', days)
    
    days_until_expiry.short_description = '만료까지'
    
    actions = ['expire_selected_points']
    
    def expire_selected_points(self, request, queryset):
        """선택한 포인트들을 강제로 만료시키는 액션"""
        from .services import PointService
        
        expired_count = 0
        for expiry_record in queryset.filter(is_expired=False):
            PointService.expire_points(user=expiry_record.user)
            expired_count += 1
        
        self.message_user(
            request, 
            f'{expired_count}개의 포인트가 만료 처리되었습니다.'
        )
    
    expire_selected_points.short_description = '선택한 포인트 만료 처리'
    
    fieldsets = (
        ('포인트 정보', {
            'fields': ('user', 'points_amount', 'source_transaction')
        }),
        ('만료 정보', {
            'fields': ('earned_date', 'expiry_date', 'is_expired', 'expired_at')
        }),
        ('상태', {
            'fields': ('days_until_expiry',),
            'classes': ('collapse',)
        }),
    )


# 사용자 정의 관리자 액션
@admin.action(description='선택한 사용자들의 포인트 만료 처리')
def expire_user_points(modeladmin, request, queryset):
    """선택한 사용자들의 만료된 포인트를 처리하는 액션"""
    from .services import PointService
    
    total_expired = 0
    for user_point in queryset:
        result = PointService.expire_points(user=user_point.user)
        total_expired += result['total_expired_amount']
    
    modeladmin.message_user(
        request,
        f'총 {total_expired}포인트가 만료 처리되었습니다.'
    )

# UserPointAdmin에 액션 추가
UserPointAdmin.actions = [expire_user_points]
