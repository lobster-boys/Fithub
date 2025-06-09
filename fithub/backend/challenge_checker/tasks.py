from celery import shared_task
from django.utils import timezone
from challenge_checker.models import Challenge, UserLog  # 실제 모델명 확인
from django.db.models import Sum


@shared_task
def check_goals():
    today = timezone.localdate()
    ongoing = Challenge.objects.filter(end_date__lte=today, status="ongoing")
    for ch in ongoing:
        total = (
            UserLog.objects.filter(
                user=ch.user, date__range=(ch.start_date, ch.end_date)
            ).aggregate(sum_value=sum("value"))["sum_value"]
            or 0
        )
        ch.status = "achieved" if total >= ch.target_value else "failed"
        ch.save()
    return f"Checked {ongoing.count()} challenges."
