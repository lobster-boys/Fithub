# Generated by Django 5.2.1 on 2025-06-09 06:53

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('challenge_checker', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='challenge',
            name='points',
            field=models.PositiveIntegerField(default=0, help_text='달성 시 지급할 포인트'),
        ),
        migrations.AddField(
            model_name='challenge',
            name='points_awarded',
            field=models.BooleanField(default=False, help_text='포인트 지급 완료 여부'),
        ),
        migrations.CreateModel(
            name='PointTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('points', models.IntegerField(help_text='증감된 포인트')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('challenge', models.ForeignKey(blank=True, help_text='발생 원인이 된 챌린지', null=True, on_delete=django.db.models.deletion.SET_NULL, to='challenge_checker.challenge')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
    ]
