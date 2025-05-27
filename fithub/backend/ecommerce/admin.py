from django.contrib import admin
from .models import Category


# Register your models here.
class MyModelAdmin(admin.ModelAdmin):
    exclude = [
        "slug",
    ]

    list_display = [
        "name",
        "slug",
        "description",
        "is_active",
    ]


admin.site.register(Category)
