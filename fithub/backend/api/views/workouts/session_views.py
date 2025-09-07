from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from workouts.models import WorkoutSession, SessionExerciseLog, WorkoutRoutine, RoutineExercise
from api.serializers.workouts.session_serializers import (
    WorkoutSessionListSerializer,
    WorkoutSessionDetailSerializer,
    WorkoutSessionCreateSerializer,
    SessionExerciseLogSerializer,
    SessionControlSerializer
)


class WorkoutSessionViewSet(viewsets.ModelViewSet):
    """운동 세션 관리 ViewSet"""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return WorkoutSession.objects.filter(user=self.request.user).select_related(
            'routine', 'user'
        ).prefetch_related(
            'routine__routine_exercises__exercise',
            'exercise_logs__routine_exercise__exercise'
        )
    
    def get_serializer_class(self):
        if self.action == 'list':
            return WorkoutSessionListSerializer
        elif self.action == 'create':
            return WorkoutSessionCreateSerializer
        return WorkoutSessionDetailSerializer
    
    def create(self, request, *args, **kwargs):
        """새 운동 세션 시작"""
        routine_id = request.data.get('routine')
        
        if not routine_id:
            return Response(
                {'error': '루틴 ID가 필요합니다.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 루틴 존재 확인
        try:
            routine = WorkoutRoutine.objects.get(id=routine_id, user=request.user)
        except WorkoutRoutine.DoesNotExist:
            return Response(
                {'error': '해당 루틴을 찾을 수 없습니다.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # 루틴에 운동이 있는지 확인
        if not routine.routine_exercises.exists():
            return Response(
                {'error': '루틴에 운동이 없습니다.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 진행 중인 세션이 있는지 확인
        active_session = WorkoutSession.objects.filter(
            user=request.user,
            status__in=['active', 'paused']
        ).first()
        
        if active_session:
            return Response(
                {
                    'error': '이미 진행 중인 운동 세션이 있습니다.',
                    'active_session_id': active_session.id
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 새 세션 생성
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = serializer.save()
        
        # 루틴 사용 횟수 증가
        routine.increment_usage()
        
        # 세션 시작 시 첫 번째 운동으로 설정
        session.current_exercise_index = 0
        session.current_set = 1
        session.save()
        
        # 상세 정보로 응답
        detail_serializer = WorkoutSessionDetailSerializer(session)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def control(self, request, pk=None):
        """세션 제어 (일시정지, 재개, 완료, 취소, 다음 운동, 다음 세트)"""
        session = self.get_object()
        serializer = SessionControlSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 안전한 데이터 접근
        validated_data = getattr(serializer, 'validated_data', None)
        if not validated_data:
            return Response(
                {'error': '유효하지 않은 데이터입니다.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        action_type = validated_data.get('action')
        if not action_type:
            return Response(
                {'error': 'action 필드가 누락되었습니다.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 이미 완료된 세션에 대한 액션 검증
        forbidden_actions = ['next_set', 'next_exercise']
        if session.status == 'completed' and action_type in forbidden_actions:
            return Response(
                {'error': '이미 완료된 세션에는 추가 액션을 수행할 수 없습니다.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                if action_type == 'pause':
                    session.pause_session()
                    message = "세션이 일시정지되었습니다."
                
                elif action_type == 'resume':
                    session.resume_session()
                    message = "세션이 재개되었습니다."
                
                elif action_type == 'complete':
                    print(f"🎯 세션 완료 처리 시작 - 세션 ID: {session.id}")
                    session.complete_session()
                    
                    # 운동 로그 생성
                    print(f"📝 운동 로그 생성 시도 중...")
                    workout_log = self._create_workout_log(session)
                    
                    if workout_log:
                        print(f"✅ 운동 로그 생성 완료 - 로그 ID: {workout_log.id}")
                        message = f"세션이 완료되었습니다. 운동 로그가 생성되었습니다."
                    else:
                        print(f"⚠️ 운동 로그 생성 실패")
                        message = "세션이 완료되었습니다."
                
                elif action_type == 'cancel':
                    session.cancel_session()
                    message = "세션이 취소되었습니다."
                
                elif action_type == 'next_set':
                    result = self._handle_next_set(session, validated_data)
                    message = result['message']
                
                elif action_type == 'next_exercise':
                    result = self._handle_next_exercise(session)
                    message = result['message']
                
                else:
                    return Response(
                        {'error': '지원하지 않는 액션입니다.'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # 업데이트된 세션 정보 반환
            updated_session = WorkoutSession.objects.get(pk=session.pk)
            detail_serializer = WorkoutSessionDetailSerializer(updated_session)
            
            return Response({
                'message': message,
                'session': detail_serializer.data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _handle_next_set(self, session, validated_data):
        """다음 세트로 진행"""
        routine_exercises = list(session.routine.routine_exercises.all())
        
        if session.current_exercise_index >= len(routine_exercises):
            return {'message': '모든 운동이 완료되었습니다.'}
        
        current_routine_exercise = routine_exercises[session.current_exercise_index]
        
        # 현재 세트 완료 기록
        exercise_log = SessionExerciseLog.objects.create(
            session=session,
            routine_exercise=current_routine_exercise,
            set_number=session.current_set,
            reps_completed=validated_data.get('reps_completed', current_routine_exercise.reps),
            weight_used=validated_data.get('weight_used'),
            notes=validated_data.get('notes', ''),
            exercise_end_time=timezone.now(),
            is_completed=True
        )
        
        # 현재 세트가 마지막 세트인지 확인
        if session.current_set < current_routine_exercise.sets:
            # 다음 세트로 이동
            session.current_set += 1
            session.save()
            
            # 휴식 시작
            exercise_log.start_rest()
            
            return {'message': f'세트 {session.current_set - 1} 완료. 휴식 시간입니다.'}
        else:
            # 현재 운동의 모든 세트 완료 - 다음 운동으로 이동
            return self._handle_next_exercise(session)
    
    def _handle_next_exercise(self, session):
        """다음 운동으로 진행"""
        routine_exercises = list(session.routine.routine_exercises.all())
        
        session.current_exercise_index += 1
        session.current_set = 1
        
        if session.current_exercise_index >= len(routine_exercises):
            # 모든 운동 완료
            print(f"🎯 모든 운동 완료 - 세션 완료 및 운동 로그 생성 시작")
            session.complete_session()
            
            # 운동 로그 생성
            workout_log = self._create_workout_log(session)
            if workout_log:
                print(f"✅ 모든 운동 완료 시 운동 로그 생성 완료 - 로그 ID: {workout_log.id}")
            else:
                print(f"⚠️ 모든 운동 완료 시 운동 로그 생성 실패")
            
            return {'message': '모든 운동이 완료되었습니다! 수고하셨습니다.'}
        
        session.save()
        next_exercise = routine_exercises[session.current_exercise_index]
        
        return {'message': f'다음 운동: {next_exercise.exercise.name}'}
    
    @action(detail=True, methods=['get'])
    def current_status(self, request, pk=None):
        """현재 세션 상태 조회"""
        session = self.get_object()
        serializer = WorkoutSessionDetailSerializer(session)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """진행 중인 세션 조회"""
        active_session = WorkoutSession.objects.filter(
            user=request.user,
            status__in=['active', 'paused']
        ).select_related('routine').prefetch_related(
            'routine__routine_exercises__exercise',
            'exercise_logs__routine_exercise__exercise'
        ).first()
        
        if not active_session:
            return Response({'message': '진행 중인 세션이 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = WorkoutSessionDetailSerializer(active_session)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def start_rest(self, request, pk=None):
        """휴식 시작"""
        session = self.get_object()
        
        # 현재 진행 중인 세트의 로그 찾기
        current_log = SessionExerciseLog.objects.filter(
            session=session,
            set_number=session.current_set,
            is_completed=False
        ).first()
        
        if current_log:
            current_log.start_rest()
            return Response({'message': '휴식이 시작되었습니다.'})
        
        return Response(
            {'error': '진행 중인 세트를 찾을 수 없습니다.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def end_rest(self, request, pk=None):
        """휴식 종료"""
        session = self.get_object()
        
        # 휴식 중인 세트의 로그 찾기
        resting_log = SessionExerciseLog.objects.filter(
            session=session,
            rest_start_time__isnull=False,
            rest_end_time__isnull=True
        ).first()
        
        if resting_log:
            resting_log.end_rest()
            return Response({'message': '휴식이 종료되었습니다. 다음 세트를 시작하세요.'})
        
        return Response(
            {'error': '휴식 중인 세트를 찾을 수 없습니다.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def _create_workout_log(self, session):
        """세션 완료 시 운동 로그 생성"""
        from workouts.models import WorkoutLog
        from django.db.models import Sum, Count
        
        print(f"📋 운동 로그 생성 시작 - 세션 ID: {session.id}")
        
        # 세션의 운동 로그들 가져오기
        exercise_logs = session.exercise_logs.filter(is_completed=True)
        print(f"🏋️ 완료된 운동 로그 개수: {exercise_logs.count()}")
        
        if not exercise_logs.exists():
            print(f"⚠️ 완료된 운동 로그가 없습니다.")
            return None
        
        # 총 운동 시간 계산 (분 단위)
        total_duration_seconds = session.total_duration_seconds
        duration_minutes = max(1, total_duration_seconds // 60)  # 최소 1분
        
        # 총 소모 칼로리 계산
        total_calories = self._calculate_total_calories(session, exercise_logs)
        
        # 운동 로그 생성
        print(f"💾 WorkoutLog 생성 중... 사용자: {session.user}, 루틴: {session.routine}")
        workout_log = WorkoutLog.objects.create(
            user=session.user,
            routine=session.routine,
            start_time=session.session_start_time,
            end_time=session.session_end_time,
            duration_minutes=duration_minutes,
            calories_burned=total_calories,
            rating=5,  # 기본값, 추후 사용자가 수정 가능
            mood='good',  # 기본값, 추후 사용자가 수정 가능
            workout_type='strength',  # 기본값
            notes=f"타이머로 완료된 운동 (총 {exercise_logs.count()}개 운동)"
        )
        print(f"✅ WorkoutLog 생성 완료 - ID: {workout_log.id}")
        
        # 운동별 상세 로그 생성
        print(f"🏋️ 개별 운동 로그 생성 시작...")
        self._create_workout_log_exercises(workout_log, session, exercise_logs)
        print(f"✅ 개별 운동 로그 생성 완료")
        
        return workout_log
    
    def _calculate_total_calories(self, session, exercise_logs):
        """총 소모 칼로리 계산"""
        total_calories = 0
        
        # 운동별로 그룹화하여 칼로리 계산
        exercise_groups = {}
        for log in exercise_logs:
            exercise_id = log.routine_exercise.exercise.id
            if exercise_id not in exercise_groups:
                exercise_groups[exercise_id] = {
                    'exercise': log.routine_exercise.exercise,
                    'total_sets': 0,
                    'total_reps': 0,
                    'total_time': 0
                }
            
            exercise_groups[exercise_id]['total_sets'] += 1
            exercise_groups[exercise_id]['total_reps'] += log.reps_completed
            
            # 운동 시간 계산 (기본값 사용)
            estimated_time = log.reps_completed * 2  # 1회당 2초 예상
            exercise_groups[exercise_id]['total_time'] += estimated_time
        
        # 각 운동별 칼로리 계산
        for group in exercise_groups.values():
            exercise = group['exercise']
            time_minutes = max(1, group['total_time'] / 60)  # 분 단위 변환
            calories = int(time_minutes * exercise.calories_per_minute)
            total_calories += calories
        
        return max(50, total_calories)  # 최소 50칼로리
    
    def _create_workout_log_exercises(self, workout_log, session, exercise_logs):
        """운동 로그의 개별 운동 기록 생성"""
        from workouts.models import WorkoutLogExercise
        
        # 운동별로 그룹화
        exercise_groups = {}
        
        for log in exercise_logs:
            exercise_id = log.routine_exercise.exercise.id
            if exercise_id not in exercise_groups:
                exercise_groups[exercise_id] = {
                    'sets': 0,
                    'total_reps': 0,
                    'weights': [],
                    'exercise': log.routine_exercise.exercise,
                    'order': log.routine_exercise.order
                }
            
            exercise_groups[exercise_id]['sets'] += 1
            exercise_groups[exercise_id]['total_reps'] += log.reps_completed
            
            if log.weight_used:
                exercise_groups[exercise_id]['weights'].append(log.weight_used)
        
        # 운동 로그 생성
        for exercise_id, data in exercise_groups.items():
            # 평균 무게 계산
            avg_weight = None
            weights = data['weights']
            if weights:
                avg_weight = sum(weights) / len(weights)
            
            WorkoutLogExercise.objects.create(
                workout_log=workout_log,
                exercise=data['exercise'],
                sets_completed=data['sets'],
                reps_completed=data['total_reps'],
                weight_used=avg_weight,
                notes=f"타이머로 완료 ({data['sets']}세트)",
                order=data['order']
            )