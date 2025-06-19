from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from workouts.models import Exercise, WorkoutRoutine, RoutineExercise, WorkoutType

User = get_user_model()

class Command(BaseCommand):
    help = '테스트용 운동 루틴 데이터 생성'

    def handle(self, *args, **options):
        # 1. 시스템 사용자 생성
        system_user, created = User.objects.get_or_create(
            username='system',
            defaults={
                'email': 'system@fithub.com',
                'first_name': 'System',
                'last_name': 'Admin'
            }
        )
        if created:
            system_user.set_password('systempass123!')
            system_user.save()
            self.stdout.write(f"✅ 시스템 사용자 생성됨: {system_user.username}")

        # 2. 운동 타입 생성
        workout_types = [
            {'name': 'strength', 'description': '웨이트 트레이닝, 맨몸 운동 등'},
            {'name': 'cardio', 'description': '달리기, 사이클링, 수영 등'},
            {'name': 'flexibility', 'description': '스트레칭, 요가 등'},
            {'name': 'yoga', 'description': '요가, 명상 운동 등'},
        ]
        
        for type_data in workout_types:
            workout_type, created = WorkoutType.objects.get_or_create(
                name=type_data['name'],
                defaults={'description': type_data['description']}
            )
            if created:
                self.stdout.write(f"✅ 운동 타입 생성됨: {workout_type.get_name_display()}")

        # 3. 기본 운동 종목 생성
        exercises_data = [
            {
                'name': '푸시업',
                'description': '자체 체중을 이용한 가슴 운동',
                'muscle_groups': '가슴,어깨,삼두근,코어',
                'equipment_needed': '맨몸',
                'difficulty_level': 'beginner',
                'calories_per_minute': 8,
            },
            {
                'name': '스쿼트',
                'description': '하체 전체를 강화하는 기본 운동',
                'muscle_groups': '다리,둔근,코어',
                'equipment_needed': '맨몸',
                'difficulty_level': 'beginner',
                'calories_per_minute': 10,
            },
            {
                'name': '플랭크',
                'description': '코어 안정성을 위한 기본 운동',
                'muscle_groups': '코어,어깨',
                'equipment_needed': '맨몸',
                'difficulty_level': 'beginner',
                'calories_per_minute': 6,
            },
            {
                'name': '벤치 프레스',
                'description': '가슴과 상체 전반을 강화하는 기본 운동',
                'muscle_groups': '가슴,어깨,삼두근',
                'equipment_needed': '바벨,벤치',
                'difficulty_level': 'intermediate',
                'calories_per_minute': 12,
            },
            {
                'name': '데드리프트',
                'description': '전신 근력을 강화하는 복합 운동',
                'muscle_groups': '등,다리,둔근,코어',
                'equipment_needed': '바벨',
                'difficulty_level': 'advanced',
                'calories_per_minute': 15,
            },
            {
                'name': '풀업',
                'description': '상체 당기는 동작의 기본 운동',
                'muscle_groups': '등,이두근,코어',
                'equipment_needed': '풀업바',
                'difficulty_level': 'intermediate',
                'calories_per_minute': 11,
            },
        ]
        
        for exercise_data in exercises_data:
            exercise, created = Exercise.objects.get_or_create(
                name=exercise_data['name'],
                defaults={
                    'description': exercise_data['description'],
                    'muscle_groups': exercise_data['muscle_groups'],
                    'equipment_needed': exercise_data['equipment_needed'],
                    'difficulty_level': exercise_data['difficulty_level'],
                    'calories_per_minute': exercise_data['calories_per_minute'],
                }
            )
            if created:
                self.stdout.write(f"✅ 운동 종목 생성됨: {exercise.name}")

        # 4. 공개 루틴 생성
        routines_data = [
            {
                'name': '초보자 전신 운동',
                'description': '운동을 처음 시작하는 분들을 위한 전신 운동 루틴',
                'difficulty_level': 'beginner',
                'estimated_duration': 30,
                'is_public': True,
                'is_featured': True,
                'target_muscle_groups': '전신',
                'exercises': [
                    {'name': '푸시업', 'sets': 3, 'reps': 10},
                    {'name': '스쿼트', 'sets': 3, 'reps': 15},
                    {'name': '플랭크', 'sets': 3, 'reps': 30},
                ]
            },
            {
                'name': '상체 집중 루틴',
                'description': '상체 근력 강화를 위한 중급자 루틴',
                'difficulty_level': 'intermediate',
                'estimated_duration': 45,
                'is_public': True,
                'is_featured': True,
                'target_muscle_groups': '가슴,어깨',
                'exercises': [
                    {'name': '벤치 프레스', 'sets': 4, 'reps': 8},
                    {'name': '푸시업', 'sets': 3, 'reps': 15},
                ]
            },
        ]
        
        for routine_data in routines_data:
            routine, created = WorkoutRoutine.objects.get_or_create(
                name=routine_data['name'],
                defaults={
                    'user': system_user,
                    'description': routine_data['description'],
                    'difficulty_level': routine_data['difficulty_level'],
                    'estimated_duration': routine_data['estimated_duration'],
                    'is_public': routine_data['is_public'],
                    'is_featured': routine_data['is_featured'],
                    'target_muscle_groups': routine_data['target_muscle_groups'],
                }
            )
            
            if created:
                self.stdout.write(f"✅ 루틴 생성됨: {routine.name}")
                
                # 루틴에 운동 추가
                for i, exercise_data in enumerate(routine_data['exercises']):
                    try:
                        exercise = Exercise.objects.get(name=exercise_data['name'])
                        RoutineExercise.objects.create(
                            routine=routine,
                            exercise=exercise,
                            sets=exercise_data['sets'],
                            reps=exercise_data['reps'],
                            order=i + 1
                        )
                        self.stdout.write(f"  ➡️ 운동 추가됨: {exercise.name}")
                    except Exercise.DoesNotExist:
                        self.stdout.write(f"  ⚠️ 운동을 찾을 수 없음: {exercise_data['name']}")

        self.stdout.write("\n🎉 테스트 데이터 생성 완료!")
        self.stdout.write(f"📊 생성된 데이터:")
        self.stdout.write(f"   - 운동 타입: {WorkoutType.objects.count()}개")
        self.stdout.write(f"   - 운동 종목: {Exercise.objects.count()}개")
        self.stdout.write(f"   - 공개 루틴: {WorkoutRoutine.objects.filter(is_public=True).count()}개") 