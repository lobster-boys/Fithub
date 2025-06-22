from django.contrib import admin
from .models import (
    Challenge,
    ChallengeParticipant,
    ChallengePoint,
    SocialShare,
    # PointTransaction,  # Points 앱으로 이전됨
    UserLog,
)


@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "period",
        "goal_type",
        "goal_value",
        "start_date",
        "end_date",
        "is_active",
        "is_personal",
        "creator",
        "status",
    )
    list_filter = ("period", "goal_type", "is_active", "is_personal", "status")
    search_fields = ("name", "description")
    date_hierarchy = "start_date"
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("기본 정보", {
            "fields": ("name", "description", "creator", "is_personal")
        }),
        ("챌린지 설정", {
            "fields": ("period", "goal_type", "goal_value", "target_value", "status")
        }),
        ("날짜 설정", {
            "fields": ("start_date", "end_date")
        }),
        ("보상 설정", {
            "fields": ("reward_points", "is_active")
        }),
        ("시스템 정보", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )


@admin.register(ChallengeParticipant)
class ChallengeParticipantAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "challenge",
        "join_datetime",
        "current_progress",
        "is_completed",
        "reward_claimed",
    )
    list_filter = ("is_completed", "reward_claimed", "join_datetime")
    search_fields = ("user__username", "challenge__name")
    date_hierarchy = "join_datetime"
    readonly_fields = ("join_datetime", "completion_datetime")


@admin.register(ChallengePoint)
class ChallengePointAdmin(admin.ModelAdmin):
    list_display = ("get_user", "get_challenge", "points", "reason", "awarded_datetime")
    list_filter = ("awarded_datetime",)
    search_fields = ("user_challenge__user__username", "user_challenge__challenge__name", "reason")
    date_hierarchy = "awarded_datetime"
    readonly_fields = ("awarded_datetime",)

    def get_user(self, obj):
        return obj.user_challenge.user.username
    get_user.short_description = "사용자"

    def get_challenge(self, obj):
        return obj.user_challenge.challenge.name
    get_challenge.short_description = "챌린지"


# PointTransactionAdmin은 Points 앱으로 이전됨
# from points.admin import PointTransactionAdmin 사용


@admin.register(UserLog)
class UserLogAdmin(admin.ModelAdmin):
    """
    사용자 활동 로그 Admin
    challenge_checker에서 이전됨
    """
    list_display = ("user", "date", "log_type", "value", "notes", "created_at")
    list_filter = ("log_type", "date", "created_at")
    search_fields = ("user__username", "notes")
    date_hierarchy = "date"
    readonly_fields = ("created_at",)


@admin.register(SocialShare)
class SocialShareAdmin(admin.ModelAdmin):
    list_display = ("user", "platform", "share_status", "content_object", "created_at")
    list_filter = ("platform", "share_status", "created_at")
    search_fields = ("user__username", "share_url")
    date_hierarchy = "created_at"
    readonly_fields = ("created_at",)
