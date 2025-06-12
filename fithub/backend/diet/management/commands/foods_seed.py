from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decimal import Decimal
from diet.models import Food
from ecommerce.models import Product

class Command(BaseCommand):
    help = 'Food 기본 데이터를 생성합니다'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='기존 Food 데이터를 삭제하고 새로 생성',
        )

    def handle(self, *args, **options):
        # 기존 Food 데이터 삭제 옵션 처리
        if options['clear']:
            deleted_count = Food.objects.count()
            Food.objects.all().delete()
            self.stdout.write(f'기존 Food 데이터 {deleted_count}개를 삭제했습니다.')

        User = get_user_model()
        default_user = User.objects.first()  # 기본 사용자 지정 (없으면 None)

        
        foods_data = {
            '탄수화물': [
                {
                    'name': 'CJ 햇반 백미밥',
                    'description': '간편하게 먹을 수 있는 즉석밥',
                    'calories': 130.0,
                    'protein': 2.5,
                    'carbs': 28.0,
                    'fat': 0.3,
                    'serving_size': '200g',
                },
                {
                    'name': '오뚜기 진라면',
                    'description': '매콤한 맛의 인스턴트 라면',
                    'calories': 500.0,
                    'protein': 10.0,
                    'carbs': 60.0,
                    'fat': 15.0,
                    'serving_size': '1봉지',
                },
                {
                    'name': '식빵',
                    'description': '부드러운 식빵',
                    'calories': 150.0,
                    'protein': 5.0,
                    'carbs': 30.0,
                    'fat': 2.0,
                    'serving_size': '1조각',
                },
                {
                    'name': '현미밥',
                    'description': '건강한 현미밥',
                    'calories': 180.0,
                    'protein': 4.0,
                    'carbs': 35.0,
                    'fat': 1.5,
                    'serving_size': '200g',
                },
                {
                    'name': '고구마',
                    'description': '달콤한 고구마 1kg',
                    'calories': 300.0,
                    'protein': 3.0,
                    'carbs': 70.0,
                    'fat': 0.5,
                    'serving_size': '1kg',
                },
            ],
            '단백질': [
                {
                    'name': '닭가슴살',
                    'description': '신선한 닭가슴살 500g',
                    'calories': 800.0,
                    'protein': 50.0,
                    'carbs': 0.0,
                    'fat': 5.0,
                    'serving_size': '500g',
                },
                {
                    'name': '계란',
                    'description': '신선한 계란 10개입',
                    'calories': 400.0,
                    'protein': 30.0,
                    'carbs': 2.0,
                    'fat': 20.0,
                    'serving_size': '10개',
                },
                {
                    'name': '연어',
                    'description': '노르웨이산 연어 300g',
                    'calories': 600.0,
                    'protein': 40.0,
                    'carbs': 0.0,
                    'fat': 20.0,
                    'serving_size': '300g',
                },
                {
                    'name': '두부',
                    'description': '국산 콩으로 만든 두부',
                    'calories': 200.0,
                    'protein': 15.0,
                    'carbs': 5.0,
                    'fat': 8.0,
                    'serving_size': '200g',
                },
                {
                    'name': '소고기',
                    'description': '한우 등심 200g',
                    'calories': 250.0,
                    'protein': 55.0,
                    'carbs': 0.0,
                    'fat': 30.0,
                    'serving_size': '200g',
                },
            ],
            '지방': [
                {
                    'name': '아보카도',
                    'description': '신선한 아보카도 2개',
                    'calories': 250.0,
                    'protein': 3.0,
                    'carbs': 12.0,
                    'fat': 22.0,
                    'serving_size': '2개',
                },
                {
                    'name': '올리브오일',
                    'description': '엑스트라 버진 올리브오일 500ml',
                    'calories': 900.0,
                    'protein': 0.0,
                    'carbs': 0.0,
                    'fat': 100.0,
                    'serving_size': '500ml',
                },
                {
                    'name': '견과류 믹스',
                    'description': '아몬드, 호두, 캐슈넛 믹스',
                    'calories': 500.0,
                    'protein': 15.0,
                    'carbs': 20.0,
                    'fat': 40.0,
                    'serving_size': '100g',
                },
                {
                    'name': '참기름',
                    'description': '국산 참깨로 만든 참기름',
                    'calories': 800.0,
                    'protein': 0.0,
                    'carbs': 0.0,
                    'fat': 90.0,
                    'serving_size': '250ml',
                },
            ],
            '채소': [
                {
                    'name': '브로콜리',
                    'description': '신선한 브로콜리 1송이',
                    'calories': 55.0,
                    'protein': 3.7,
                    'carbs': 11.0,
                    'fat': 0.6,
                    'serving_size': '1송이',
                },
                {
                    'name': '시금치',
                    'description': '국산 시금치 200g',
                    'calories': 46.0,
                    'protein': 4.0,
                    'carbs': 7.0,
                    'fat': 0.5,
                    'serving_size': '200g',
                },
                {
                    'name': '당근',
                    'description': '신선한 당근 1kg',
                    'calories': 410.0,
                    'protein': 9.0,
                    'carbs': 95.0,
                    'fat': 1.0,
                    'serving_size': '1kg',
                },
                {
                    'name': '양파',
                    'description': '국산 양파 2kg',
                    'calories': 640.0,
                    'protein': 16.0,
                    'carbs': 150.0,
                    'fat': 2.0,
                    'serving_size': '2kg',
                },
                {
                    'name': '토마토',
                    'description': '방울토마토 500g',
                    'calories': 90.0,
                    'protein': 4.0,
                    'carbs': 20.0,
                    'fat': 1.0,
                    'serving_size': '500g',
                },
            ],
            '과일': [
                {
                    'name': '바나나',
                    'description': '필리핀산 바나나 1송이',
                    'calories': 105.0,
                    'protein': 1.3,
                    'carbs': 27.0,
                    'fat': 0.3,
                    'serving_size': '1개',
                },
                {
                    'name': '사과',
                    'description': '국산 사과 5개',
                    'calories': 95.0,
                    'protein': 0.5,
                    'carbs': 25.0,
                    'fat': 0.3,
                    'serving_size': '1개 당',
                },
                {
                    'name': '오렌지',
                    'description': '네이블 오렌지 10개',
                    'calories': 62.0,
                    'protein': 1.2,
                    'carbs': 15.0,
                    'fat': 0.2,
                    'serving_size': '1개',
                },
                {
                    'name': '딸기',
                    'description': '설향 딸기 500g',
                    'calories': 50.0,
                    'protein': 1.0,
                    'carbs': 12.0,
                    'fat': 0.3,
                    'serving_size': '100g',
                },
            ],
            '유제품': [
                {
                    'name': '우유',
                    'description': '서울우유 1L',
                    'calories': 150.0,
                    'protein': 8.0,
                    'carbs': 12.0,
                    'fat': 8.0,
                    'serving_size': '1L',
                },
                {
                    'name': '그릭요거트',
                    'description': '고단백 그릭요거트 450g',
                    'calories': 220.0,
                    'protein': 20.0,
                    'carbs': 15.0,
                    'fat': 10.0,
                    'serving_size': '450g',
                },
                {
                    'name': '체다치즈',
                    'description': '자연치즈 200g',
                    'calories': 350.0,
                    'protein': 25.0,
                    'carbs': 2.0,
                    'fat': 28.0,
                    'serving_size': '200g',
                },
                {
                    'name': '모짜렐라치즈',
                    'description': '피자용 모짜렐라치즈',
                    'calories': 300.0,
                    'protein': 22.0,
                    'carbs': 3.0,
                    'fat': 20.0,
                    'serving_size': '200g',
                },
            ],
            '음료': [
                {
                    'name': '프로틴 쉐이크',
                    'description': '바닐라맛 프로틴 파우더 1kg',
                    'calories': 250.0,
                    'protein': 30.0,
                    'carbs': 40.0,
                    'fat': 5.0,
                    'serving_size': '1kg',
                },
                {
                    'name': '아이소토닉',
                    'description': '전해질 보충 음료',
                    'calories': 150.0,
                    'protein': 0.0,
                    'carbs': 35.0,
                    'fat': 0.0,
                    'serving_size': '500ml',
                },
                {
                    'name': '녹차',
                    'description': '제주 녹차 티백 100개',
                    'calories': 2.0,
                    'protein': 0.0,
                    'carbs': 0.0,
                    'fat': 0.0,
                    'serving_size': '1개',
                },
            ],
            '건강보조식품': [
                {
                    'name': '멀티비타민',
                    'description': '종합비타민 90정',
                    'calories': 0.0,
                    'protein': 0.0,
                    'carbs': 0.0,
                    'fat': 0.0,
                    'serving_size': '1정',
                },
                {
                    'name': '오메가3',
                    'description': 'EPA DHA 오메가3 60캡슐',
                    'calories': 0.0,
                    'protein': 0.0,
                    'carbs': 0.0,
                    'fat': 0.0,
                    'serving_size': '1캡슐',
                },
                {
                    'name': 'BCAA',
                    'description': '분지사슬아미노산 300g',
                    'calories': 0.0,
                    'protein': 0.0,
                    'carbs': 0.0,
                    'fat': 0.0,
                    'serving_size': '300g',
                },
            ],
        }

        created_count = 0
        total_count = 0

        for category_name, foods in foods_data.items():
            for food_data in foods:
                total_count += 1
                # Product는 products_seed.py에서 미리 생성되어 있어야 하며, 이름으로 연결한다.
                product = Product.objects.filter(name=food_data['name']).first()
                if not product:
                    self.stdout.write(self.style.WARNING(f"연결할 Product가 없습니다: {food_data['name']}"))
                    continue

                # 이미 Product와 연결된 Food가 exist하면 건너뛴다.
                if hasattr(product, 'food_info'):
                    self.stdout.write(f"Food 이미 존재합니다: {food_data['name']}")
                    continue

                # Product의 is_food 값이 True이면 Product의 name, description을 사용
                # 그렇지 않으면 foods_data에 있는 값을 사용
                if product.is_food:
                    final_name = product.name
                    final_description = product.description
                else:
                    final_name = food_data['name']
                    final_description = food_data['description']

                try:
                    food = Food.objects.create(
                        user=default_user,
                        category=product.category,  # 연결된 Product의 카테고리 사용
                        product=product,
                        name=final_name,
                        description=final_description,
                        calories=Decimal(str(food_data['calories'])),
                        protein=Decimal(str(food_data['protein'])),
                        carbs=Decimal(str(food_data['carbs'])),
                        fat=Decimal(str(food_data['fat'])),
                        serving_size=food_data['serving_size'],
                    )
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f"✓ Food 생성: {food.name}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Food 생성 오류 ({food_data['name']}): {e}"))

        self.stdout.write(self.style.SUCCESS(
            f"\nFood 시딩 완료! 총 {total_count}개 중 {created_count}개 새로 생성됨"
        ))
