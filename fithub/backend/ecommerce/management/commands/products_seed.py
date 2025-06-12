import os
from dotenv import load_dotenv
from django.core.management.base import BaseCommand
from ecommerce.models import Category, Product
import requests
import random
from decimal import Decimal

# .env 파일의 환경변수를 로드
load_dotenv()

class Command(BaseCommand):
    help = '상품 기본 데이터를 생성합니다 (Unsplash 이미지 포함)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='기존 상품 데이터를 삭제하고 새로 생성',
        )
        parser.add_argument(
            '--with-images',
            action='store_true',
            help='Unsplash API를 통해 실제 이미지를 가져와서 저장',
        )

    def get_unsplash_image_url(self, query, width=400, height=300):
        """Unsplash API를 통해 이미지 URL 가져오기 (정식 API 사용)"""
        UNSPLASH_ACCESS_KEY = os.getenv('UNSPLASH_ACCESS_KEY')
        if not UNSPLASH_ACCESS_KEY:
            self.stdout.write(self.style.WARNING("Unsplash API 키가 설정되어 있지 않습니다"))
            return None

        unsplash_url = 'https://api.unsplash.com/photos/random'
        headers = {
            'Accept-Version': 'v1',
            'Authorization': f'Client-ID {UNSPLASH_ACCESS_KEY}'
        }
        params = {
            'query': query,
            'orientation': 'landscape',
            'w': width,
            'h': height
        }

        try:
            response = requests.get(unsplash_url, headers=headers, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                image_url = data.get('urls', {}).get('regular')
                if image_url:
                    return image_url
                else:
                    self.stdout.write(self.style.WARNING(f'API 응답에서 이미지 URL을 찾을 수 없습니다 (query: {query})'))
                    return None
            else:
                self.stdout.write(self.style.WARNING(f'Unsplash API 호출 실패: 상태코드 {response.status_code} (query: {query})'))
                return None
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Unsplash API 요청 실패 (query: {query}): {e}'))
            return None

    def calculate_prices(self, base_price):
        """가격 계산 로직"""
        price_variation = random.randint(-200, 500)
        final_price = max(base_price + price_variation, 1000)  # 최소 1000원

        sale_price = None
        if random.random() < 0.3:  # 30% 확률로 할인
            discount_rate = random.uniform(0.1, 0.3)  # 10-30% 할인
            sale_price = int(final_price * (1 - discount_rate))
            sale_price = max(sale_price, 1000)

        return final_price, sale_price

    def create_product(self, category, product_data, use_images=False):
        """상품 생성 로직"""
        final_price, sale_price = self.calculate_prices(product_data['price'])

        image_url = None
        if use_images and product_data.get('query'):
            image_url = self.get_unsplash_image_url(product_data['query'])

        try:
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults={
                    'category': category,
                    'description': product_data['description'],
                    'price': Decimal(str(final_price)),
                    'sale_price': Decimal(str(sale_price)) if sale_price else None,
                    'stock_quantity': random.randint(10, 100),
                    'is_food': product_data.get('is_food', True),  # 기본은 음식으로 처리
                    'is_active': True,
                    'is_featured': random.choice([True, False]),
                    'image_url': image_url,  # 실제 Product 모델에 해당 필드가 있어야 함
                }
            )
            return product, created
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"상품 생성 오류 ({product_data['name']}): {e}"))
            return None, False

    def handle(self, *args, **options):
        if options['clear']:
            deleted_count = Product.objects.count()
            Product.objects.all().delete()
            self.stdout.write(f'기존 상품 데이터 {deleted_count}개를 삭제했습니다.')

        use_images = options.get('with_images', False)
        if use_images:
            self.stdout.write('Unsplash 이미지를 가져와서 상품에 적용합니다...')

        products_data = {
            '탄수화물': [
                {'name': 'CJ 햇반 백미밥', 'price': 1500, 'description': '간편하게 먹을 수 있는 즉석밥', 'query': 'rice'},
                {'name': '오뚜기 진라면', 'price': 1200, 'description': '매콤한 맛의 인스턴트 라면', 'query': 'ramen'},
                {'name': '식빵', 'price': 2500, 'description': '부드러운 식빵', 'query': 'bread'},
                {'name': '현미밥', 'price': 1800, 'description': '건강한 현미밥', 'query': 'brown-rice'},
                {'name': '고구마', 'price': 3000, 'description': '달콤한 고구마 1kg', 'query': 'sweet-potato'},
            ],
            '단백질': [
                {'name': '닭가슴살', 'price': 8000, 'description': '신선한 닭가슴살 500g', 'query': 'chicken-breast'},
                {'name': '계란', 'price': 4000, 'description': '신선한 계란 10개입', 'query': 'eggs'},
                {'name': '연어', 'price': 15000, 'description': '노르웨이산 연어 300g', 'query': 'salmon'},
                {'name': '두부', 'price': 2000, 'description': '국산 콩으로 만든 두부', 'query': 'tofu'},
                {'name': '소고기', 'price': 25000, 'description': '한우 등심 200g', 'query': 'beef'},
            ],
            '지방': [
                {'name': '아보카도', 'price': 5000, 'description': '신선한 아보카도 2개', 'query': 'avocado'},
                {'name': '올리브오일', 'price': 12000, 'description': '엑스트라 버진 올리브오일 500ml', 'query': 'olive-oil'},
                {'name': '견과류 믹스', 'price': 8000, 'description': '아몬드, 호두, 캐슈넛 믹스', 'query': 'nuts'},
                {'name': '참기름', 'price': 7000, 'description': '국산 참깨로 만든 참기름', 'query': 'sesame-oil'},
            ],
            '채소': [
                {'name': '브로콜리', 'price': 3000, 'description': '신선한 브로콜리 1송이', 'query': 'broccoli'},
                {'name': '시금치', 'price': 2000, 'description': '국산 시금치 200g', 'query': 'spinach'},
                {'name': '당근', 'price': 2500, 'description': '신선한 당근 1kg', 'query': 'carrots'},
                {'name': '양파', 'price': 3000, 'description': '국산 양파 2kg', 'query': 'onions'},
                {'name': '토마토', 'price': 4000, 'description': '방울토마토 500g', 'query': 'tomatoes'},
            ],
            '과일': [
                {'name': '바나나', 'price': 4000, 'description': '필리핀산 바나나 1송이', 'query': 'bananas'},
                {'name': '사과', 'price': 6000, 'description': '국산 사과 5개', 'query': 'apples'},
                {'name': '오렌지', 'price': 5000, 'description': '네이블 오렌지 10개', 'query': 'oranges'},
                {'name': '딸기', 'price': 8000, 'description': '설향 딸기 500g', 'query': 'strawberries'},
            ],
            '유제품': [
                {'name': '우유', 'price': 3000, 'description': '서울우유 1L', 'query': 'milk'},
                {'name': '그릭요거트', 'price': 4500, 'description': '고단백 그릭요거트 450g', 'query': 'yogurt'},
                {'name': '체다치즈', 'price': 6000, 'description': '자연치즈 200g', 'query': 'cheese'},
                {'name': '모짜렐라치즈', 'price': 5500, 'description': '피자용 모짜렐라치즈', 'query': 'mozzarella'},
            ],
            '음료': [
                {'name': '프로틴 쉐이크', 'price': 35000, 'description': '바닐라맛 프로틴 파우더 1kg', 'query': 'protein-shake'},
                {'name': '아이소토닉', 'price': 1500, 'description': '전해질 보충 음료', 'query': 'sports-drink'},
                {'name': '녹차', 'price': 8000, 'description': '제주 녹차 티백 100개', 'query': 'green-tea'},
            ],
            '건강보조식품': [
                {'name': '멀티비타민', 'price': 25000, 'description': '종합비타민 90정', 'query': 'vitamins'},
                {'name': '오메가3', 'price': 30000, 'description': 'EPA DHA 오메가3 60캡슐', 'query': 'omega3'},
                {'name': 'BCAA', 'price': 40000, 'description': '분지사슬아미노산 300g', 'query': 'bcaa'},
            ],
            '가전제품': [
                {'name': '삼성 스마트 TV', 'price': 1200000, 'description': '최신형 삼성 스마트 TV, 4K UHD', 'query': 'samsung tv', 'is_food': False},
                {'name': 'LG 냉장고', 'price': 850000, 'description': 'LG 듀얼 인버터 냉장고, 에너지 효율 1등급', 'query': 'lg fridge', 'is_food': False},
                {'name': '애플 아이폰', 'price': 950000, 'description': '애플 아이폰 최신 모델', 'query': 'iphone', 'is_food': False},
            ],
        }

        created_count = 0
        total_count = 0

        for category_name, products in products_data.items():
            try:
                category = Category.objects.get(name=category_name)
            except Category.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'카테고리 "{category_name}"를 찾을 수 없습니다.'))
                continue

            for product_data in products:
                total_count += 1
                product, created = self.create_product(category, product_data, use_images)
                if product and created:
                    created_count += 1
                    price_info = f"가격: {product.price}원"
                    if product.sale_price:
                        price_info += f" (할인가: {product.sale_price}원)"
                    self.stdout.write(f'✓ 상품 생성: {product.name} ({price_info})')
                elif product:
                    self.stdout.write(f'- 상품 이미 존재: {product.name}')

        self.stdout.write(self.style.SUCCESS(
            f'\n상품 시딩 완료! 총 {total_count}개 중 {created_count}개 새로 생성됨'
        ))

        if use_images:
            self.stdout.write('이미지가 포함된 상품들이 생성되었습니다.')