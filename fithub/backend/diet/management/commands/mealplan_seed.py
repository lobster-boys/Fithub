import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from diet.models import MealPlan, MealPlanFood, Food


class Command(BaseCommand):
    help = "임의의 MealPlan 데이터를 생성합니다."

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='기존 MealPlan 데이터를 삭제하고 새로 생성합니다.'
        )

    @transaction.atomic
    def handle(self, *args, **options):
        # 기존 데이터 삭제 (옵션)
        if options.get('clear'):
            count = MealPlan.objects.count()
            MealPlan.objects.all().delete()
            self.stdout.write(self.style.SUCCESS(f"기존 MealPlan 데이터를 {count}개 삭제하였습니다."))

        # admin 계정만 볼 수 있음
        # 모든 계정에서 볼려면 meal_plans = MealPlan.objects.all()로 변경(mealplan_views.py에서 변경)
        User = get_user_model()
        user = User.objects.first()
        if not user:
            self.stdout.write(self.style.ERROR("사용자 데이터가 없습니다. Seed를 진행할 수 없습니다."))
            return

        foods = list(Food.objects.all())
        if not foods:
            self.stdout.write(self.style.ERROR("Food 레코드가 없습니다. 먼저 Food seed를 진행하세요."))
            return

        # 샘플 MealPlan 데이터
        sample_mealplans = [
            {
                "name": "Healthy Weight Loss Plan",
                "description": "A balanced meal plan for weight loss",
                "start_date": date.today(),
                "end_date": date.today() + timedelta(days=30),
                "is_active": True,
                "total_calories": 1800,
                "items": [
                    {
                        "food_id": random.choice(foods).id,
                        "quantity": 150,
                        "meal_time": "breakfast",
                    },
                    {
                        "food_id": random.choice(foods).id,
                        "quantity": 200,
                        "meal_time": "lunch",
                    },
                    {
                        "food_id": random.choice(foods).id,
                        "quantity": 250,
                        "meal_time": "dinner",
                    },
                ],
            },
            {
                "name": "Muscle Gain Plan",
                "description": "High protein meal plan to support muscle growth",
                "start_date": date.today() + timedelta(days=60),
                "end_date": date.today() + timedelta(days=90),
                "is_active": False,
                "total_calories": 2500,
                "items": [
                    {
                        "food_id": random.choice(foods).id,
                        "quantity": 200,
                        "meal_time": "breakfast",
                    },
                    {
                        "food_id": random.choice(foods).id,
                        "quantity": 250,
                        "meal_time": "lunch",
                    },
                    {
                        "food_id": random.choice(foods).id,
                        "quantity": 300,
                        "meal_time": "dinner",
                    },
                    {
                        "food_id": random.choice(foods).id,
                        "quantity": 100,
                        "meal_time": "snack",
                    },
                ],
            },
        ]

        created_count = 0
        for plan_data in sample_mealplans:
            # MealPlan 생성
            meal_plan = MealPlan.objects.create(
                user=user,
                name=plan_data["name"],
                description=plan_data["description"],
                start_date=plan_data["start_date"],
                end_date=plan_data["end_date"],
                is_active=plan_data["is_active"],
                total_calories=plan_data["total_calories"],
            )

            # 연결된 MealPlanFood 생성
            for item_data in plan_data.get("items", []):
                # food 정보를 추출 (food_id가 존재함)
                food_obj = Food.objects.get(id=item_data["food_id"])
                MealPlanFood.objects.create(
                    meal_plan=meal_plan,
                    food=food_obj,
                    quantity=item_data["quantity"],
                    meal_time=item_data["meal_time"],
                )
            created_count += 1
            self.stdout.write(self.style.SUCCESS(f"Created MealPlan: {meal_plan}"))

        self.stdout.write(self.style.SUCCESS(f"Seed 완료: 총 {created_count}개의 MealPlan이 생성되었습니다."))