# 🔥Fithub Django 초기 세팅

## 1. anaconda 가상환경 설정

- 가상환경 생성
```bash
conda create -n fithub python=3.12
```

- 가상환경 활성화
```bash
conda activate fithub
```

- 가상환경 확인
```bash
conda info --envs
```

## 2. 설치한 라이브러리 & 패키지 버전 목록

```bash
Python == 3.12
DRF == 25.1.1
dj-rest-auth == 7.0.1
django-allauth == 65.8.1
djangi-filter == 25.1
djangorestframework-simplejwt == 5.5.0
requests == 2.32.3
python-decouple == 3.8
djoser == 2.3.1
django-cors-headers == 4.7.0
```

## 3. 마이그레이션

```bash
# 기존 마이그레이션 파일 삭제 (필요시)
python manage.py makemigrations users --empty

# 새로운 마이그레이션 생성
python manage.py makemigrations

# 마이그레이션 적용
python manage.py migrate

# 슈퍼유저 생성
python manage.py createsuperuser
```

## 4. Command 사용

- seed를 생성하면 반드시 admin 계정으로 조회해 주세요.

```bash
# db clear(확인 메세지 표시 x)
python manage.py flush --noinput

# seed 생성
python manage.py categories_seed --clear
python manage.py products_seed --with-images
python manage.py foods_seed --clear
python manage.py mealplan_seed --clear

# 식품의약품안전처_식품영양성분DB정보 가져오기
python manage.py load_food_data --clear --collect-by-category
python manage.py load_food_data --debug --max-items 5 # 디버그 모드로 테스트 (5개만 가져오기)

# 옵션
--clear: 기존 데이터를 삭제
--noinput: 확인(경고) 메세지 표시하지 않기
--max-items 1000: 최대 수집할 항목 수 설정
--start-page 1: 시작 페이지 설정  
--collect-by-category:  카테고리별 균형잡힌 수집 (추천)
--category-filter "과일류": 특정 카테고리만 수집
--debug: 디버그 모드
--analyze-categories: API 카테고리 분포 분석
```

## 5. load_food_data 사용법

### 1. 기본 환경 설정
- 환경변수 설정 (.env 파일, settings.py)
```bash
# .env 파일에 추가
# https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15127578#/API%20%EB%AA%A9%EB%A1%9D/getFoodNtrCpntDbInq02
FOOD_SAFETY_API_KEY={공공데이터_포털_api_key}

# settings.py에 추가
# recommedation_lp.py 설정값
DIET_SAMPLE_SIZE_PER_CATEGORY = 15
DIET_RECENT_DAYS = 7
DIET_FREQUENT_THRESHOLD = 3
```
---

### 2. 권장 실행 순서

- Step 1: API 카테고리 분석
```bash
# API에서 제공하는 카테고리 분포 확인
python manage.py load_food_data --analyze-categories
```

- Step 2: 전체 데이터 수집
```bash
# 기존 데이터 삭제 후 카테고리별 균형잡힌 수집
python manage.py load_food_data --clear --collect-by-category
```

- Step 3: 추가 데이터 수집 (필요시 실행)
```bash
# 특정 카테고리만 추가 수집
python manage.py load_food_data --category-filter "과일류" --max-items 200
python manage.py load_food_data --category-filter "유제품" --max-items 500

# 또는 전체에서 추가 수집
python manage.py load_food_data --max-items 2000 --start-page 1
```
---

### 3. 상황별 최적 명령어

#### 🚀 처음 설정하는 경우 (권장)
```bash
# 1단계: 카테고리 분석
python manage.py load_food_data --analyze-categories

# 2단계: 전체 데이터 수집
python manage.py load_food_data --clear --collect-by-category

# 3단계: 결과 확인
python manage.py shell
>>> from diet.models import Food, FoodCategory
>>> for cat in FoodCategory.objects.all():
...     print(f"{cat.name}: {cat.foods.filter(is_public_data=True).count()}개")
```

#### 🔄 데이터 업데이트하는 경우
```bash
# 기존 데이터 유지하면서 추가 수집
python manage.py load_food_data --collect-by-category --max-items 1000
```

#### 🎯 특정 카테고리 보강하는 경우
```bash
# 단백질 카테고리 보강
python manage.py load_food_data --category-filter "육류" --max-items 300
python manage.py load_food_data --category-filter "어패류" --max-items 200

# 과일 카테고리 보강
python manage.py load_food_data --category-filter "과일류" --max-items 250
```

#### 🐛 디버깅하는 경우
```bash
# 소량 데이터로 테스트
python manage.py load_food_data --debug --max-items 50 --category-filter "과일류"
```
---

### 4. 고급 사용법

#### 대용량 데이터 수집
```bash
# 대용량 수집 (시간이 오래 걸림)
python manage.py load_food_data --clear --max-items 10000 --start-page 1

# 백그라운드 실행
nohup python manage.py load_food_data --clear --collect-by-category > food_data.log 2>&1 &
```

#### 배치 작업으로 실행
```bash
#!/bin/bash
# food_data_setup.sh

echo "=== 식품 데이터 수집 시작 ==="

# 1. 카테고리 분석
echo "1. API 카테고리 분석 중..."
python manage.py load_food_data --analyze-categories

# 2. 데이터 수집
echo "2. 전체 데이터 수집 중..."
python manage.py load_food_data --clear --collect-by-category

# 3. 결과 확인
echo "3. 수집 결과 확인..."
python manage.py shell -c "
from diet.models import Food, FoodCategory
total = Food.objects.filter(is_public_data=True).count()
print(f'총 {total}개 음식 데이터 수집 완료')
for cat in FoodCategory.objects.all():
    count = cat.foods.filter(is_public_data=True).count()
    print(f'{cat.name}: {count}개')
"

echo "=== 식품 데이터 수집 완료 ==="
```
---

### 5. 스케줄

#### 초기 설정
```bash
# 한 번만 실행
python manage.py load_food_data --clear --collect-by-category
```

#### 정기 업데이트 (월 1회)
```bash
# 크론탭 등록
0 2 1 * * /path/to/python /path/to/manage.py load_food_data --collect-by-category --max-items 500
```