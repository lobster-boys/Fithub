from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Challenge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    target_value = models.PositiveIntegerField()
    status = models.CharField(max_length=10, default="ongoing")
    # …


class UserLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    value = models.IntegerField()
