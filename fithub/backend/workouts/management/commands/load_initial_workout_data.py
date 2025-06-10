from django.core.management.base import BaseCommand
from workouts.models import Exercise, WorkoutType


class Command(BaseCommand):
    help = '초기 운동 데이터와 운동 타입을 생성합니다'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('초기 운동 데이터 로딩 시작...'))
        
        # 운동 타입 생성
        workout_types = [
            {
                'name': 'strength',
                'description': '근력 운동',
                'color_code': '#FF6B6B',
                'icon': 'fas fa-dumbbell'
            },
            {
                'name': 'cardio',
                'description': '유산소 운동',
                'color_code': '#4ECDC4',
                'icon': 'fas fa-running'
            },
            {
                'name': 'flexibility',
                'description': '스트레칭 및 유연성',
                'color_code': '#45B7D1',
                'icon': 'fas fa-leaf'
            },
            {
                'name': 'functional',
                'description': '기능성 운동',
                'color_code': '#96CEB4',
                'icon': 'fas fa-arrows-alt'
            },
            {
                'name': 'sports',
                'description': '스포츠 운동',
                'color_code': '#FECA57',
                'icon': 'fas fa-futbol'
            }
        ]
        
        for type_data in workout_types:
            workout_type, created = WorkoutType.objects.get_or_create(
                name=type_data['name'],
                defaults=type_data
            )
            if created:
                self.stdout.write(f'운동 타입 생성: {workout_type.description}')
        
        # 운동 종목 데이터 생성
        exercises = [
            # 상체 근력 운동
            {
                'name': '벤치 프레스',
                'description': '가슴 근육을 강화하는 대표적인 운동',
                'muscle_group': 'chest',
                'difficulty': 'intermediate',
                'equipment_needed': 'barbell',
                'instructions': '바벨을 가슴 위로 들어올리고 천천히 내리는 동작을 반복합니다.',
                'estimated_calories_per_minute': 8
            },
            {
                'name': '덤벨 숄더 프레스',
                'description': '어깨 근육을 강화하는 운동',
                'muscle_group': 'shoulders',
                'difficulty': 'beginner',
                'equipment_needed': 'dumbbells',
                'instructions': '덤벨을 어깨 높이에서 머리 위로 밀어올리는 동작입니다.',
                'estimated_calories_per_minute': 6
            },
            {
                'name': '랫 풀다운',
                'description': '등 근육을 강화하는 운동',
                'muscle_group': 'back',
                'difficulty': 'beginner',
                'equipment_needed': 'cable machine',
                'instructions': '케이블 머신을 이용해 바를 가슴 쪽으로 당기는 동작입니다.',
                'estimated_calories_per_minute': 7
            },
            {
                'name': '바이셉 컬',
                'description': '팔 앞쪽 근육(이두근)을 강화하는 운동',
                'muscle_group': 'arms',
                'difficulty': 'beginner',
                'equipment_needed': 'dumbbells',
                'instructions': '덤벨을 들고 팔꿈치를 고정한 채 팔을 구부리는 동작입니다.',
                'estimated_calories_per_minute': 5
            },
            {
                'name': '트라이셉 딥스',
                'description': '팔 뒤쪽 근육(삼두근)을 강화하는 운동',
                'muscle_group': 'arms',
                'difficulty': 'intermediate',
                'equipment_needed': 'dip bars',
                'instructions': '딥 바에 매달려 몸을 위아래로 움직이는 동작입니다.',
                'estimated_calories_per_minute': 8
            },
            
            # 하체 근력 운동
            {
                'name': '스쿼트',
                'description': '하체 전체 근육을 강화하는 기본 운동',
                'muscle_group': 'legs',
                'difficulty': 'beginner',
                'equipment_needed': 'none',
                'instructions': '발을 어깨너비로 벌리고 무릎을 구부려 앉았다 일어나는 동작입니다.',
                'estimated_calories_per_minute': 9
            },
            {
                'name': '레그 프레스',
                'description': '하체 근육을 안전하게 강화하는 머신 운동',
                'muscle_group': 'legs',
                'difficulty': 'beginner',
                'equipment_needed': 'leg press machine',
                'instructions': '레그 프레스 머신에서 다리로 무게를 밀어내는 동작입니다.',
                'estimated_calories_per_minute': 8
            },
            {
                'name': '레그 익스텐션',
                'description': '허벅지 앞쪽 근육(대퇴사두근)을 집중 강화하는 운동',
                'muscle_group': 'legs',
                'difficulty': 'beginner',
                'equipment_needed': 'leg extension machine',
                'instructions': '앉은 상태에서 다리를 펴는 동작으로 허벅지 앞쪽을 강화합니다.',
                'estimated_calories_per_minute': 6
            },
            {
                'name': '레그 컬',
                'description': '허벅지 뒤쪽 근육(햄스트링)을 강화하는 운동',
                'muscle_group': 'legs',
                'difficulty': 'beginner',
                'equipment_needed': 'leg curl machine',
                'instructions': '엎드린 상태에서 다리를 구부리는 동작으로 햄스트링을 강화합니다.',
                'estimated_calories_per_minute': 6
            },
            {
                'name': '칼프 레이즈',
                'description': '종아리 근육을 강화하는 운동',
                'muscle_group': 'calves',
                'difficulty': 'beginner',
                'equipment_needed': 'none',
                'instructions': '발끝으로 서서 종아리를 수축시키는 동작입니다.',
                'estimated_calories_per_minute': 4
            },
            
            # 코어 운동
            {
                'name': '플랭크',
                'description': '코어 근육을 강화하는 정적 운동',
                'muscle_group': 'core',
                'difficulty': 'beginner',
                'equipment_needed': 'none',
                'instructions': '팔꿈치로 지탱하며 몸을 일직선으로 유지하는 동작입니다.',
                'estimated_calories_per_minute': 5
            },
            {
                'name': '크런치',
                'description': '복부 근육을 강화하는 기본 운동',
                'muscle_group': 'core',
                'difficulty': 'beginner',
                'equipment_needed': 'none',
                'instructions': '누운 상태에서 상체를 들어올리는 복근 운동입니다.',
                'estimated_calories_per_minute': 5
            },
            {
                'name': '러시안 트위스트',
                'description': '복부 옆쪽 근육을 강화하는 운동',
                'muscle_group': 'core',
                'difficulty': 'intermediate',
                'equipment_needed': 'none',
                'instructions': '앉은 상태에서 상체를 좌우로 비트는 동작입니다.',
                'estimated_calories_per_minute': 6
            },
            {
                'name': '마운틴 클라이머',
                'description': '전신 근육과 심폐지구력을 동시에 강화하는 운동',
                'muscle_group': 'full_body',
                'difficulty': 'intermediate',
                'equipment_needed': 'none',
                'instructions': '플랭크 자세에서 무릎을 번갈아 가슴 쪽으로 당기는 동작입니다.',
                'estimated_calories_per_minute': 12
            },
            
            # 유산소 운동
            {
                'name': '러닝',
                'description': '가장 기본적인 유산소 운동',
                'muscle_group': 'legs',
                'difficulty': 'beginner',
                'equipment_needed': 'none',
                'instructions': '일정한 속도로 달리면서 심폐지구력을 향상시킵니다.',
                'estimated_calories_per_minute': 12
            },
            {
                'name': '사이클링',
                'description': '하체 근력과 심폐지구력을 동시에 향상시키는 운동',
                'muscle_group': 'legs',
                'difficulty': 'beginner',
                'equipment_needed': 'bicycle',
                'instructions': '자전거를 타며 일정한 페이스를 유지합니다.',
                'estimated_calories_per_minute': 10
            },
            {
                'name': '로잉',
                'description': '전신 근육을 사용하는 유산소 운동',
                'muscle_group': 'full_body',
                'difficulty': 'intermediate',
                'equipment_needed': 'rowing machine',
                'instructions': '로잉 머신에서 노 젓는 동작을 반복합니다.',
                'estimated_calories_per_minute': 11
            },
            {
                'name': '점프 로프',
                'description': '줄넘기를 이용한 고강도 유산소 운동',
                'muscle_group': 'full_body',
                'difficulty': 'intermediate',
                'equipment_needed': 'jump rope',
                'instructions': '줄넘기를 이용해 리듬감 있게 점프합니다.',
                'estimated_calories_per_minute': 15
            },
            
            # 기능성 운동
            {
                'name': '버피',
                'description': '전신 근력과 심폐지구력을 동시에 강화하는 고강도 운동',
                'muscle_group': 'full_body',
                'difficulty': 'advanced',
                'equipment_needed': 'none',
                'instructions': '스쿼트, 플랭크, 점프를 연속으로 수행하는 복합 운동입니다.',
                'estimated_calories_per_minute': 18
            },
            {
                'name': '데드리프트',
                'description': '후면 근육 체인을 강화하는 복합 운동',
                'muscle_group': 'full_body',
                'difficulty': 'advanced',
                'equipment_needed': 'barbell',
                'instructions': '바닥의 바벨을 들어올리는 동작으로 전신 근력을 강화합니다.',
                'estimated_calories_per_minute': 10
            },
            {
                'name': '풀업',
                'description': '상체 근력을 강화하는 자체 중량 운동',
                'muscle_group': 'back',
                'difficulty': 'advanced',
                'equipment_needed': 'pull-up bar',
                'instructions': '철봉에 매달려 몸을 끌어올리는 동작입니다.',
                'estimated_calories_per_minute': 9
            },
            {
                'name': '푸시업',
                'description': '가슴과 팔 근육을 강화하는 기본 운동',
                'muscle_group': 'chest',
                'difficulty': 'beginner',
                'equipment_needed': 'none',
                'instructions': '엎드린 상태에서 팔로 몸을 밀어올리는 동작입니다.',
                'estimated_calories_per_minute': 7
            },
            
            # 스트레칭
            {
                'name': '햄스트링 스트레칭',
                'description': '허벅지 뒤쪽 근육을 늘려주는 스트레칭',
                'muscle_group': 'legs',
                'difficulty': 'beginner',
                'equipment_needed': 'none',
                'instructions': '다리를 뻗고 앞으로 숙여 햄스트링을 늘려줍니다.',
                'estimated_calories_per_minute': 2
            },
            {
                'name': '어깨 스트레칭',
                'description': '어깨 근육과 관절의 유연성을 향상시키는 스트레칭',
                'muscle_group': 'shoulders',
                'difficulty': 'beginner',
                'equipment_needed': 'none',
                'instructions': '팔을 반대편으로 당기거나 위로 올려 어깨를 늘려줍니다.',
                'estimated_calories_per_minute': 2
            },
            {
                'name': '목 스트레칭',
                'description': '목과 어깨 주변 근육을 늘려주는 스트레칭',
                'muscle_group': 'neck',
                'difficulty': 'beginner',
                'equipment_needed': 'none',
                'instructions': '목을 좌우, 앞뒤로 천천히 움직여 근육을 늘려줍니다.',
                'estimated_calories_per_minute': 1
            },
            {
                'name': '코브라 스트레칭',
                'description': '척추와 복부 근육을 늘려주는 요가 자세',
                'muscle_group': 'core',
                'difficulty': 'beginner',
                'equipment_needed': 'yoga mat',
                'instructions': '엎드린 상태에서 상체를 들어올려 등을 펴는 자세입니다.',
                'estimated_calories_per_minute': 2
            },
            {
                'name': '고양이-소 스트레칭',
                'description': '척추 유연성을 향상시키는 요가 동작',
                'muscle_group': 'back',
                'difficulty': 'beginner',
                'equipment_needed': 'yoga mat',
                'instructions': '네발기기 자세에서 등을 구부리고 펴는 동작을 반복합니다.',
                'estimated_calories_per_minute': 3
            },
            
            # 파워 운동
            {
                'name': '케틀벨 스윙',
                'description': '폭발적인 힘과 심폐지구력을 기르는 운동',
                'muscle_group': 'full_body',
                'difficulty': 'intermediate',
                'equipment_needed': 'kettlebell',
                'instructions': '케틀벨을 양손으로 잡고 스윙하는 동작입니다.',
                'estimated_calories_per_minute': 13
            },
            {
                'name': '박스 점프',
                'description': '하체 폭발력을 기르는 플라이오메트릭 운동',
                'muscle_group': 'legs',
                'difficulty': 'intermediate',
                'equipment_needed': 'plyometric box',
                'instructions': '박스 위로 점프하여 올라가는 동작입니다.',
                'estimated_calories_per_minute': 14
            }
        ]
        
        for exercise_data in exercises:
            exercise, created = Exercise.objects.get_or_create(
                name=exercise_data['name'],
                defaults=exercise_data
            )
            if created:
                self.stdout.write(f'운동 생성: {exercise.name}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'초기 데이터 로딩 완료! '
                f'운동 타입: {WorkoutType.objects.count()}개, '
                f'운동 종목: {Exercise.objects.count()}개'
            )
        )