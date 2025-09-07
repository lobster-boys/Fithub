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
                    'description': '간편하게 먹을 수 있는 즉석밥 210g',
                    'calories': 130.0,
                    'protein': 2.5,
                    'carbs': 28.0,
                    'fat': 0.3,
                    'serving_size': '200g',
                },
                {
                    'name': '오뚜기 진라면',
                    'description': '매콤한 인스턴트 라면 1봉지 (120g)',
                    'calories': 500.0,
                    'protein': 10.0,
                    'carbs': 60.0,
                    'fat': 15.0,
                    'serving_size': '1봉지',
                },
                {
                    'name': '식빵',
                    'description': '부드러운 식빵 1조각 (80g)',
                    'calories': 150.0,
                    'protein': 5.0,
                    'carbs': 30.0,
                    'fat': 2.0,
                    'serving_size': '1조각',
                },
                {
                    'name': '현미밥',
                    'description': '건강한 현미밥 210g',
                    'calories': 180.0,
                    'protein': 4.0,
                    'carbs': 35.0,
                    'fat': 1.5,
                    'serving_size': '210g',
                },
                {
                    'name': '고구마',
                    'description': '달콤한 고구마 1팩 (1kg)',
                    'calories': 300.0,
                    'protein': 3.0,
                    'carbs': 70.0,
                    'fat': 0.5,
                    'serving_size': '1kg',
                },
                {
                    'name': '파스타',
                    'description': '마른 파스타 500g',
                    'calories': 350.0,
                    'protein': 12.0,
                    'carbs': 70.0,
                    'fat': 2.0,
                    'serving_size': '500g',
                },
                {
                    'name': '퀴노아',
                    'description': '영양가 높은 퀴노아 400g',
                    'calories': 370.0,
                    'protein': 14.0,
                    'carbs': 65.0,
                    'fat': 6.0,
                    'serving_size': '400g',
                },
                {
                    'name': '오트밀',
                    'description': '건강한 아침 식사용 오트밀 300g',
                    'calories': 280.0,
                    'protein': 10.0,
                    'carbs': 50.0,
                    'fat': 5.0,
                    'serving_size': '300g',
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
                    'description': '신선한 계란 10개 (600g)',
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
                    'description': '콩으로 만든 두부 300g',
                    'calories': 200.0,
                    'protein': 15.0,
                    'carbs': 5.0,
                    'fat': 8.0,
                    'serving_size': '300g',
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
                {
                    'name': '칠면조 고기',
                    'description': '칠면조 가슴살 400g',
                    'calories': 350.0,
                    'protein': 45.0,
                    'carbs': 0.0,
                    'fat': 10.0,
                    'serving_size': '400g',
                },
                {
                    'name': '새우',
                    'description': '신선한 새우 300g',
                    'calories': 180.0,
                    'protein': 35.0,
                    'carbs': 0.0,
                    'fat': 2.0,
                    'serving_size': '300g',
                },
            ],
            '지방': [
                {
                    'name': '아보카도',
                    'description': '신선한 아보카도 2개 (300g)',
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
                    'description': '아몬드, 호두, 캐슈넛 100g 믹스',
                    'calories': 500.0,
                    'protein': 15.0,
                    'carbs': 20.0,
                    'fat': 40.0,
                    'serving_size': '100g',
                },
                {
                    'name': '참기름',
                    'description': '국산 참깨로 만든 참기름 250ml',
                    'calories': 800.0,
                    'protein': 0.0,
                    'carbs': 0.0,
                    'fat': 90.0,
                    'serving_size': '250ml',
                },
                {
                    'name': '코코넛오일',
                    'description': '코코넛오일 400ml',
                    'calories': 850.0,
                    'protein': 0.0,
                    'carbs': 0.0,
                    'fat': 95.0,
                    'serving_size': '400ml',
                },
            ],
            '채소': [
                {
                    'name': '브로콜리',
                    'description': '신선한 브로콜리 1송이 (250g)',
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
                {
                    'name': '오이',
                    'description': '신선한 오이 1kg',
                    'calories': 160.0,
                    'protein': 2.0,
                    'carbs': 36.0,
                    'fat': 0.2,
                    'serving_size': '1kg',
                },
                {
                    'name': '피망',
                    'description': '다양한 피망 500g',
                    'calories': 100.0,
                    'protein': 3.0,
                    'carbs': 15.0,
                    'fat': 0.5,
                    'serving_size': '500g',
                },
            ],
            '과일': [
                {
                    'name': '바나나',
                    'description': '필리핀산 바나나 1송이 (1kg)',
                    'calories': 105.0,
                    'protein': 1.3,
                    'carbs': 27.0,
                    'fat': 0.3,
                    'serving_size': '1개',
                },
                {
                    'name': '사과',
                    'description': '국산 사과 5개 (900g)',
                    'calories': 95.0,
                    'protein': 0.5,
                    'carbs': 25.0,
                    'fat': 0.3,
                    'serving_size': '1개 당',
                },
                {
                    'name': '오렌지',
                    'description': '네이블 오렌지 10개 (1.2kg)',
                    'calories': 62.0,
                    'protein': 1.2,
                    'carbs': 15.0,
                    'fat': 0.2,
                    'serving_size': '1개',
                },
                {
                    'name': '딸기',
                    'description': '신선한 딸기 500g',
                    'calories': 50.0,
                    'protein': 1.0,
                    'carbs': 12.0,
                    'fat': 0.3,
                    'serving_size': '100g',
                },
                {
                    'name': '포도',
                    'description': '신선한 포도 500g',
                    'calories': 70.0,
                    'protein': 0.6,
                    'carbs': 18.0,
                    'fat': 0.4,
                    'serving_size': '500g',
                },
                {
                    'name': '키위',
                    'description': '국산 키위 4개 (400g)',
                    'calories': 42.0,
                    'protein': 0.8,
                    'carbs': 10.0,
                    'fat': 0.4,
                    'serving_size': '1개',
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
                    'description': '자연치즈 체다 200g',
                    'calories': 350.0,
                    'protein': 25.0,
                    'carbs': 2.0,
                    'fat': 28.0,
                    'serving_size': '200g',
                },
                {
                    'name': '모짜렐라치즈',
                    'description': '피자용 모짜렐라치즈 200g',
                    'calories': 300.0,
                    'protein': 22.0,
                    'carbs': 3.0,
                    'fat': 20.0,
                    'serving_size': '200g',
                },
                {
                    'name': '플레인요거트',
                    'description': '플레인 요거트 500g',
                    'calories': 180.0,
                    'protein': 10.0,
                    'carbs': 20.0,
                    'fat': 5.0,
                    'serving_size': '500g',
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
                    'description': '전해질 보충 음료 500ml',
                    'calories': 150.0,
                    'protein': 0.0,
                    'carbs': 35.0,
                    'fat': 0.0,
                    'serving_size': '500ml',
                },
                {
                    'name': '녹차',
                    'description': '제주 녹차 티백 100개 (200g)',
                    'calories': 2.0,
                    'protein': 0.0,
                    'carbs': 0.0,
                    'fat': 0.0,
                    'serving_size': '1개',
                },
                {
                    'name': '커피',
                    'description': '원두 커피 250g',
                    'calories': 5.0,
                    'protein': 0.0,
                    'carbs': 0.0,
                    'fat': 0.0,
                    'serving_size': '250g',
                },
                {
                    'name': '에너지 드링크',
                    'description': '에너지 드링크 250ml',
                    'calories': 150.0,
                    'protein': 0.0,
                    'carbs': 35.0,
                    'fat': 0.0,
                    'serving_size': '250ml',
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
                    'description': '분지사슬 아미노산 300g',
                    'calories': 0.0,
                    'protein': 0.0,
                    'carbs': 0.0,
                    'fat': 0.0,
                    'serving_size': '300g',
                },
                {
                    'name': '프로바이오틱스',
                    'description': '프로바이오틱스 60캡슐',
                    'calories': 0.0,
                    'protein': 0.0,
                    'carbs': 0.0,
                    'fat': 0.0,
                    'serving_size': '1캡슐',
                },
                {
                    'name': '비타민C',
                    'description': '비타민 C 100정',
                    'calories': 0.0,
                    'protein': 0.0,
                    'carbs': 0.0,
                    'fat': 0.0,
                    'serving_size': '1정',
                },
            ],
            '한식': [
                {
                    'name': '김치찌개',
                    'description': '매콤한 김치찌개 1인분 (300g)',
                    'calories': 250.0,
                    'protein': 15.0,
                    'carbs': 20.0,
                    'fat': 12.0,
                    'serving_size': '1인분',
                },
                {
                    'name': '된장찌개',
                    'description': '구수한 된장찌개 1인분 (300g)',
                    'calories': 180.0,
                    'protein': 12.0,
                    'carbs': 15.0,
                    'fat': 8.0,
                    'serving_size': '1인분',
                },
                {
                    'name': '불고기',
                    'description': '한우 불고기 200g',
                    'calories': 300.0,
                    'protein': 25.0,
                    'carbs': 10.0,
                    'fat': 18.0,
                    'serving_size': '200g',
                },
                {
                    'name': '김밥',
                    'description': '참치김밥 1줄 (200g)',
                    'calories': 350.0,
                    'protein': 15.0,
                    'carbs': 45.0,
                    'fat': 12.0,
                    'serving_size': '1줄',
                },
                {
                    'name': '비빔밥',
                    'description': '야채 비빔밥 1인분 (400g)',
                    'calories': 420.0,
                    'protein': 18.0,
                    'carbs': 65.0,
                    'fat': 10.0,
                    'serving_size': '1인분',
                },
                {
                    'name': '냉면',
                    'description': '물냉면 1그릇 (500g)',
                    'calories': 380.0,
                    'protein': 12.0,
                    'carbs': 75.0,
                    'fat': 3.0,
                    'serving_size': '1그릇',
                },
                {
                    'name': '갈비탕',
                    'description': '소갈비탕 1인분 (400g)',
                    'calories': 450.0,
                    'protein': 30.0,
                    'carbs': 25.0,
                    'fat': 25.0,
                    'serving_size': '1인분',
                },
                {
                    'name': '삼겹살',
                    'description': '구이용 삼겹살 200g',
                    'calories': 500.0,
                    'protein': 20.0,
                    'carbs': 0.0,
                    'fat': 45.0,
                    'serving_size': '200g',
                },
            ],
            '간식': [
                {
                    'name': '아이스크림',
                    'description': '바닐라 아이스크림 1컵 (100g)',
                    'calories': 200.0,
                    'protein': 3.5,
                    'carbs': 24.0,
                    'fat': 10.0,
                    'serving_size': '1컵',
                },
                {
                    'name': '초콜릿',
                    'description': '다크 초콜릿 50g',
                    'calories': 250.0,
                    'protein': 3.0,
                    'carbs': 30.0,
                    'fat': 15.0,
                    'serving_size': '50g',
                },
                {
                    'name': '팝콘',
                    'description': '에어팝 팝콘 30g',
                    'calories': 120.0,
                    'protein': 4.0,
                    'carbs': 24.0,
                    'fat': 1.5,
                    'serving_size': '30g',
                },
                {
                    'name': '과자',
                    'description': '감자칩 1봉지 (60g)',
                    'calories': 320.0,
                    'protein': 4.0,
                    'carbs': 32.0,
                    'fat': 20.0,
                    'serving_size': '1봉지',
                },
                {
                    'name': '쿠키',
                    'description': '초콜릿칩 쿠키 3개 (45g)',
                    'calories': 200.0,
                    'protein': 2.0,
                    'carbs': 28.0,
                    'fat': 9.0,
                    'serving_size': '3개',
                },
            ],
            '해산물': [
                {
                    'name': '참치회',
                    'description': '신선한 참치회 100g',
                    'calories': 150.0,
                    'protein': 30.0,
                    'carbs': 0.0,
                    'fat': 3.0,
                    'serving_size': '100g',
                },
                {
                    'name': '광어회',
                    'description': '신선한 광어회 100g',
                    'calories': 120.0,
                    'protein': 25.0,
                    'carbs': 0.0,
                    'fat': 2.0,
                    'serving_size': '100g',
                },
                {
                    'name': '조개탕',
                    'description': '바지락 조개탕 1인분 (300g)',
                    'calories': 80.0,
                    'protein': 12.0,
                    'carbs': 5.0,
                    'fat': 1.0,
                    'serving_size': '1인분',
                },
                {
                    'name': '생선구이',
                    'description': '고등어 구이 1마리 (200g)',
                    'calories': 350.0,
                    'protein': 28.0,
                    'carbs': 0.0,
                    'fat': 25.0,
                    'serving_size': '1마리',
                },
                {
                    'name': '오징어',
                    'description': '신선한 오징어 200g',
                    'calories': 180.0,
                    'protein': 30.0,
                    'carbs': 3.0,
                    'fat': 2.0,
                    'serving_size': '200g',
                },
                {
                    'name': '전복',
                    'description': '활전복 5마리 (300g)',
                    'calories': 100.0,
                    'protein': 20.0,
                    'carbs': 2.0,
                    'fat': 1.0,
                    'serving_size': '5마리',
                },
            ],
        }


        created_count = 0
        total_count = 0

        # 카테고리 이름으로 FoodCategory 객체들을 미리 가져오기
        from diet.models import FoodCategory
        categories = {cat.name: cat for cat in FoodCategory.objects.all()}

        for category_name, foods in foods_data.items():
            # 카테고리 확인
            if category_name not in categories:
                self.stdout.write(self.style.WARNING(f"카테고리가 없습니다: {category_name}"))
                continue
                
            category = categories[category_name]
            
            for food_data in foods:
                total_count += 1
                
                # 이미 존재하는 Food인지 확인 (이름으로)
                if Food.objects.filter(name=food_data['name']).exists():
                    self.stdout.write(f"Food 이미 존재합니다: {food_data['name']}")
                    continue

                try:
                    food = Food.objects.create(
                        user=default_user,
                        category=category,  # 카테고리 직접 사용
                        product=None,  # Product 연결 없이 생성
                        name=food_data['name'],
                        description=food_data['description'],
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
