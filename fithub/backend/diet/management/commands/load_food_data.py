import os
import time
import json
import re
import logging
import requests
import urllib3
from decimal import Decimal, InvalidOperation
from dotenv import load_dotenv
from django.core.management.base import BaseCommand
from django.db import transaction, models
from diet.models import Food, FoodCategory

# SSL 경고 억제
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 로거 설정
logger = logging.getLogger(__name__)

# .env 파일의 환경변수 로드
load_dotenv()

class Command(BaseCommand):
    help = "식품의약품안전처 Open API로부터 Food 데이터를 수집하여 저장합니다."
    
    # HTTP로 변경 (SSL 에러 해결)
    API_BASE_URL = "http://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02"
    DATA_TYPE = "json"
    BATCH_SIZE = 100
    REQUEST_DELAY = 0.5
    
    # API 키 (환경변수 FOOD_SAFETY_API_KEY)
    SERVICE_KEY = os.getenv('FOOD_SAFETY_API_KEY')
    
    # 프로세스 요구사항에 따른 FOOD_CAT1_NM(식품대분류명) 기준 매핑
    CATEGORY_MAPPING = {
        # 탄수화물 그룹
        "밥류": "탄수화물",
        "죽 및 스프류": "탄수화물",
        "면 및 만두류": "탄수화물",
        "감자 및 전분류": "탄수화물",
        "부침류": "탄수화물",
        "국 및 탕류": "탄수화물",
        "찌개 및 전골류": "탄수화물",
        "조림류": "탄수화물",
        "찜류": "탄수화물",
        "떡류": "탄수화물",
        
        # 단백질 그룹
        "육류": "단백질",
        "수·조·어·육류": "단백질",
        "구이류": "단백질",
        
        # 지방 그룹
        "견과 및 종실류": "지방",
        "튀김류": "지방",
        "볶음류": "지방",
        
        # 과일 그룹
        "과일류": "과일",

        # 유제품
        "유가공품류": "유제품",
        "유제품류": "유제품",
        
        # 채소 그룹
        "채소류": "채소",
        "버섯류": "채소",
        "해조류": "채소",
        "김치류": "채소",
        "나물·숙채류": "채소",
        "생채·무침류": "채소",
        "장아찌·절임류": "채소",
        "젓갈류": "채소",

        # 간식
        "빵 및 과자류": "간식",
        "유제품류 및 빙과류": "간식",
        "음료 및 차류": "간식",
        
        # 기타
        "곡류": "기타",
        "어패류": "기타",
        "난류": "기타",
        "장류": "기타",
        "조미료류": "기타",
        "향신료류": "기타",
        "당류": "기타",
        "기타": "기타",
        "해당없음": "기타",
    }

    def add_arguments(self, parser):
        parser.add_argument(
            '--start-page',
            type=int,
            default=1,
            help='시작 페이지 번호 (기본값: 1)'
        )
        parser.add_argument(
            '--max-items',
            type=int,
            default=1000,
            help='최대 가져올 항목 수 (기본값: 1000)'
        )
        parser.add_argument(
            '--category-filter',
            type=str,
            help='특정 FOOD_CAT1_NM 카테고리만 가져오기 (예: 곡류)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='기존 Food 데이터를 삭제하고 새로 생성',
        )
        parser.add_argument(
            '--debug',
            action='store_true',
            help='디버그 모드 (응답 구조 출력)',
        )
        parser.add_argument(
            '--analyze-categories',
            action='store_true',
            help='API 데이터의 FOOD_CAT1_NM 분포 분석',
        )
        parser.add_argument(
            '--collect-by-category',
            action='store_true',
            help='카테고리별로 순차 수집',
        )

    def handle(self, *args, **options):
        if not self.SERVICE_KEY:
            self.stdout.write(
                self.style.ERROR("API 키가 설정되지 않았습니다. FOOD_SAFETY_API_KEY 환경변수를 설정해주세요.")
            )
            return
        
        # --clear 옵션 처리
        if options['clear']:
            self.stdout.write(self.style.WARNING("기존 Food 데이터를 삭제합니다..."))
            Food.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("기존 데이터 삭제 완료"))
        
        # 카테고리 분석 모드
        if options.get('analyze_categories'):
            self._analyze_api_categories()
            return
            
        # 카테고리별 수집 모드
        if options.get('collect_by_category'):
            self._collect_by_category(options)
            return
        
        # 기존 방식 수집
        start_page = options['start_page']
        max_items = options['max_items']
        category_filter = options.get('category_filter')
        debug_mode = options.get('debug', False)
        
        self.stdout.write(
            self.style.SUCCESS(f"식품 데이터 수집 시작 (시작 페이지: {start_page}, 최대 항목: {max_items}개)")
        )
        
        self._create_default_categories()
        self._collect_data(start_page, max_items, category_filter, debug_mode)

    def _analyze_api_categories(self):
        """API 데이터의 FOOD_CAT1_NM 분포 분석"""
        self.stdout.write(self.style.SUCCESS("API FOOD_CAT1_NM 분포 분석 시작..."))
        
        category_counts = {}
        
        for page in range(1, 21):
            self.stdout.write(f"페이지 {page} 분석 중...")
            data = self._fetch_food_data(page, 100, debug_mode=False)
            if not data:
                break
                
            for item in data:
                # FOOD_CAT1_NM만 분석 (식품대분류명)
                field_value = item.get('FOOD_CAT1_NM')
                if field_value is not None:
                    cat_value = str(field_value).strip()
                    if cat_value:
                        if cat_value not in category_counts:
                            category_counts[cat_value] = 0
                        category_counts[cat_value] += 1
        
        # 결과 출력
        self.stdout.write("\n=== FOOD_CAT1_NM (식품대분류) 분포 ===")
        if not category_counts:
            self.stdout.write("카테고리 데이터를 찾을 수 없습니다.")
            return
        
        total_items = sum(category_counts.values())
        for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
            mapped = self.CATEGORY_MAPPING.get(cat, "❌ 매핑없음")
            percentage = (count / total_items) * 100
            self.stdout.write(f"{cat}: {count}개 ({percentage:.1f}%) -> {mapped}")
        
        # 추천 시스템 필수 카테고리 분석
        self.stdout.write(f"\n=== 추천 시스템 필수 카테고리 매핑 현황 ===")
        essential_categories = ["과일", "채소", "유제품", "탄수화물", "단백질", "지방"]
        
        for target_cat in essential_categories:
            mapped_sources = [k for k, v in self.CATEGORY_MAPPING.items() if v == target_cat]
            source_counts = sum(category_counts.get(source, 0) for source in mapped_sources)
            self.stdout.write(f"✅ {target_cat}: {source_counts}개 (출처: {mapped_sources})")

    def _collect_by_category(self, options):
        """target_calories 기반 동적 데이터 수집"""
        # 기본 수집량
        base_amounts = {
            "단백질": 250,
            "탄수화물": 300,
            "지방": 200,
            "과일": 200,
            "유제품": 150,
            "채소": 200,
        }
        
        # 사용자 평균 목표 칼로리에 따른 동적 조정
        try:
            from users.models import UserProfile
            avg_target_calories = UserProfile.objects.filter(
                target_calories__gt=0
            ).aggregate(
                avg_calories=models.Avg('target_calories')
            )['avg_calories'] or 2000
            
            # 평균 목표 칼로리가 높으면 더 많은 데이터 수집
            multiplier = min(avg_target_calories / 2000, 2.0)  # 최대 2배
            
            for category in base_amounts:
                base_amounts[category] = int(base_amounts[category] * multiplier)
                
            logger.info(f"평균 목표 칼로리: {avg_target_calories:.0f}kcal, 수집량 배수: {multiplier:.2f}")         
        except Exception as e:
            logger.warning(f"동적 수집량 계산 실패, 기본값 사용: {e}")

        self.stdout.write(self.style.SUCCESS("카테고리별 순차 수집 시작..."))
        self._create_default_categories()
        
        # 프로세스 요구사항에 따른 우선순위 카테고리
        priority_categories = [
            # 단백질 카테고리 
            ("육류", "단백질", 250),
            ("수·조·어·육류", "단백질", 150),        
            ("구이류", "단백질", 250),

            # 탄수화물 카테고리
            ("면 및 만두류", "탄수화물", 200),
            ("밥류", "탄수화물", 250),
            ("면 및 만두류", "탄수화물", 200),
            ("국 및 탕류", "탄수화물", 200),
            ("찜류", "탄수화물", 200),
            ("떡류", "탄수화물", 150),
            ("부침류", "탄수화물", 150),
            ("죽 및 스프류", "탄수화물", 150),
            ("찌개 및 전골류", "탄수화물", 200),

            # 지방 카테고리
            ("견과 및 종실류", "지방", 200),
            ("튀김류", "지방", 150),
            ("볶음류", "지방", 200),
            
            # 과일 카테고리
            ("과일류", "과일", 200),
            
            # 유제품 카테고리
            ("유가공품류", "유제품", 150),
            ("유제품류", "유제품", 150),
            
            # 채소 카테고리
            ("채소류", "채소", 200),
            ("김치류", "채소", 150),
            ("나물·숙채류", "채소", 200),
            ("생채·무침류", "채소", 200),
            ("장아찌·절임류", "채소", 150),
        ]
        total_collected = 0
        
        for api_category, target_category, max_items in priority_categories:
            self.stdout.write(f"\n=== {api_category} -> {target_category} 수집 시작 (최대 {max_items}개) ===")
            
            try:
                collected = self._collect_specific_category(api_category, max_items)
                total_collected += collected
                self.stdout.write(self.style.SUCCESS(f"✅ {api_category}: {collected}개 수집 완료"))
            
                # API 호출 제한 방지
                time.sleep(1)
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ {api_category} 수집 실패: {e}"))
                continue
        
        self.stdout.write(self.style.SUCCESS(f"\n총 {total_collected}개 음식 데이터 수집 완료"))

    def _collect_specific_category(self, food_cat1_nm, max_items):
        """특정 FOOD_CAT1_NM 카테고리의 데이터 수집"""
        collected_count = 0
        current_page = 1
        
        while collected_count < max_items:
            remaining_items = max_items - collected_count
            current_batch_size = min(self.BATCH_SIZE, remaining_items)
            
            # API 호출 - FOOD_CAT1_NM 필터 사용
            data = self._fetch_food_data(
                current_page,
                current_batch_size,
                category_filter=food_cat1_nm,
                debug_mode=False
            )
            
            if not data:
                break
            
            # 데이터 처리
            batch_created, batch_updated = self._process_food_data(data)
            collected_count += len(data)
            current_page += 1
            
            self.stdout.write(f"  페이지 {current_page-1}: {len(data)}개 (생성: {batch_created}, 업데이트: {batch_updated})")
            
            # API 호출 제한을 위한 딜레이
            time.sleep(self.REQUEST_DELAY)
            
            # 배치 크기보다 적게 받았으면 마지막 페이지
            if len(data) < current_batch_size:
                break
        
        return collected_count

    def _collect_data(self, start_page, max_items, category_filter, debug_mode):
        """기존 방식 데이터 수집"""
        total_processed = 0
        total_created = 0
        total_updated = 0
        current_page = start_page
        
        try:
            while total_processed < max_items:
                remaining_items = max_items - total_processed
                current_batch_size = min(self.BATCH_SIZE, remaining_items)
                
                data = self._fetch_food_data(current_page, current_batch_size, category_filter, debug_mode)
                
                if not data:
                    self.stdout.write("더 이상 가져올 데이터가 없습니다.")
                    break
                
                batch_created, batch_updated = self._process_food_data(data)
                
                total_processed += len(data)
                total_created += batch_created
                total_updated += batch_updated
                current_page += 1
                
                self.stdout.write(
                    f"페이지 {current_page-1} 처리 완료: {len(data)}개 (생성: {batch_created}, 업데이트: {batch_updated})"
                )
                
                time.sleep(self.REQUEST_DELAY)
                
                if len(data) < current_batch_size:
                    self.stdout.write("마지막 페이지에 도달했습니다.")
                    break
                    
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("사용자에 의해 중단되었습니다."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"오류 발생: {e}"))
            logger.error(f"데이터 수집 오류: {e}")
            
        finally:
            self.stdout.write(
                self.style.SUCCESS(
                    f"수집 완료 - 처리: {total_processed}개, 생성: {total_created}개, 업데이트: {total_updated}개"
                )
            )

    def _parse_food_item(self, item):
        """API 응답 항목을 Food 모델 데이터로 변환 - FOOD_CAT1_NM만 사용"""
        try:
            # 안전한 문자열 추출 함수
            def safe_get_string(item, key):
                value = item.get(key)
                return str(value).strip() if value is not None else ""
            
            name = safe_get_string(item, 'FOOD_NM_KR')
            if not name:
                return None
            
            # 설명 생성
            food_code = safe_get_string(item, 'FOOD_CD')
            research_date = safe_get_string(item, 'RESEARCH_YMD')
            
            description_parts = []
            if food_code:
                description_parts.append(f"식품코드: {food_code}")
            if research_date:
                description_parts.append(f"조사일자: {research_date}")
            
            description = ", ".join(description_parts) if description_parts else "식품의약품안전처 영양성분 DB"
            
            # 영양성분 파싱
            calories = self._safe_decimal(item.get('AMT_NUM1', '0'))  # 에너지(kcal)
            protein = self._safe_decimal(item.get('AMT_NUM3', '0'))   # 단백질(g)
            fat = self._safe_decimal(item.get('AMT_NUM4', '0'))       # 지방(g)
            carbs = self._safe_decimal(item.get('AMT_NUM6', '0'))     # 탄수화물(g)
            
            # 서빙 사이즈 처리
            serving_size = safe_get_string(item, 'SERVING_SIZE')
            if not serving_size:
                serving_size = '100g'
            else:
                if re.match(r'^\d+(\.\d+)?$', serving_size):
                    serving_size += 'g'
                serving_size = re.sub(r'[^\d가-힣a-zA-Z.]', '', serving_size)
                if not serving_size:
                    serving_size = '100g'
            
            # 프로세스 요구사항: FOOD_CAT1_NM만 사용한 카테고리 매핑
            category = None
            debug_mode = getattr(self, 'debug_mode', False)
            
            # FOOD_CAT1_NM 기준 매핑 (식품대분류명)
            food_cat1 = safe_get_string(item, 'FOOD_CAT1_NM')
            if food_cat1 and food_cat1 in self.CATEGORY_MAPPING:
                category_name = self.CATEGORY_MAPPING[food_cat1]
                try:
                    category = FoodCategory.objects.get(name=category_name)
                    if debug_mode:
                        print(f"DEBUG: {name} -> {food_cat1} -> {category_name}")
                except FoodCategory.DoesNotExist:
                    category = FoodCategory.objects.create(
                        name=category_name,
                        is_active=True,
                        description=f"{category_name} 카테고리"
                    )
            
            # 기본 카테고리 할당 (FOOD_CAT1_NM 매핑 실패시)
            if not category:
                try:
                    category = FoodCategory.objects.get(name='기타')
                except FoodCategory.DoesNotExist:
                    category = FoodCategory.objects.create(
                        name='기타',
                        is_active=True,
                        description='기타 카테고리'
                    )
            
            return {
                "name": name,
                "description": description,
                "calories": calories,
                "protein": protein,
                "carbs": carbs,
                "fat": fat,
                "serving_size": serving_size,
                "category": category,
            }
            
        except Exception as e:
            logger.error(f"식품 항목 파싱 오류: {e}, 항목: {item}")
            return None

    def _fetch_food_data(self, page_no, num_of_rows, category_filter=None, debug_mode=False):
        """API에서 식품 데이터 가져오기"""
        params = {
            "serviceKey": self.SERVICE_KEY,
            "pageNo": page_no,
            "numOfRows": num_of_rows,
            "type": self.DATA_TYPE,
        }
        
        # FOOD_CAT1_NM 필터 추가
        if category_filter:
            params["FOOD_CAT1_NM"] = category_filter
        
        if debug_mode:
            self.stdout.write(f"API 요청 URL: {self.API_BASE_URL}")
            self.stdout.write(f"파라미터: {params}")
        
        try:
            response = requests.get(self.API_BASE_URL, params=params, timeout=30)
            response.raise_for_status()
            
            json_data = response.json()
            
            # 헤더 확인
            header = json_data.get('header', {})
            result_code = header.get('resultCode', '')
            
            if result_code != '00':
                result_msg = header.get('resultMsg', '알 수 없는 오류')
                self.stdout.write(
                    self.style.WARNING(f"API 오류 (코드: {result_code}): {result_msg}")
                )
                return []
            
            # body.items에서 데이터 추출
            body = json_data.get('body', {})
            items = body.get('items', [])
            
            if isinstance(items, list):
                return items
            elif isinstance(items, dict) and 'item' in items:
                item_data = items['item']
                if isinstance(item_data, list):
                    return item_data
                elif isinstance(item_data, dict):
                    return [item_data]
                else:
                    return []
            else:
                return []
                
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f"API 호출 실패: {e}"))
            return []
        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f"JSON 파싱 실패: {e}"))
            return []
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"예상하지 못한 오류: {e}"))
            return []

    @transaction.atomic
    def _process_food_data(self, food_items):
        """식품 데이터를 Food 모델에 저장"""
        created_count = 0
        updated_count = 0
        
        for item in food_items:
            try:
                food_data = self._parse_food_item(item)
                if not food_data:
                    continue
                
                food, created = Food.objects.update_or_create(
                    name=food_data['name'],
                    defaults={
                        "description": food_data['description'],
                        "calories": food_data['calories'],
                        "protein": food_data['protein'],
                        "carbs": food_data['carbs'],
                        "fat": food_data['fat'],
                        "serving_size": food_data['serving_size'],
                        "category": food_data.get('category'),
                        "is_public_data": True,
                        "user": None,
                        "product": None,
                    }
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f"✓ 생성: {food_data['name']}"))
                else:
                    updated_count += 1
                    self.stdout.write(f"↻ 업데이트: {food_data['name']}")
                    
            except Exception as e:
                food_name = item.get('FOOD_NM_KR', '알 수 없음')
                self.stdout.write(
                    self.style.ERROR(f"✗ '{food_name}' 처리 실패: {e}")
                )
                logger.error(f"식품 처리 오류: {e}, 항목: {item}")
                continue
        
        return created_count, updated_count

    def _safe_decimal(self, value):
        """안전한 Decimal 변환 함수"""
        if value is None or value in ('-', '', 'N/A', 'null', 'None'):
            return Decimal('0')
        
        try:
            if isinstance(value, str):
                cleaned_value = re.sub(r'[^\d.-]', '', value)
                if not cleaned_value or cleaned_value in ('-', '.', '--'):
                    return Decimal('0')
                if cleaned_value.count('.') > 1:
                    parts = cleaned_value.split('.')
                    cleaned_value = parts[0] + '.' + ''.join(parts[1:])
                value = cleaned_value
            
            dec_value = Decimal(str(value))
            return dec_value if dec_value >= 0 else Decimal('0')
            
        except (InvalidOperation, ValueError, TypeError):
            return Decimal('0')

    def _create_default_categories(self):
        """Food 모델에 필요한 기본 FoodCategory 생성"""
        default_categories = [
            {"name": "탄수화물", "description": "곡류, 감자류, 당류 등"},
            {"name": "단백질", "description": "육류, 어패류, 두류, 난류 등"},
            {"name": "지방", "description": "유지류, 견과류 등"},
            {"name": "채소", "description": "채소류, 버섯류, 해조류 등"},
            {"name": "과일", "description": "과실류 등"},
            {"name": "유제품", "description": "우유류, 치즈류 등"},
            {"name": "간식", "description": "빵·과자류, 음료 등 간식용 식품"},
            {"name": "기타", "description": "조미료류, 복합 요리 등"},
        ]
        
        for cat in default_categories:
            category, created = FoodCategory.objects.get_or_create(
                name=cat["name"],
                defaults={
                    "is_active": True,
                    "description": cat["description"]
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"FoodCategory 생성: {cat['name']}"))
            else:
                if not category.is_active:
                    category.is_active = True
                    category.save()
                    self.stdout.write(self.style.WARNING(f"FoodCategory 활성화: {cat['name']}"))
        
        self.stdout.write(self.style.SUCCESS("기본 FoodCategory 생성 완료"))
