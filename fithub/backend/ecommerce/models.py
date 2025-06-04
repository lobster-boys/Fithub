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
    phone_number = models.CharField(max_length=20, help_text="연락처")
    address_line1 = models.CharField(max_length=200, help_text="기본 주소")
    address_line2 = models.CharField(max_length=200, blank=True, null=True, help_text="상세 주소")
    city = models.CharField(max_length=50, help_text="시/도")
    country = models.CharField(max_length=50, help_text="국가")
    is_default = models.BooleanField(default=False, help_text="기본 배송지 여부")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.recipient_name} - {self.address_line1}"

    class Meta:
        db_table = 'shipping_address'
        verbose_name_plural = '배송 주소'

# 주문 상품 모델
class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE
    )
    product_name = models.CharField(max_length=200, help_text="주문 시점의 상품명")
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="주문 시점의 상품 가격")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order.order_number} - {self.product_name}"

    @property
    def total_price(self):
        return self.price * self.quantity

    class Meta:
        db_table = 'order_item'
        verbose_name_plural = '주문 상품'

# 장바구니 상품 모델
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
    product_name = models.CharField(max_length=200, help_text="장바구니 담은 시점의 상품명")
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="장바구니 담은 시점의 상품 가격")
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.cart.user.username} - {self.product_name}"

    @property
    def total_price(self):
        return self.price * self.quantity

    class Meta:
        db_table = 'cart_item'
        verbose_name_plural = '장바구니 상품'
        unique_together = ('cart', 'product')  # 같은 장바구니에 같은 상품 중복 방지



# 쿠폰 모델
class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('PERCENTAGE', '퍼센트 할인'),
        ('FIXED_AMOUNT', '고정 금액 할인'),
    ]

    code = models.CharField(max_length=20, unique=True, help_text="쿠폰 코드")
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, help_text="할인 값")
    min_purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="최소 구매 금액")
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="최대 할인 금액")
    start_date = models.DateTimeField(help_text="사용 시작일")
    end_date = models.DateTimeField(help_text="사용 종료일")
    usage_limit = models.IntegerField(help_text="사용 제한 횟수")
    usage_count = models.IntegerField(default=0, help_text="사용된 횟수")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"쿠폰: {self.code}"

    @property
    def is_active(self):
        from django.utils import timezone
        now = timezone.now()
        return (self.start_date <= now <= self.end_date and 
                self.usage_count < self.usage_limit)

    class Meta:
        db_table = 'coupon'
        verbose_name_plural = '쿠폰'

# 사용자 쿠폰 모델
class UserCoupon(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='user_coupons'
    )
    coupon = models.ForeignKey(
        Coupon, 
        on_delete=models.CASCADE
    )
    is_used = models.BooleanField(default=False, help_text="사용 여부")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.coupon.code}"

    class Meta:
        db_table = 'usercoupon'
        verbose_name_plural = '사용자 쿠폰'
        unique_together = ('user', 'coupon')  # 같은 사용자가 같은 쿠폰을 중복으로 받을 수 없음


# 사용자 포인트 모델
class UserPoint(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='user_point'
    )
    balance = models.IntegerField(default=0, help_text="현재 포인트 잔액")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} 포인트: {self.balance}"

    class Meta:
        db_table = 'userpoint'
        verbose_name_plural = '사용자 포인트'

# 포인트 거래 내역 모델
class PointTransaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('EARN', '적립'),
        ('USE', '사용'),
        ('REFUND', '환불'),
        ('EXPIRE', '만료'),
        ('ADMIN', '관리자 조정'),
    ]

    REFERENCE_TYPE_CHOICES = [
        ('ORDER', '주문'),
        ('REVIEW', '리뷰'),
        ('SIGNUP', '회원가입'),
        ('EVENT', '이벤트'),
        ('ADMIN', '관리자'),
    ]

    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='point_transactions'
    )
    amount = models.IntegerField(help_text="포인트 금액 (음수면 차감)")
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    reference_type = models.CharField(max_length=10, choices=REFERENCE_TYPE_CHOICES)
    reference_id = models.CharField(max_length=50, null=True, blank=True, help_text="참조 ID (주문번호 등)")
    description = models.TextField(help_text="거래 설명")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type}: {self.amount}P"

    class Meta:
        db_table = 'pointtransaction'
        verbose_name_plural = '포인트 거래 내역'
        ordering = ['-created_at']

# 리뷰 모델
class Review(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='product_reviews'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE,
        related_name='product_reviews'
    )
    order_item = models.ForeignKey(
        OrderItem, 
        on_delete=models.CASCADE,
        related_name='item_reviews',
        help_text="리뷰가 작성된 주문 항목"
    )
    title = models.CharField(max_length=200, help_text="리뷰 제목")
    content = models.TextField(help_text="리뷰 내용")
    images = models.TextField(blank=True, null=True, help_text="리뷰 이미지 URLs")
    is_verified_purchase = models.BooleanField(default=False, help_text="구매 확인된 리뷰")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.name} 리뷰"

    class Meta:
        db_table = 'review'
        verbose_name_plural = '리뷰'
        ordering = ['-created_at']