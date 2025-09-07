from django.apps import AppConfig


class OnboardingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "onboarding"
    verbose_name = "온보딩"
    
    def ready(self):
        # signals 등록 (필요한 경우)
        try:
            import onboarding.signals  # noqa F401
        except ImportError:
            pass
