from django.db import models
from django.utils.text import slugify
from django.urls import reverse
from users.models import User

# 카테고리 모델
class Category(models.Model):
    # parent = models.ForeignKey(
    #     'self', on_delete=models.CASCADE, null=True
    # )
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, allow_unicode=True) # 유니코드 허용으로 한글 사용 가능
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=False)
    

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name, allow_unicode=True)
        super(Category, self).save(*args, **kwargs)

# 상품 모델
class Product(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, allow_unicode=True)
    description = models.TextField(null=True)
    price = models.DecimalField(default=0, max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(default=0, max_digits=10, decimal_places=2, blank=True, null=True)
    stock_quantity = models.IntegerField(default=0)
    is_food = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name, allow_unicode=True)
        super(Product, self).save(*args, **kwargs)

# 카트 모델
class Cart(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE
    )
    cart_items = models.CharField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return self.cart_items
    
# 주문 모델
class Order(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE
    )
    shipping_address = models.CharField(max_length=1000)
    order_number = models.CharField(max_length=50)
    status = models.CharField(max_length=20)
    total_amount = models.DecimalField(default=0, max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)