# Generated manually for onboarding

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='OnboardingData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fitness_level', models.CharField(choices=[('beginner', '초급'), ('intermediate', '중급'), ('advanced', '고급')], max_length=20, verbose_name='피트니스 레벨')),
                ('height', models.PositiveIntegerField(validators=[django.core.validators.MinValueValidator(100), django.core.validators.MaxValueValidator(250)], verbose_name='키 (cm)')),
                ('weight', models.DecimalField(decimal_places=1, max_digits=5, validators=[django.core.validators.MinValueValidator(30.0), django.core.validators.MaxValueValidator(300.0)], verbose_name='몸무게 (kg)')),
                ('age', models.PositiveIntegerField(validators=[django.core.validators.MinValueValidator(10), django.core.validators.MaxValueValidator(120)], verbose_name='나이')),
                ('goals', models.JSONField(default=list, help_text='선택된 목표들의 배열', verbose_name='운동 목표')),
                ('methods', models.JSONField(default=list, help_text='선호하는 운동 방법들의 배열', verbose_name='운동 방법')),
                ('equipment', models.JSONField(default=list, help_text='사용 가능한 장비들의 배열', verbose_name='사용 가능한 장비')),
                ('completed', models.BooleanField(default=False, verbose_name='완료 여부')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='생성일')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='수정일')),
                ('completed_at', models.DateTimeField(blank=True, null=True, verbose_name='완료일')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='onboarding_data', to=settings.AUTH_USER_MODEL, verbose_name='사용자')),
            ],
            options={
                'verbose_name': '온보딩 데이터',
                'verbose_name_plural': '온보딩 데이터',
                'db_table': 'onboarding_data',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='OnboardingHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('previous_data', models.JSONField(help_text='수정 전 온보딩 데이터', verbose_name='이전 데이터')),
                ('new_data', models.JSONField(help_text='수정 후 온보딩 데이터', verbose_name='새 데이터')),
                ('change_reason', models.CharField(blank=True, max_length=200, verbose_name='변경 사유')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='변경일')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='onboarding_history', to=settings.AUTH_USER_MODEL, verbose_name='사용자')),
            ],
            options={
                'verbose_name': '온보딩 변경 이력',
                'verbose_name_plural': '온보딩 변경 이력',
                'db_table': 'onboarding_history',
                'ordering': ['-created_at'],
            },
        ),
    ] 