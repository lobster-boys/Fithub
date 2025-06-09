from django.contrib import admin
from .models import PointTransaction


@admin.register(PointTransaction)
class PointTransactionAdmin(admin.ModelAdmin):
    list_display = ("user", "challenge", "points", "timestamp")
    list_filter = ("user", "challenge")
    date_hierarchy = "timestamp"
