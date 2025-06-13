from django.db import transaction
from django.db.models import Sum, F
from challenge_checker.models import Challenge, UserLog, PointTransaction
from django.apps import apps
from django.utils import timezone
from celery import shared_task

Profile = apps.get_model("accounts", "Profile")


@shared_task
def check_goals():
    today = timezone.localdate()
    due = Challenge.objects.filter(
        end_date__lte=today, status="ongoing", points_awarded=False
    )
    for ch in due:
        total = (
            UserLog.objects.filter(
                user=ch.user, date__range=(ch.start_date, ch.end_date)
            ).aggregate(sum_value=Sum("value"))["sum_value"]
            or 0
        )
        with transaction.atomic():
            if total >= ch.target_value:
                ch.status = "achieved"
                # 1) 누적
                Profile.objects.filter(user=ch.user).update(
                    points=F("points") + ch.points
                )
                # 2) 기록
                PointTransaction.objects.create(
                    user=ch.user, challenge=ch, points=ch.points
                )
                # 3) 중복 방지
                ch.points_awarded = True
            else:
                ch.status = "failed"
            ch.save()
    return f"Processed {due.count()} challenges."
