from django.core.management.base import BaseCommand
from diet.models import FoodCategory

class Command(BaseCommand):
    help = 'FoodCategory 기본 데이터를 생성합니다'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='기존 FoodCategory 데이터를 삭제하고 새로 생성',
        )

    def handle(self, *args, **options):
        # 기존 FoodCategory 데이터 삭제 옵션 처리
        if options['clear']:
            deleted_count = FoodCategory.objects.count()
            FoodCategory.objects.all().delete()
            self.stdout.write(f'기존 FoodCategory 데이터 {deleted_count}개를 삭제했습니다.')

        # 카테고리 데이터
        categories_data = [
            {
                'name': '탄수화물',
                'description': '에너지 공급을 위한 탄수화물이 풍부한 음식들',
                'is_active': True
            },
            {
                'name': '단백질',
                'description': '근육 형성과 회복을 위한 단백질이 풍부한 음식들',
                'is_active': True
            },
            {
                'name': '지방',
                'description': '필수 지방산과 지용성 비타민을 제공하는 음식들',
                'is_active': True
            },
            {
                'name': '채소',
                'description': '비타민, 미네랄, 식이섬유가 풍부한 채소류',
                'is_active': True
            },
            {
                'name': '과일',
                'description': '비타민C와 항산화물질이 풍부한 과일류',
                'is_active': True
            },
            {
                'name': '유제품',
                'description': '칼슘과 단백질이 풍부한 유제품류',
                'is_active': True
            },
            {
                'name': '음료',
                'description': '수분 보충과 영양 공급을 위한 음료류',
                'is_active': True
            },
            {
                'name': '건강보조식품',
                'description': '영양 보충을 위한 건강보조식품',
                'is_active': True
            },
            {
                'name': '한식',
                'description': '전통 한국 음식들',
                'is_active': True
            },
            {
                'name': '간식',
                'description': '디저트와 간식류',
                'is_active': True
            },
            {
                'name': '해산물',
                'description': '바다에서 나는 신선한 해산물',
                'is_active': True
            },
            {
                'name': '기타',
                'description': '기타 분류되지 않은 음식들',
                'is_active': True
            }
        ]

        created_count = 0
        total_count = len(categories_data)

        for category_data in categories_data:
            # 이미 존재하는 카테고리인지 확인 (이름으로)
            if FoodCategory.objects.filter(name=category_data['name']).exists():
                self.stdout.write(f"카테고리 이미 존재합니다: {category_data['name']}")
                continue

            try:
                category = FoodCategory.objects.create(**category_data)
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"✓ 카테고리 생성: {category.name}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"카테고리 생성 오류 ({category_data['name']}): {e}"))

        self.stdout.write(self.style.SUCCESS(
            f"\nFoodCategory 시딩 완료! 총 {total_count}개 중 {created_count}개 새로 생성됨"
        )) 