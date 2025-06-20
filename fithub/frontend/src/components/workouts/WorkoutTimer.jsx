import React, { useState, useEffect, useRef } from 'react';
import { startSession, getActiveSession, controlSession, getLatestWorkoutLog } from '../../api/workoutAPI';

const WorkoutTimer = ({ routineId, exerciseId, onSessionEnd, onSessionError }) => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isExercising, setIsExercising] = useState(false);
  const [currentReps, setCurrentReps] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  
  // 타이머 관련 상태
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState(0);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [maxExerciseTime, setMaxExerciseTime] = useState(10); // 테스트용 10초
  const [maxRestTime, setMaxRestTime] = useState(5); // 테스트용 5초
  
  const timerRef = useRef(null);
  const exerciseTimerRef = useRef(null);
  const restTimerRef = useRef(null);
  
  const isIndividualExercise = !routineId && exerciseId;

  // 세션 시작
  const handleStartSession = async () => {
    if (!routineId) return;
    
    setIsLoading(true);
    try {
      const response = await startSession({ routine: routineId });
      console.log('세션 시작 응답:', response.data);
      setSession(response.data);
      startMainTimer();
      
      // 세션 설정 후 잠시 대기한 다음 운동 시작
              setTimeout(() => {
          if (response.data?.current_exercise) {
            setMaxExerciseTime(response.data.current_exercise.max_exercise_time || 10);
            setMaxRestTime(response.data.current_exercise.rest_time || 5);
            startExercisePhaseWithSession(response.data);
          }
        }, 100);
    } catch (error) {
      console.error('세션 시작 실패:', error);
      onSessionError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 활성 세션 확인
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!routineId) return;
      
      try {
        const response = await getActiveSession();
        if (response.data) {
          console.log('기존 활성 세션 발견:', response.data);
          setSession(response.data);
          startMainTimer();
          
          // 현재 운동의 최대 시간 설정
          if (response.data.current_exercise) {
            setMaxExerciseTime(response.data.current_exercise.max_exercise_time || 10);
            setMaxRestTime(response.data.current_exercise.rest_time || 5);
            startExercisePhaseWithSession(response.data);
          }
        }
      } catch (error) {
        console.log('활성 세션 없음');
      }
    };

    checkActiveSession();
  }, [routineId]);

  // 메인 타이머 (총 운동 시간)
  const startMainTimer = () => {
    if (timerRef.current) return;
    
    timerRef.current = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);
  };

  const stopMainTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 운동 단계 시작 (세션 데이터와 함께)
  const startExercisePhaseWithSession = (sessionData) => {
    if (!sessionData?.current_exercise) {
      console.log('현재 운동 정보가 없습니다:', sessionData);
      return;
    }
    
    console.log('운동 단계 시작:', sessionData.current_exercise);
    setIsExercising(true);
    setIsResting(false);
    const maxTime = sessionData.current_exercise.max_exercise_time || 10; // 테스트용 10초
    setExerciseTimeLeft(maxTime);
    setMaxExerciseTime(maxTime);
    
    if (exerciseTimerRef.current) clearInterval(exerciseTimerRef.current);
    
    exerciseTimerRef.current = setInterval(() => {
      setExerciseTimeLeft(prev => {
        if (prev <= 1) {
          // 운동 시간 종료 - 자동으로 다음 세트로
          console.log('운동 시간 완료! 자동 다음 세트로');
          handleAutoNextSet();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 운동 단계 시작 (현재 세션 사용)
  const startExercisePhase = () => {
    if (!session?.current_exercise) {
      console.log('현재 세션 또는 운동 정보가 없습니다:', session);
      return;
    }
    
    startExercisePhaseWithSession(session);
  };

  // 휴식 단계 시작
  const startRestPhase = () => {
    console.log('휴식 단계 시작');
    setIsExercising(false);
    setIsResting(true);
    const restDuration = session?.current_exercise?.rest_time || 5; // 테스트용 5초
    setRestTimeLeft(restDuration);
    setMaxRestTime(restDuration);
    
    if (exerciseTimerRef.current) {
      clearInterval(exerciseTimerRef.current);
      exerciseTimerRef.current = null;
    }
    
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    
    restTimerRef.current = setInterval(() => {
      setRestTimeLeft(prev => {
        if (prev <= 1) {
          // 휴식 시간 종료 - 자동으로 다음 세트 또는 운동 시작
          console.log('휴식 시간 완료! 자동으로 다음 단계로');
          handleAutoEndRest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 자동으로 다음 세트 진행
  const handleAutoNextSet = async () => {
    // 세션이 이미 완료된 상태이면 추가 처리 중단
    if (!session || session.status === 'completed') {
      console.log('⚠️ 세션이 이미 완료되어 자동 다음 세트 처리를 중단합니다.');
      return;
    }

    const reps = parseInt(currentReps) || session.current_exercise?.target_reps || 0;
    const weight = parseFloat(currentWeight) || null;
    
    console.log('자동 다음 세트 처리 시작:', { reps, weight });
    
    try {
      const response = await controlSession(session.id, 'next_set', {
        reps_completed: reps,
        weight_used: weight
      });
      
      console.log('세트 완료 응답:', response.data);
      const updatedSession = response.data.session;
      setSession(updatedSession);
      setCurrentReps('');
      setCurrentWeight('');
      
      // 운동 타이머 정지
      if (exerciseTimerRef.current) {
        clearInterval(exerciseTimerRef.current);
        exerciseTimerRef.current = null;
      }
      
      // 다음 단계 결정
      const currentExercise = updatedSession.current_exercise;
      
      // 모든 운동이 완료되었거나 세션이 이미 완료 상태인 경우
      if (!currentExercise || updatedSession.status === 'completed') {
        console.log('🎉 모든 운동 완료! 세션이 완료되었습니다.');
        stopAllTimers();
        
        // 즉시 글로벌 새로고침 실행
        console.log('🔄 글로벌 새로고침 함수 호출 시도...');
        if (window.refreshWorkoutLogs) {
          console.log('✅ 글로벌 새로고침 함수 발견, 실행 중...');
          try {
            await window.refreshWorkoutLogs();
            console.log('✅ 글로벌 새로고침 완료');
          } catch (refreshError) {
            console.error('❌ 글로벌 새로고침 실패:', refreshError);
          }
        } else {
          console.log('❌ 글로벌 새로고침 함수 없음');
        }
        
        // 운동 로그 생성 확인
        setTimeout(async () => {
          try {
            console.log('🔍 최신 운동 로그 조회 중...');
            const latestLogResponse = await getLatestWorkoutLog();
            console.log('📊 최신 운동 로그 응답:', latestLogResponse);
            
            if (latestLogResponse.results && latestLogResponse.results.length > 0) {
              const latestLog = latestLogResponse.results[0];
              console.log('✅ 운동 로그가 생성되었습니다:', latestLog);
              
              onSessionEnd?.({ 
                duration: currentTime,
                session: updatedSession,
                workoutLog: latestLog
              });
            } else {
              console.log('⚠️ 새로운 운동 로그가 없습니다');
              onSessionEnd?.({ 
                duration: currentTime,
                session: updatedSession
              });
            }
          } catch (error) {
            console.error('❌ 운동 로그 조회 실패:', error);
            onSessionEnd?.({ 
              duration: currentTime,
              session: updatedSession
            });
          }
        }, 2000); // 2초 후 운동 로그 확인 (백엔드 처리 시간 고려)
        
        return;
      }
      
      console.log(`현재 세트: ${updatedSession.current_set}/${currentExercise.target_sets}`);
      
      // 세트 완료 후 아직 더 세트가 남아있는지 확인
      if (updatedSession.current_set <= currentExercise.target_sets) {
        // 같은 운동의 다음 세트 - 휴식 시작
        console.log('같은 운동의 다음 세트, 휴식 시작');
        startRestPhase();
      } else {
         // 현재 운동의 모든 세트가 완료됨 - 다음 운동으로 이동
         console.log('현재 운동의 모든 세트 완료, 다음 운동으로 이동');
         setMaxExerciseTime(currentExercise.max_exercise_time || 10);
         setMaxRestTime(currentExercise.rest_time || 5);
         startExercisePhaseWithSession(updatedSession);
       }
    } catch (error) {
      console.error('자동 다음 세트 실패:', error);
      onSessionError?.(error);
    }
  };

  // 자동 휴식 종료
  const handleAutoEndRest = () => {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    
    // 다음 세트 시작
    startExercisePhase();
  };

  // 세션 완료
  const handleSessionComplete = async () => {
    try {
      await controlSession(session.id, 'complete');
      stopAllTimers();
      onSessionEnd?.({ 
        duration: currentTime,
        session: session
      });
    } catch (error) {
      console.error('세션 완료 실패:', error);
      onSessionError?.(error);
    }
  };

  // 수동 제어
  const handleManualControl = async (action, data = {}) => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      const response = await controlSession(session.id, action, data);
      setSession(response.data.session);
      
      if (action === 'pause') {
        stopAllTimers();
      } else if (action === 'resume') {
        startMainTimer();
        if (isExercising) startExercisePhase();
        else if (isResting) startRestPhase();
      } else if (action === 'complete' || action === 'cancel') {
        stopAllTimers();
        onSessionEnd?.({ duration: currentTime });
      }
    } catch (error) {
      console.error('세션 제어 실패:', error);
      onSessionError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 모든 타이머 정지
  const stopAllTimers = () => {
    stopMainTimer();
    if (exerciseTimerRef.current) {
      clearInterval(exerciseTimerRef.current);
      exerciseTimerRef.current = null;
    }
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
  };

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 원형 프로그레스바 컴포넌트
  const CircularProgress = ({ progress, timeLeft, maxTime, label, color = "primary" }) => {
    const circumference = 2 * Math.PI * 40; // 반지름 40
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress * circumference);
    
    const colorClasses = {
      primary: "stroke-orange-500",
      blue: "stroke-blue-500",
      green: "stroke-green-500",
      red: "stroke-red-500"
    };

    return (
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* 배경 원 */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* 진행률 원 */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ${colorClasses[color]}`}
          />
        </svg>
        
        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-800">
            {formatTime(timeLeft)}
          </div>
          <div className="text-xs text-gray-600 text-center">
            {label}
          </div>
        </div>
      </div>
    );
  };

  // 컴포넌트 정리
  useEffect(() => {
    return () => {
      stopAllTimers();
    };
  }, []);

  // 개별 운동용 간단한 타이머
  if (isIndividualExercise) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-6 text-center">운동 타이머</h3>
        
        <div className="flex justify-center mb-6">
          <CircularProgress
            progress={1}
            timeLeft={currentTime}
            maxTime={currentTime + 1}
            label="운동 시간"
            color="primary"
          />
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (timerRef.current) {
                stopMainTimer();
              } else {
                startMainTimer();
              }
            }}
            className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            {timerRef.current ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-pause mr-2"></i>
                일시정지
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <i className="fas fa-play mr-2"></i>
                시작
              </span>
            )}
          </button>
          
          <button
            onClick={() => {
              stopMainTimer();
              setCurrentTime(0);
              onSessionEnd?.({ duration: currentTime });
            }}
            className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            <span className="flex items-center justify-center">
              <i className="fas fa-check mr-2"></i>
              완료
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <h3 className="text-lg font-bold mb-4">운동 시작하기</h3>
        <p className="text-gray-600 mb-4">
          운동 루틴을 시작하고 실시간으로 진행 상황을 추적하세요.
        </p>
        <button
          onClick={handleStartSession}
          disabled={isLoading || !routineId}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              시작 중...
            </span>
          ) : (
            <span className="flex items-center">
              <i className="fas fa-play mr-2"></i>
              운동 시작하기
            </span>
          )}
        </button>
      </div>
    );
  }

  const currentExercise = session.current_exercise;
  const progressPercentage = session.total_exercises > 0 
    ? Math.round((session.current_exercise_index / session.total_exercises) * 100)
    : 0;

  // 현재 타이머 상태에 따른 진행률 계산
  const getCurrentProgress = () => {
    if (isExercising) {
      return exerciseTimeLeft / maxExerciseTime;
    } else if (isResting) {
      return restTimeLeft / maxRestTime;
    }
    return 1;
  };

  const getCurrentTimeLeft = () => {
    if (isExercising) return exerciseTimeLeft;
    if (isResting) return restTimeLeft;
    return 0;
  };

  const getCurrentLabel = () => {
    if (isExercising) return `세트 ${session.current_set}`;
    if (isResting) return '휴식시간';
    return '대기 중';
  };

  const getCurrentColor = () => {
    if (isExercising) return 'primary';
    if (isResting) return 'blue';
    return 'primary';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* 헤더 - 진행 상황 */}
      <div className="bg-primary text-white p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{session.routine_name}</h3>
          <span className="text-sm opacity-90">
            {session.current_exercise_index + 1} / {session.total_exercises}
          </span>
        </div>
        
        {/* 진행률 바 */}
        <div className="w-full bg-orange-300 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-right text-sm mt-1 opacity-90">
          {progressPercentage}% 완료
        </div>
      </div>

      {/* 메인 타이머 섹션 */}
      <div className="p-6">
        {/* 원형 타이머들 */}
        <div className="flex justify-center items-center gap-8 mb-6">
          {/* 현재 운동/휴식 타이머 */}
          <div className="text-center">
            <CircularProgress
              progress={getCurrentProgress()}
              timeLeft={getCurrentTimeLeft()}
              maxTime={isExercising ? maxExerciseTime : maxRestTime}
              label={getCurrentLabel()}
              color={getCurrentColor()}
            />
            <div className="mt-2 text-sm font-medium">
              {isExercising ? '운동 중' : isResting ? '휴식 중' : '대기 중'}
            </div>
          </div>

          {/* 총 운동 시간 */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-gray-500">총 운동시간</div>
          </div>
        </div>

        {/* 현재 운동 정보 */}
        {currentExercise && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-lg">{currentExercise.exercise_name}</h4>
                <p className="text-gray-600">
                  세트 {session.current_set} / {currentExercise.target_sets}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">목표</div>
                <div className="font-medium">
                  {currentExercise.target_reps} 회
                </div>
              </div>
            </div>

            {/* 입력 필드 - 운동 중일 때만 표시 */}
            {isExercising && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    완료한 횟수
                  </label>
                  <input
                    type="number"
                    value={currentReps}
                    onChange={(e) => setCurrentReps(e.target.value)}
                    placeholder={currentExercise.target_reps?.toString()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    무게 (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    placeholder="무게 입력"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* 수동 완료 버튼 - 운동 중일 때만 */}
            {isExercising && (
              <button
                onClick={handleAutoNextSet}
                disabled={isLoading}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 mb-3"
              >
                {session.current_set < currentExercise.target_sets 
                  ? `세트 ${session.current_set} 완료` 
                  : '운동 완료'}
              </button>
            )}

            {/* 휴식 건너뛰기 버튼 */}
            {isResting && (
              <button
                onClick={handleAutoEndRest}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium mb-3"
              >
                휴식 건너뛰기
              </button>
            )}
          </div>
        )}

        {/* 제어 버튼들 */}
        <div className="flex gap-3">
          <button
            onClick={() => handleManualControl(session.status === 'active' ? 'pause' : 'resume')}
            disabled={isLoading}
            className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
          >
            {session.status === 'active' ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-pause mr-2"></i>
                일시정지
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <i className="fas fa-play mr-2"></i>
                재개
              </span>
            )}
          </button>
          
          <button
            onClick={() => handleManualControl('complete')}
            disabled={isLoading}
            className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
          >
            <span className="flex items-center justify-center">
              <i className="fas fa-check mr-2"></i>
              완료
            </span>
          </button>
          
          <button
            onClick={() => handleManualControl('cancel')}
            disabled={isLoading}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
          >
            <span className="flex items-center justify-center">
              <i className="fas fa-times mr-2"></i>
              취소
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTimer;