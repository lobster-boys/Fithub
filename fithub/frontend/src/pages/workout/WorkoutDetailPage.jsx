import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useWorkoutData from '../../hooks/useWorkoutData';
import { useAuth } from '../../context/AuthContext';
import WorkoutTimer from '../../components/workouts/WorkoutTimer';

const WorkoutDetailPage = () => {
  const { workoutId, exerciseId } = useParams();
  const { user } = useAuth();
  const {
    // 데이터
    currentExercise,
    currentRoutine,
    exercises,
    logExercises,
    loading,
    error,
    
    // API 함수들
    fetchExerciseDetail,
    fetchRoutineDetail,
    fetchExercises,
    fetchLogExercises,
    updateRoutine,
    copyRoutine,
    
    // 상태 초기화 함수들
    clearCurrentExercise,
    clearCurrentRoutine,
    clearError
  } = useWorkoutData();

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [customRoutine, setCustomRoutine] = useState([]);
  const [showAdditionalExercises, setShowAdditionalExercises] = useState(false);
  const [showWorkoutTimer, setShowWorkoutTimer] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 상태 초기화
    clearCurrentExercise();
    clearCurrentRoutine();
    clearError();

    if (exerciseId) {
      // 개별 운동 상세 정보 로드
      fetchExerciseDetail(exerciseId);
    } else if (workoutId) {
      // 기존 워크아웃 루틴 상세 정보 로드
      fetchRoutineDetail(workoutId);
    }
  }, [workoutId, exerciseId]);

  // 루틴 데이터가 로드되면 커스텀 루틴에 설정
  useEffect(() => {
    if (currentRoutine) {
      console.log('CurrentRoutine 데이터:', currentRoutine);
      
      // exercises, routine_exercises 필드를 확인 (백엔드에서 다른 필드명으로 올 수 있음)
      const exercisesList = currentRoutine.exercises || currentRoutine.routine_exercises || [];
      console.log('운동 목록:', exercisesList);
      
      setCustomRoutine(exercisesList);
    }
  }, [currentRoutine]);

  // 추가 운동 목록 로드
  useEffect(() => {
    if (showAdditionalExercises && exercises.length === 0) {
      fetchExercises();
    }
  }, [showAdditionalExercises]);

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
  };

  // 내 루틴에 추가 (복사) 기능
  const handleCopyToMyRoutines = async () => {
    if (!currentRoutine) return;
    
    try {
      const result = await copyRoutine(currentRoutine.id);
      alert(`"${result.name}" 루틴이 내 루틴에 추가되었습니다!`);
    } catch (error) {
      console.error('루틴 복사 실패:', error);
      alert('루틴 복사에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleAddExercise = async (exercise) => {
    try {
      const newExercise = {
        exercise: exercise.id,
        sets: 3,
        reps: 10,
        order: customRoutine.length + 1
      };
      
      // 루틴에 운동 추가 (백엔드 API 호출)
      if (currentRoutine) {
        const updatedRoutineData = {
          routine_exercises: [...customRoutine, newExercise]
        };
        await updateRoutine(currentRoutine.id, updatedRoutineData);
        setCustomRoutine(prev => [...prev, { ...newExercise, exercise }]);
      } else {
        // 임시적으로 로컬 상태에만 추가 (새 루틴을 생성할 경우)
        setCustomRoutine(prev => [...prev, { ...newExercise, exercise }]);
      }
      
      setShowAdditionalExercises(false);
    } catch (err) {
      console.error('운동 추가 실패:', err);
      alert('운동 추가 중 오류가 발생했습니다.');
    }
  };

  const calculateTotalCalories = () => {
    // 운동 개수와 세트 수를 기반으로 칼로리 계산
    return customRoutine.reduce((total, exercise) => {
      const sets = exercise.sets || 3;
      const reps = exercise.reps || 10;
      // 간단한 칼로리 계산: 세트 수 × 반복 수 × 0.5
      return total + (sets * reps * 0.5);
    }, 0);
  };

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
      case '초급':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
      case '중급':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
      case '고급':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return '초급';
      case 'intermediate':
        return '중급';
      case 'advanced':
        return '고급';
      default:
        return difficulty || '미설정';
    }
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-primary border-t-transparent"></div>
          <p className="mt-2 text-gray-600">
            {exerciseId ? '운동 정보를 불러오는 중...' : '운동 루틴을 불러오는 중...'}
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center bg-red-50 p-6 rounded-lg">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-red-800 mb-2">오류 발생</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 개별 운동 상세 페이지 렌더링
  if (exerciseId && currentExercise) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        {/* 운동 상세 정보 헤더 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => window.history.back()}
              className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <h1 className="text-3xl font-bold">{currentExercise.name}</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 운동 이미지 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <img
                src={currentExercise.image_url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                alt={currentExercise.name}
                className="w-full h-64 lg:h-80 object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
                }}
              />
            </div>
            
            {/* 운동 정보 */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDifficultyStyle(currentExercise.difficulty_level)}`}>
                  {getDifficultyText(currentExercise.difficulty_level)}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">운동 타입</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700">
                      <span className="font-medium">{currentExercise.exercise_type || '미설정'}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">주요 근육군</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700">
                      <span className="font-medium">{currentExercise.primary_muscle_group || '미설정'}</span>
                    </p>
                  </div>
                </div>
                
                {currentExercise.description && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">운동 설명</h3>
                    <p className="text-gray-600 leading-relaxed">{currentExercise.description}</p>
                  </div>
                )}
                
                <div className="pt-4">
                  <button 
                    onClick={() => setShowWorkoutTimer(true)}
                    className="w-full bg-primary hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                  >
                    <i className="fas fa-play mr-2"></i>
                    운동 시작하기
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* 타이머 컴포넌트 - 개별 운동용 */}
          {showWorkoutTimer && (
            <div className="mt-8">
              <WorkoutTimer
                routineId={null} // 개별 운동이므로 루틴 ID 없음
                exerciseId={currentExercise.id}
                onSessionEnd={(session) => {
                  setShowWorkoutTimer(false);
                  alert('운동이 완료되었습니다! 수고하셨습니다.');
                }}
                onSessionError={(error) => {
                  console.error('세션 오류:', error);
                  alert('운동 세션 중 오류가 발생했습니다.');
                  setShowWorkoutTimer(false);
                }}
              />
            </div>
          )}

          {/* 운동 팁 및 주의사항 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-blue-800 mb-3">
                <i className="fas fa-lightbulb mr-2"></i>
                운동 팁
              </h3>
              <ul className="text-blue-700 space-y-2">
                <li>• 올바른 자세를 유지하세요</li>
                <li>• 호흡을 규칙적으로 하세요</li>
                <li>• 무리하지 말고 점진적으로 강도를 높이세요</li>
                <li>• 운동 전후 스트레칭을 잊지 마세요</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-red-800 mb-3">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                주의사항
              </h3>
              <ul className="text-red-700 space-y-2">
                <li>• 부상 방지를 위해 워밍업은 필수입니다</li>
                <li>• 통증이 있을 때는 즉시 중단하세요</li>
                <li>• 처음에는 가벼운 무게부터 시작하세요</li>
                <li>• 의문사항이 있으면 전문가에게 문의하세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 루틴이 로드되지 않았거나 존재하지 않는 경우
  if (workoutId && !currentRoutine) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center bg-yellow-50 p-6 rounded-lg">
          <i className="fas fa-search text-yellow-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-yellow-800 mb-2">루틴을 찾을 수 없습니다</h2>
          <p className="text-yellow-600 mb-4">요청하신 운동 루틴이 존재하지 않습니다.</p>
          <button 
            onClick={() => window.history.back()} 
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
          >
            이전 페이지로
          </button>
        </div>
      </div>
    );
  }

  // 운동 루틴 상세 페이지 렌더링
  if (workoutId && currentRoutine) {
    return (
      <div className="container mx-auto p-4">
        {/* 운동 상세 정보 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <h1 className="text-3xl font-bold">{currentRoutine.name}</h1>
            </div>
            
            {/* 내 루틴에 추가 버튼 - 다른 사람의 루틴인 경우에만 표시 */}
            {user && currentRoutine.user && currentRoutine.user.username !== user.username && (
              <button
                onClick={handleCopyToMyRoutines}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                내 루틴에 추가
              </button>
            )}
          </div>
          
          {/* 루틴 정보 표시 */}
          <div className="flex items-center mb-2">
            <span className={`px-3 py-1 rounded-full text-sm mr-2 ${getDifficultyStyle(currentRoutine.difficulty_level)}`}>
              {getDifficultyText(currentRoutine.difficulty_level)}
            </span>
            <span className="text-gray-600">
              예상 칼로리: {Math.round(calculateTotalCalories())} kcal
            </span>
            {currentRoutine.estimated_duration && (
              <span className="text-gray-600 ml-4">
                예상 시간: {currentRoutine.estimated_duration}분
              </span>
            )}
          </div>
          
          {/* 루틴 작성자 정보 */}
          {currentRoutine.user && (
            <div className="text-sm text-gray-600 mb-2">
              <i className="fas fa-user mr-1"></i>
              작성자: {currentRoutine.user.username}
            </div>
          )}
          
          {currentRoutine.description && (
            <p className="text-gray-700 mb-3">{currentRoutine.description}</p>
          )}
        </div>

        {/* 운동 시작 버튼 */}
        {!showWorkoutTimer && customRoutine && customRoutine.length > 0 && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowWorkoutTimer(true)}
              className="bg-gradient-to-r from-primary to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-primary transition-all transform hover:scale-105 shadow-lg"
            >
              <i className="fas fa-play mr-3"></i>
              운동 시작하기
            </button>
          </div>
        )}

        {/* 타이머 컴포넌트 */}
        {showWorkoutTimer && (
          <div className="mb-8">
            <WorkoutTimer
              routineId={currentRoutine.id}
              onSessionEnd={({ duration, session, workoutLog }) => {
                setShowWorkoutTimer(false);
                
                if (workoutLog) {
                  // 운동 로그 정보로 더 상세한 완료 메시지 표시
                  const exerciseCount = workoutLog.exercises?.length || 0;
                  const totalCalories = workoutLog.calories_burned || 0;
                  const durationMinutes = Math.round(duration / 60);
                  
                  alert(`🎉 운동 완료! 수고하셨습니다!\n\n` +
                        `📊 운동 결과:\n` +
                        `• 운동 시간: ${durationMinutes}분\n` +
                        `• 완료한 운동: ${exerciseCount}개\n` +
                        `• 소모 칼로리: ${totalCalories}kcal\n\n` +
                        `운동 로그가 자동으로 저장되었습니다.`);
                  
                  console.log('운동 완료 - 로그 저장됨:', workoutLog);
                } else {
                  alert('🎉 운동이 완료되었습니다! 수고하셨습니다.');
                }
              }}
              onSessionError={(error) => {
                console.error('세션 오류:', error);
                alert('운동 세션 중 오류가 발생했습니다.');
                setShowWorkoutTimer(false);
              }}
            />
          </div>
        )}

        {/* 기본 운동 루틴 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">운동 루틴</h2>
            <button 
              className="bg-primary text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
              onClick={() => setShowAdditionalExercises(!showAdditionalExercises)}
            >
              운동 추가하기
            </button>
          </div>
          
          {customRoutine && customRoutine.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customRoutine.map((routineExercise, index) => {
                // 데이터 구조 확인 및 안전한 접근
                console.log(`운동 ${index + 1} 데이터:`, routineExercise);
                
                // exercise 객체 추출 (여러 가능한 구조를 고려)
                const exercise = routineExercise.exercise || routineExercise;
                
                // 기본 정보 추출
                const exerciseName = exercise.name || exercise.exercise_name || `운동 ${index + 1}`;
                const exerciseId = exercise.id || routineExercise.exercise_id || index;
                const sets = routineExercise.sets || exercise.sets || 3;
                const reps = routineExercise.reps || exercise.reps || 10;
                const muscleGroup = exercise.muscle_groups || exercise.primary_muscle_group || exercise.target_muscle_group || '전신';
                const imageUrl = exercise.image_url || exercise.video_url || `https://picsum.photos/300/200?random=${exerciseId}`;
                
                return (
                  <div 
                    key={exerciseId} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleExerciseClick(routineExercise)}
                  >
                    <img 
                      src={imageUrl} 
                      alt={exerciseName}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{exerciseName}</h3>
                      <p className="text-gray-500 mb-1">
                        타겟: {muscleGroup}
                      </p>
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>{sets}세트 x {reps}회</span>
                        {routineExercise.rest_time && (
                          <span>휴식: {routineExercise.rest_time}초</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <i className="fas fa-dumbbell text-gray-400 text-4xl mb-4"></i>
              <p className="text-gray-600">아직 운동이 추가되지 않았습니다.</p>
              <button 
                className="mt-4 bg-primary text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors"
                onClick={() => setShowAdditionalExercises(true)}
              >
                운동 추가하기
              </button>
            </div>
          )}
        </div>

        {/* 추가 운동 선택 모달 */}
        {showAdditionalExercises && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">추가 운동 선택</h2>
                <button 
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setShowAdditionalExercises(false)}
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              {exercises.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {exercises.map((exercise) => (
                    <div 
                      key={exercise.id} 
                      className="border rounded-lg overflow-hidden hover:border-primary transition-colors"
                    >
                      <img 
                        src={exercise.image_url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'} 
                        alt={exercise.name}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                      <div className="p-3">
                        <h3 className="font-semibold">{exercise.name}</h3>
                        <p className="text-sm text-gray-500">{exercise.primary_muscle_group || '미설정'}</p>
                        <button 
                          className="mt-2 w-full bg-primary text-white py-1 rounded hover:bg-orange-600 transition-colors"
                          onClick={() => handleAddExercise(exercise)}
                        >
                          추가하기
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-gray-400 text-3xl mb-4"></i>
                  <p className="text-gray-600">운동 목록을 불러오는 중...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 선택된 운동 상세 정보 모달 */}
        {selectedExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {selectedExercise.exercise?.name || selectedExercise.name}
                </h2>
                <button 
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setSelectedExercise(null)}
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/2">
                  <img 
                    src={selectedExercise.exercise?.image_url || selectedExercise.image_url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'} 
                    alt={selectedExercise.exercise?.name || selectedExercise.name}
                    className="w-full h-auto rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                </div>
                <div className="md:w-1/2">
                  <div className="mb-4">
                    <h3 className="font-semibold mb-1">운동 정보</h3>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium">세트:</span> {selectedExercise.sets || 3}
                    </p>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium">반복:</span> {selectedExercise.reps || 10}
                    </p>
                    {selectedExercise.rest_time && (
                      <p className="text-gray-700 mb-2">
                        <span className="font-medium">휴식:</span> {selectedExercise.rest_time}초
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">타겟 부위</h3>
                    <p className="text-gray-700 mb-3">
                      {selectedExercise.exercise?.primary_muscle_group || selectedExercise.primary_muscle_group || '미설정'}
                    </p>
                    {(selectedExercise.exercise?.description || selectedExercise.description) && (
                      <>
                        <h3 className="font-semibold mb-1">운동 설명</h3>
                        <p className="text-gray-700">
                          {selectedExercise.exercise?.description || selectedExercise.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 기본 상태 (ID가 없거나 데이터 로딩 전)
  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
      <div className="text-center">
        <i className="fas fa-dumbbell text-gray-400 text-6xl mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">운동 상세 페이지</h2>
        <p className="text-gray-600">운동 ID 또는 루틴 ID를 선택해주세요.</p>
      </div>
    </div>
  );
};

export default WorkoutDetailPage; 