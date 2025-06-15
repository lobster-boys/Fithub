from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import MealPlanFood

@receiver([post_save, post_delete], sender=MealPlanFood)
def update_mealplan_total_calories(sender, instance, **kwargs):
    """
    MealPlanFood가 저장(post_save) 또는 삭제(post_delete)될 때마다,
    해당 MealPlan의 총 칼로리를 다시 계산
    """
    meal_plan = instance.meal_plan
    if meal_plan:
        meal_plan.calculate_total_calories()