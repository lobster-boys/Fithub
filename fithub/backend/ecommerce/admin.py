from django.contrib import admin
from .models import Category, Product, Cart, Order

class CategoryAdmin(admin.ModelAdmin):
    search_fields = ['name']  # autocomplete_fields 에서 검색에 사용됩니다.
    list_display = ['name', 'slug', 'description', 'is_active']
    
class ProductAdmin(admin.ModelAdmin):
    search_fields = ['name']  # autocomplete_fields 에서 검색에 사용됩니다.
    list_display = ['name', 'slug', 'description', 'price', 'is_active', 'is_featured']

class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'cart_items']

class OrderAdmin(admin.ModelAdmin):
    list_display = ['user', 'order_number', 'status', 'total_amount', 'payment_method']

admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Cart, CartAdmin)
admin.site.register(Order, OrderAdmin)