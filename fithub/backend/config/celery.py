import os
from celery import Celery
from celery.schedules import crontab

# Django 설정 모듈 지정
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("config")

# settings.py 안의 CELERY_* 설정을 불러옵니다.
app.config_from_object("django.conf:settings", namespace="CELERY")

# INSTALLED_APPS 내 모든 tasks.py를 자동으로 검색
app.autodiscover_tasks()

# (선택) 스케줄 등록: 매일 새벽 1시에 check_goals 태스크 실행
app.conf.beat_schedule = {
    "check-goals-every-day-1am": {
        "task": "challenge_checker.tasks.check_goals",
        "schedule": crontab(hour=1, minute=0),
    },
}
