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
python manage.py load_food_data --category-filter "과일류"
python manage.py load_food_data --category-filter "유제품류"

# 옵션
--clear: 기존 데이터를 삭제
--noinput: 확인(경고) 메세지 표시하지 않기
--max-items 1000: 최대 수집할 항목 수 설정
--start-page 1: 시작 페이지 설정  
--collect-by-category:  카테고리별 균형잡힌 수집 (추천)
--category-filter "과일류": 특정 카테고리만 수집
--debug: 디버그 모드
--analyze-categories: API 카테고리 분포 분석

# load_food_data 실행 순서
# 1단계: 카테고리 분석 (선택사항)
python manage.py load_food_data --analyze-categories

# 2단계: 전체 데이터 수집 (필수)
python manage.py load_food_data --clear --collect-by-category

# 3단계: 추천 시스템 테스트
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/diet/recommend/
```



## Food Recommend 라이브러리

```bash
pip install pulp==3.2.1
```