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

# 식품의약품안전처_식품영양정보에서 카테고리 분석
python manage.py load_food_data --analyze-categories # FOOD_CAT1_NM만
python manage.py load_food_data --collect-by-category --clear
python manage.py load_food_data --category-filter "과일류" --max-items 200 # 특정 카테고리 가져오기
python manage.py load_food_data --category-filter "밥류" --max-items 200
python manage.py load_food_data --category-filter "육류" --max-items 200
python manage.py load_food_data --category-filter "채소류" --max-items 200
python manage.py load_food_data --category-filter "나물·숙채류" --max-items 200
python manage.py load_food_data --category-filter "빵 및 과자류" --max-items 200
python manage.py load_food_data --category-filter "유제품류 및 빙과류" --max-items 200

# 카테고리를 FOOD_CAT1_NM 파라미터에 담고, 500개씩 가져오는 로직으로 변경해야 함

# 식품의약품안전처_식품영양성분DB정보 가져오기
python manage.py load_food_data --clear --max-items 5000
python manage.py load_food_data --debug --max-items 5 # 디버그 모드로 테스트 (5개만 가져오기)

# 옵션
--clear: 기존 데이터를 삭제
--noinput: 확인(경고) 메세지 표시하지 않기
```

## Food Recommend 라이브러리

```bash
pip install pulp==3.2.1
```