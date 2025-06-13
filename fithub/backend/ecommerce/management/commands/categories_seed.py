from django.core.management.base import BaseCommand
from ecommerce.models import Category

class Command(BaseCommand):
    help = '카테고리 기본 데이터를 생성합니다'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='기존 카테고리 데이터를 삭제하고 새로 생성',
        )

    def handle(self, *args, **options):
        if options['clear']:
            Category.objects.all().delete()
            self.stdout.write('기존 카테고리 데이터를 삭제했습니다.')

        categories_data = [
            {
                'name': '탄수화물',
                'description': '에너지 공급원인 탄수화물 식품 (쌀, 빵, 면류 등)',
                'is_active': True,
            },
            {
                'name': '단백질',
                'description': '근육 생성에 필요한 단백질 식품 (육류, 생선, 달걀 등)',
                'is_active': True,
            },
            {
                'name': '지방',
                'description': '필수지방산을 포함한 지방 식품 (견과류, 오일 등)',
                'is_active': True,
            },
            {
                'name': '채소',
                'description': '비타민과 미네랄이 풍부한 채소류',
                'is_active': True,
            },
            {
                'name': '과일',
                'description': '비타민과 식이섬유가 풍부한 과일류',
                'is_active': True,
            },
            {
                'name': '유제품',
                'description': '칼슘이 풍부한 유제품류 (우유, 치즈, 요거트 등)',
                'is_active': True,
            },
            {
                'name': '음료',
                'description': '수분 보충용 음료류',
                'is_active': True,
            },
            {
                'name': '건강보조식품',
                'description': '영양 보충을 위한 건강보조식품',
                'is_active': True,
            },
            {
                'name': '가전제품',
                'description': '실생활에서 많이 사용하는 가전제품',
                'is_active': True,
            },
        ]

        created_count = 0
        for category_data in categories_data:
            try:
                category, created = Category.objects.get_or_create(
                    name=category_data['name'],
                    defaults={
                        'description': category_data['description'],
                        'is_active': category_data['is_active'],
                    }
                )
                if created:
                    created_count += 1
                    self.stdout.write(f"카테고리 생성: {category.name}")
                else:
                    self.stdout.write(f"카테고리 이미 존재: {category.name}")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error while creating {category_data['name']}: {e}"))

        self.stdout.write(
            self.style.SUCCESS(
                f'카테고리 시딩 완료! 총 {created_count}개 생성됨'
            )
        )
