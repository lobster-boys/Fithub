from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile


# @admin.register(User)
# class UserAdmin(BaseUserAdmin):
#     list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined']
#     list_filter = ['is_staff', 'is_active', 'date_joined']
#     search_fields = ['username', 'email', 'first_name', 'last_name']
    
#     fieldsets = BaseUserAdmin.fieldsets + (
#         ('추가 정보', {'fields': ('profile_image',)}),
#     )


# @admin.register(UserProfile)
# class UserProfileAdmin(admin.ModelAdmin):
#     list_display = ['user', 'gender', 'age', 'height', 'weight', 'fitness_goal', 'activity_level']
#     list_filter = ['gender', 'fitness_goal', 'activity_level']
#     search_fields = ['user__username', 'user__email']
#     readonly_fields = ['created_at', 'updated_at']
    
#     def age(self, obj):
#         return obj.age
#     age.short_description = '나이'

admin.site.register(User)
admin.site.register(UserProfile)