from django.contrib import admin
from .models import Category, Product, Cart, Order, ClickedItems


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
admin.site.register(Product)
admin.site.register(Cart)
admin.site.register(Order)
admin.site.register(ClickedItems)