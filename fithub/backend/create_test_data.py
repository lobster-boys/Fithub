#!/usr/bin/env python
"""
테스트용 운동 데이터 생성 스크립트
"""
import os
import sys
import django

# Django 환경 설정
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from workouts.models import Exercise, ExerciseType, WorkoutRoutine, RoutineExercise
from users.models import UserProfile

User = get_user_model()

def create_test_data():
    """테스트용 데이터 생성"""
    
    # 1. 시스템 사용자 생성 (공개 루틴 작성자)
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
        print(f"✅ 시스템 사용자 생성됨: {system_user.username}")
    
    # 2. 운동 타입 생성
    exercise_types = [
        {'name': '근력 운동', 'description': '웨이트 트레이닝, 맨몸 운동 등'},
        {'name': '유산소 운동', 'description': '달리기, 사이클링, 수영 등'},
        {'name': '유연성 운동', 'description': '스트레칭, 요가 등'},
        {'name': '기능성 운동', 'description': '기능성 훈련, 코어 운동 등'},
    ]
    
    for type_data in exercise_types:
        exercise_type, created = ExerciseType.objects.get_or_create(
            name=type_data['name'],
            defaults={'description': type_data['description']}
        )
        if created:
            print(f"✅ 운동 타입 생성됨: {exercise_type.name}")
    
    # 3. 기본 운동 종목 생성
    exercises_data = [
        # 가슴 운동
        {
            'name': '벤치 프레스',
            'description': '가슴과 상체 전반을 강화하는 기본 운동',
            'primary_muscle_group': '가슴',
            'secondary_muscle_groups': '어깨,삼두근',
            'difficulty_level': 'intermediate',
            'exercise_type': '근력 운동',
            'equipment_needed': '바벨,벤치',
        },
        {
            'name': '푸시업',
            'description': '자체 체중을 이용한 가슴 운동',
            'primary_muscle_group': '가슴',
            'secondary_muscle_groups': '어깨,삼두근,코어',
            'difficulty_level': 'beginner',
            'exercise_type': '근력 운동',
            'equipment_needed': '없음',
        },
        {
            'name': '덤벨 플라이',
            'description': '가슴 근육의 스트레치와 수축을 위한 운동',
            'primary_muscle_group': '가슴',
            'secondary_muscle_groups': '어깨',
            'difficulty_level': 'intermediate',
            'exercise_type': '근력 운동',
            'equipment_needed': '덤벨,벤치',
        },
        
        # 등 운동
        {
            'name': '풀업',
            'description': '등과 이두근을 강화하는 고강도 운동',
            'primary_muscle_group': '등',
            'secondary_muscle_groups': '이두근,어깨',
            'difficulty_level': 'advanced',
            'exercise_type': '근력 운동',
            'equipment_needed': '풀업바',
        },
        {
            'name': '바벨 로우',
            'description': '등 근육 전체를 강화하는 기본 운동',
            'primary_muscle_group': '등',
            'secondary_muscle_groups': '이두근,어깨',
            'difficulty_level': 'intermediate',
            'exercise_type': '근력 운동',
            'equipment_needed': '바벨',
        },
        {
            'name': '랫 풀다운',
            'description': '머신을 이용한 등 운동',
            'primary_muscle_group': '등',
            'secondary_muscle_groups': '이두근',
            'difficulty_level': 'beginner',
            'exercise_type': '근력 운동',
            'equipment_needed': '랫풀다운 머신',
        },
        
        # 어깨 운동
        {
            'name': '오버헤드 프레스',
            'description': '어깨 전체를 강화하는 기본 운동',
            'primary_muscle_group': '어깨',
            'secondary_muscle_groups': '삼두근,코어',
            'difficulty_level': 'intermediate',
            'exercise_type': '근력 운동',
            'equipment_needed': '바벨',
        },
        {
            'name': '레터럴 레이즈',
            'description': '어깨 중부를 타겟으로 하는 운동',
            'primary_muscle_group': '어깨',
            'secondary_muscle_groups': '',
            'difficulty_level': 'beginner',
            'exercise_type': '근력 운동',
            'equipment_needed': '덤벨',
        },
        
        # 다리 운동
        {
            'name': '스쿼트',
            'description': '하체 전체를 강화하는 기본 운동',
            'primary_muscle_group': '다리',
            'secondary_muscle_groups': '둔근,코어',
            'difficulty_level': 'beginner',
            'exercise_type': '근력 운동',
            'equipment_needed': '없음',
        },
        {
            'name': '데드리프트',
            'description': '전신을 강화하는 고강도 운동',
            'primary_muscle_group': '다리',
            'secondary_muscle_groups': '등,둔근,코어',
            'difficulty_level': 'advanced',
            'exercise_type': '근력 운동',
            'equipment_needed': '바벨',
        },
        
        # 코어 운동
        {
            'name': '플랭크',
            'description': '코어 안정성을 위한 기본 운동',
            'primary_muscle_group': '코어',
            'secondary_muscle_groups': '어깨',
            'difficulty_level': 'beginner',
            'exercise_type': '기능성 운동',
            'equipment_needed': '없음',
        },
        {
            'name': '크런치',
            'description': '복직근을 타겟으로 하는 운동',
            'primary_muscle_group': '코어',
            'secondary_muscle_groups': '',
            'difficulty_level': 'beginner',
            'exercise_type': '기능성 운동',
            'equipment_needed': '없음',
        },
    ]
    
    for exercise_data in exercises_data:
        exercise_type = ExerciseType.objects.get(name=exercise_data['exercise_type'])
        exercise, created = Exercise.objects.get_or_create(
            name=exercise_data['name'],
            defaults={
                'description': exercise_data['description'],
                'primary_muscle_group': exercise_data['primary_muscle_group'],
                'secondary_muscle_groups': exercise_data['secondary_muscle_groups'],
                'difficulty_level': exercise_data['difficulty_level'],
                'exercise_type': exercise_type,
                'equipment_needed': exercise_data['equipment_needed'],
            }
        )
        if created:
            print(f"✅ 운동 종목 생성됨: {exercise.name}")
    
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
                {'name': '플랭크', 'sets': 3, 'reps': 30},  # 초 단위
                {'name': '크런치', 'sets': 3, 'reps': 15},
            ]
        },
        {
            'name': '상체 집중 루틴',
            'description': '상체 근력 강화를 위한 중급자 루틴',
            'difficulty_level': 'intermediate',
            'estimated_duration': 45,
            'is_public': True,
            'is_featured': True,
            'target_muscle_groups': '가슴,등,어깨',
            'exercises': [
                {'name': '벤치 프레스', 'sets': 4, 'reps': 8},
                {'name': '바벨 로우', 'sets': 4, 'reps': 8},
                {'name': '오버헤드 프레스', 'sets': 3, 'reps': 10},
                {'name': '랫 풀다운', 'sets': 3, 'reps': 12},
                {'name': '레터럴 레이즈', 'sets': 3, 'reps': 15},
            ]
        },
        {
            'name': '하체 강화 프로그램',
            'description': '하체 근력과 파워 향상을 위한 고급자 루틴',
            'difficulty_level': 'advanced',
            'estimated_duration': 60,
            'is_public': True,
            'is_featured': False,
            'target_muscle_groups': '다리,둔근',
            'exercises': [
                {'name': '스쿼트', 'sets': 5, 'reps': 5},
                {'name': '데드리프트', 'sets': 4, 'reps': 6},
                {'name': '스쿼트', 'sets': 3, 'reps': 12},  # 보조 스쿼트
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
            print(f"✅ 루틴 생성됨: {routine.name}")
            
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
                    print(f"  ➡️ 운동 추가됨: {exercise.name}")
                except Exercise.DoesNotExist:
                    print(f"  ⚠️ 운동을 찾을 수 없음: {exercise_data['name']}")
    
    print("\n🎉 테스트 데이터 생성 완료!")
    print("📊 생성된 데이터:")
    print(f"   - 운동 타입: {ExerciseType.objects.count()}개")
    print(f"   - 운동 종목: {Exercise.objects.count()}개")
    print(f"   - 공개 루틴: {WorkoutRoutine.objects.filter(is_public=True).count()}개")

if __name__ == '__main__':
    create_test_data() 