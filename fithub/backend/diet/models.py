from django.db import models
from django.conf import settings

class Food(models.Model):

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,  on_delete=models.CASCADE, related_name='custom_foods')
    category = models.ForeignKey('ecommerce.Category', on_delete=models.PROTECT, related_name='foods')
    product = models.OneToOneField('ecommerce.Product', on_delete=models.CASCADE, related_name='food_info')

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    calories = models.DecimalField(max_digits=7, decimal_places=2, help_text='칼로리(Kcal)')
    protein = models.DecimalField(max_digits=7, decimal_places=2, help_text='단백질(g)')
    carbs = models.DecimalField(max_digits=7, decimal_places=2, help_text='탄수화물(g)')
    fat = models.DecimalField(max_digits=7, decimal_places=2, help_text='지방(g)')
    serving_size = models.CharField(max_length=50, help_text='1인분 기준량(예: "100g": "1컵"')
    
    class Meta:
        db_table = 'diet_food'
        verbose_name = '식품'
        indexe = [
            models.Index(fields=['name'], name='idx_food_name')
        ]
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(user__isnull=False) 
                    | models.Q(product__isnull=False)
                ),
                name = 'ck_food_user_or_product_not_null'
            ),
        ]

    def __str__(self):
        return self.name