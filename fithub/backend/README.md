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

```bash
# db clear(확인 메세지 표시 x)
python manage.py flush --noinput

# seed 생성
python manage.py categories_seed
python manage.py products_seed --with-images
python manage.py foods_seed
python manage.py mealplan_seed

# 옵션
--clear: 기존 데이터를 삭제
```