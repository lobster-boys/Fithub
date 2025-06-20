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

    def create_product(self, category, data, use_images=False):
        """상품 생성 로직"""
        final_price, sale_price = self.calculate_prices(data['price'])

        unit_weight = data.get('unit_weight_g', 0)
        if data.get('is_food', True) and unit_weight == 0:
            # 안전장치: 음식인데 무게 없으면 기본 100g으로 계산
            unit_weight = 100


        image_url = None
        if use_images and data.get('query'):
            image_url = self.get_unsplash_image_url(data['query'])

        try:
            product, created = Product.objects.get_or_create(
                name=data['name'],
                defaults={
                    'category': category,
                    'description': data['description'],
                    'price': Decimal(str(final_price)),
                    'sale_price': Decimal(str(sale_price)) if sale_price else None,
                    'stock_quantity': random.randint(10, 100),
                    'is_food': data.get('is_food', True),  # 기본은 음식으로 처리
                    'unit_weight_g': unit_weight, 
                    'is_active': True,
                    'is_featured': random.choice([True, False]),
                    'image_url': image_url,  # 실제 Product 모델에 해당 필드가 있어야 함
                }
            )
            return product, created
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"상품 생성 오류 ({data['name']}): {e}"))
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
                {'name': 'CJ 햇반 백미밥', 'price': 1500, 'description': '즉석밥 210g', 'query': 'rice', 'unit_weight_g': 210},
                {'name': '오뚜기 진라면', 'price': 1200, 'description': '라면 120g', 'query': 'ramen', 'unit_weight_g': 120},
                {'name': '식빵', 'price': 2500, 'description': '식빵 1봉 (400g)', 'query': 'bread', 'unit_weight_g': 400},
                {'name': '현미밥', 'price': 1800, 'description': '현미밥 210g', 'query': 'brown rice', 'unit_weight_g': 210},
                {'name': '고구마', 'price': 3000, 'description': '고구마 1팩 (1kg)', 'query': 'sweet potato', 'unit_weight_g': 1000},
                {'name': '파스타', 'price': 4000, 'description': '파스타 500g', 'query': 'pasta', 'unit_weight_g': 500},
                {'name': '퀴노아', 'price': 5000, 'description': '퀴노아 400g', 'query': 'quinoa', 'unit_weight_g': 400},
                {'name': '오트밀', 'price': 3500, 'description': '오트밀 300g', 'query': 'oatmeal', 'unit_weight_g': 300},
            ],
            '단백질': [
                {'name': '닭가슴살', 'price': 8000, 'description': '닭가슴살 500g', 'query': 'chicken breast', 'unit_weight_g': 500},
                {'name': '계란', 'price': 4000, 'description': '계란 10개 (600g)', 'query': 'eggs', 'unit_weight_g': 600},
                {'name': '연어', 'price': 15000, 'description': '연어 300g', 'query': 'salmon', 'unit_weight_g': 300},
                {'name': '두부', 'price': 2000, 'description': '두부 300g', 'query': 'tofu', 'unit_weight_g': 300},
                {'name': '소고기', 'price': 25000, 'description': '소고기 등심 200g', 'query': 'beef', 'unit_weight_g': 200},
                {'name': '칠면조 고기', 'price': 22000, 'description': '칠면조 가슴살 400g', 'query': 'turkey', 'unit_weight_g': 400},
                {'name': '새우', 'price': 18000, 'description': '새우 300g', 'query': 'shrimp', 'unit_weight_g': 300},
            ],
            '지방': [
                {'name': '아보카도', 'price': 5000, 'description': '아보카도 2개 (300g)', 'query': 'avocado', 'unit_weight_g': 300},
                {'name': '올리브오일', 'price': 12000, 'description': '올리브오일 500ml', 'query': 'olive oil', 'unit_weight_g': 500},
                {'name': '견과류 믹스', 'price': 8000, 'description': '견과류 믹스 100g', 'query': 'nuts', 'unit_weight_g': 100},
                {'name': '참기름', 'price': 7000, 'description': '참기름 250ml', 'query': 'sesame oil', 'unit_weight_g': 250},
                {'name': '코코넛오일', 'price': 11000, 'description': '코코넛오일 400ml', 'query': 'coconut oil', 'unit_weight_g': 400},
            ],
            '채소': [
                {'name': '브로콜리', 'price': 3000, 'description': '브로콜리 1송이 (250g)', 'query': 'broccoli', 'unit_weight_g': 250},
                {'name': '시금치', 'price': 2000, 'description': '시금치 200g', 'query': 'spinach', 'unit_weight_g': 200},
                {'name': '당근', 'price': 2500, 'description': '당근 1kg', 'query': 'carrot', 'unit_weight_g': 1000},
                {'name': '양파', 'price': 3000, 'description': '양파 2kg', 'query': 'onion', 'unit_weight_g': 2000},
                {'name': '토마토', 'price': 4000, 'description': '토마토 500g', 'query': 'tomato', 'unit_weight_g': 500},
                {'name': '오이', 'price': 1500, 'description': '오이 1kg', 'query': 'cucumber', 'unit_weight_g': 1000},
                {'name': '피망', 'price': 4000, 'description': '다양한 피망 500g', 'query': 'bell pepper', 'unit_weight_g': 500},
            ],
            '과일': [
                {'name': '바나나', 'price': 4000, 'description': '바나나 1송이 (1kg)', 'query': 'banana', 'unit_weight_g': 1000},
                {'name': '사과', 'price': 6000, 'description': '사과 5개 (900g)', 'query': 'apple', 'unit_weight_g': 900},
                {'name': '오렌지', 'price': 5000, 'description': '오렌지 10개 (1.2kg)', 'query': 'orange', 'unit_weight_g': 1200},
                {'name': '딸기', 'price': 8000, 'description': '딸기 500g', 'query': 'strawberry', 'unit_weight_g': 500},
                {'name': '포도', 'price': 7000, 'description': '포도 500g', 'query': 'grapes', 'unit_weight_g': 500},
                {'name': '키위', 'price': 6500, 'description': '키위 4개 (400g)', 'query': 'kiwi', 'unit_weight_g': 400},
            ],
            '유제품': [
                {'name': '우유', 'price': 3000, 'description': '우유 1L', 'query': 'milk', 'unit_weight_g': 1000},
                {'name': '그릭요거트', 'price': 4500, 'description': '그릭요거트 450g', 'query': 'yogurt', 'unit_weight_g': 450},
                {'name': '체다치즈', 'price': 6000, 'description': '체다치즈 200g', 'query': 'cheddar cheese', 'unit_weight_g': 200},
                {'name': '모짜렐라치즈', 'price': 5500, 'description': '모짜렐라치즈 200g', 'query': 'mozzarella', 'unit_weight_g': 200},
                {'name': '플레인요거트', 'price': 4000, 'description': '플레인요거트 500g', 'query': 'plain yogurt', 'unit_weight_g': 500},
            ],
            '음료': [
                {'name': '프로틴 쉐이크', 'price': 35000, 'description': '프로틴 파우더 1kg', 'query': 'protein shake', 'unit_weight_g': 1000},
                {'name': '아이소토닉', 'price': 1500, 'description': '아이소토닉 음료 500ml', 'query': 'sports drink', 'unit_weight_g': 500},
                {'name': '녹차', 'price': 8000, 'description': '녹차 티백 100개 (200g)', 'query': 'green tea', 'unit_weight_g': 200},
                {'name': '커피', 'price': 5000, 'description': '원두 커피 250g', 'query': 'coffee', 'unit_weight_g': 250},
                {'name': '에너지 드링크', 'price': 3000, 'description': '에너지 드링크 250ml', 'query': 'energy drink', 'unit_weight_g': 250},
            ],
            '건강보조식품': [
                {'name': '멀티비타민', 'price': 25000, 'description': '종합비타민 90정', 'query': 'multivitamin', 'unit_weight_g': 90},
                {'name': '오메가3', 'price': 30000, 'description': '오메가3 60캡슐', 'query': 'omega3', 'unit_weight_g': 60},
                {'name': 'BCAA', 'price': 40000, 'description': 'BCAA 300g', 'query': 'BCAA', 'unit_weight_g': 300},
                {'name': '프로바이오틱스', 'price': 35000, 'description': '프로바이오틱스 60캡슐', 'query': 'probiotics', 'unit_weight_g': 60},
                {'name': '비타민C', 'price': 20000, 'description': '비타민 C 100정', 'query': 'vitamin C', 'unit_weight_g': 100},
            ],
            '가전제품': [
                {'name': '삼성 스마트 TV', 'price': 1200000, 'description': '4K UHD TV', 'query': 'samsung tv', 'is_food': False, 'unit_weight_g': 0},
                {'name': 'LG 냉장고', 'price': 850000, 'description': '인버터 냉장고', 'query': 'lg fridge', 'is_food': False, 'unit_weight_g': 0},
                {'name': '애플 아이폰', 'price': 950000, 'description': '최신 아이폰', 'query': 'iphone', 'is_food': False, 'unit_weight_g': 0},
                {'name': '소니 헤드폰', 'price': 150000, 'description': '노이즈 캔슬링 헤드폰', 'query': 'sony headphones', 'is_food': False, 'unit_weight_g': 0},
                {'name': '샤오미 미밴드', 'price': 30000, 'description': '스마트 밴드', 'query': 'xiaomi band', 'is_food': False, 'unit_weight_g': 0},
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