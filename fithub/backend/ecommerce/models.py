from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.urls import reverse
from decimal import Decimal
from django.conf import settings

User = get_user_model()

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
    price = models.PositiveIntegerField(default=0, help_text="상품 가격 (원 단위)")
    sale_price = models.PositiveIntegerField(blank=True, null=True, help_text="할인가 (원 단위)")
    stock_quantity = models.IntegerField(default=0)
    is_food = models.BooleanField(default=False)
    unit_weight_g = models.PositiveIntegerField(
        default=0,
        help_text="1팩(1단위) 무게(gram). 0이면 단위 무게 정보 없음"
    )
    is_active = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    recommendations_score = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), help_text="추천 점수")
    image_url = models.URLField(blank=True, null=True, help_text="상품 이미지 URL")

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name, allow_unicode=True)
        super(Product, self).save(*args, **kwargs)

# 카트 모델
class Cart(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}의 장바구니"
    
# 주문 모델
class Order(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    shipping_address = models.CharField(max_length=1000)
    order_number = models.CharField(max_length=50)
    status = models.CharField(max_length=20)
    total_amount = models.PositiveIntegerField(default=0, help_text="총 주문 금액 (원 단위)")
    payment_method = models.CharField(max_length=50)
    points_applied = models.IntegerField(default=0, help_text="적용된 포인트")
    coupon_applied = models.CharField(max_length=50, blank=True, null=True, help_text="적용된 쿠폰 코드")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# 배송 주소 모델
class ShippingAddress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
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
    price = models.PositiveIntegerField(help_text="주문 시점의 상품 가격 (원 단위)")
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
    price = models.PositiveIntegerField(help_text="장바구니 담은 시점의 상품 가격 (원 단위)")
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
    
    # 포인트 구매 기능 추가
    point_cost = models.PositiveIntegerField(
        default=0,
        help_text="포인트로 구매 가능한 쿠폰인 경우의 포인트 비용"
    )
    is_point_purchasable = models.BooleanField(
        default=False,
        help_text="포인트로 구매 가능한 쿠폰 여부"
    )

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
        settings.AUTH_USER_MODEL, 
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


# UserPoint와 PointTransaction 모델은 Points 앱으로 이전됨
# points.models.UserPoint와 points.models.PointTransaction을 사용하세요

# 리뷰 모델
class Review(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
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
        null=True,
        blank=True,
        help_text="리뷰가 작성된 주문 항목 (선택사항)"
    )
    title = models.CharField(max_length=200, help_text="리뷰 제목")
    content = models.TextField(help_text="리뷰 내용")
    rating = models.IntegerField(default=5, help_text="평점 (1-5)")
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

# 베스트 상품 목록
class BestItems(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    def __str__(self):
        return "베스트 상품 목록"
    
    class Meta:
        db_table = 'best_items'
        verbose_name_plural = '베스트 상품'

# 클릭한 상품 목록
class ClickedItems(models.Model):
    """
    클릭한 상품 목록 데이터베이스.
    id = Int, PK
    user = foreignKey
    clicked_list = TextField(default="[]")
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='clicked_items'
    )
    clicked_list = models.TextField(default="[]", help_text="클릭 리스트") 

    def __str__(self):
        return "클릭 상품 목록"
    
    class Meta:
        db_table = 'clicked_items'
        verbose_name_plural = '클릭한 상품'