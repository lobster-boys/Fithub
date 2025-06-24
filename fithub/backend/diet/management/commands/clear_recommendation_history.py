from django.core.management.base import BaseCommand
from diet.models import RecommendHistory
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = '특정 또는 모든 사용자의 식단 추천 기록을 삭제합니다.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            help='기록을 삭제할 특정 사용자의 username',
            default=None
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='모든 사용자의 추천 기록을 삭제합니다.'
        )

    def handle(self, *args, **options):
        username = options['username']
        clear_all = options['all']

        if not username and not clear_all:
            self.stdout.write(self.style.ERROR('username 또는 --all 옵션 중 하나를 반드시 지정해야 합니다.'))
            return

        if username and clear_all:
            self.stdout.write(self.style.ERROR('username과 --all 옵션을 동시에 사용할 수 없습니다.'))
            return
            
        if clear_all:
            count, _ = RecommendHistory.objects.all().delete()
            self.stdout.write(self.style.SUCCESS(f'모든 사용자의 추천 기록 {count}개를 성공적으로 삭제했습니다.'))
        
        if username:
            User = get_user_model()
            try:
                user = User.objects.get(username=username)
                count, _ = RecommendHistory.objects.filter(user=user).delete()
                self.stdout.write(self.style.SUCCESS(f"사용자 '{username}'의 추천 기록 {count}개를 성공적으로 삭제했습니다."))
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"사용자 '{username}'을(를) 찾을 수 없습니다.")) 