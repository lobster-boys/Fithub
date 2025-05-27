from django.db import models
from django.utils.text import slugify
from django.urls import reverse

# Create your models here.
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