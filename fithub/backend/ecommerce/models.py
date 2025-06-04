from django.db import models
from django.utils.text import slugify
from django.urls import reverse
from users.models import User

# 카테고리 모델
class Category(models.Model):
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True
    )
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


# 배송 주소 모델
class ShippingAddress(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='shipping_addresses'
    )
    recipient_name = models.CharField(max_length=100, help_text="받는 사람 이름")
    address_line1 = models.CharField(max_length=255, help_text="주소")
    address_line2 = models.CharField(max_length=255, blank=True, help_text="상세 주소")
    city = models.CharField(max_length=100, help_text="도시")
    country = models.CharField(max_length=100, default="Korea", help_text="국가")
    phone_number = models.CharField(max_length=20, help_text="전화번호")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.recipient_name} - {self.address_line1}"

    class Meta:
        db_table = 'shippingaddress'
        verbose_name_plural = '배송 주소'

# 주문 상품 모델
class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE, 
        related_name='order_items'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE
    )
    product_name = models.CharField(max_length=200, help_text="주문 당시 상품명")
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="주문 당시 가격")
    quantity = models.IntegerField(help_text="수량")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.order.order_number} - {self.product_name}"

    @property
    def total_price(self):
        return self.price * self.quantity

    class Meta:
        db_table = 'orderitem'
        verbose_name_plural = '주문 상품'

# 장바구니 아이템 모델
class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE
    )
    product_name = models.CharField(max_length=200, help_text="상품명")
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="가격")
    quantity = models.IntegerField(help_text="수량")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.cart.user.username}의 장바구니 - {self.product_name}"

    @property
    def total_price(self):
        return self.price * self.quantity

    class Meta:
        db_table = 'cartitem'
        verbose_name_plural = '장바구니 상품'
        unique_together = ('cart', 'product')  # 같은 카트에 같은 상품은 하나만 표시(개수 표시는 따로로)