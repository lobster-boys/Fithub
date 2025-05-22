import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/layout/PageTransition';

const WorkoutLogPage = () => {
  // 예시 운동 로그 데이터
  const [workoutLogs, setWorkoutLogs] = useState([
    {
      id: 1,
      date: '2023-05-15',
      title: '상체 운동',
      duration: 45,
      exercises: [
        { name: '벤치 프레스', sets: 3, reps: 10, weight: 60 },
        { name: '덤벨 숄더 프레스', sets: 3, reps: 12, weight: 16 },
        { name: '랫 풀다운', sets: 3, reps: 12, weight: 50 }
      ],
      calories: 320,
      completed: true,
      type: '근력 운동'
    },
    {
      id: 2,
      date: '2023-05-17',
      title: '하체 운동',
      duration: 50,
      exercises: [
        { name: '스쿼트', sets: 4, reps: 8, weight: 80 },
        { name: '레그 프레스', sets: 3, reps: 12, weight: 120 },
        { name: '레그 익스텐션', sets: 3, reps: 15, weight: 40 }
      ],
      calories: 380,
      completed: true,
      type: '근력 운동'
    },
    {
      id: 3,
      date: '2023-05-19',
      title: '유산소 운동',
      duration: 30,
      exercises: [
        { name: '러닝', duration: 30, distance: 5 }
      ],
      calories: 250,
      completed: true,
      type: '유산소'
    }
  ]);

  // 예시 루틴 데이터
  const [routines, setRoutines] = useState([
    {
      id: 1,
      title: '상체 중점 루틴',
      level: '중급',
      duration: 60,
      exercises: [
        { name: '벤치 프레스', sets: 4, reps: 8 },
        { name: '바벨 로우', sets: 4, reps: 10 },
        { name: '오버헤드 프레스', sets: 3, reps: 12 }
      ],
      targetMuscles: ['가슴', '등', '어깨'],
      image: 'https://via.placeholder.com/300x200?text=상체운동'
    },
    {
      id: 2,
      title: '하체 강화 루틴',
      level: '초급',
      duration: 45,
      exercises: [
        { name: '스쿼트', sets: 3, reps: 12 },
        { name: '런지', sets: 3, reps: 10 },
        { name: '레그 프레스', sets: 3, reps: 15 }
      ],
      targetMuscles: ['대퇴사두', '둔근', '햄스트링'],
      image: 'https://via.placeholder.com/300x200?text=하체운동'
    },
    {
      id: 3,
      title: '전신 순환 루틴',
      level: '중급',
      duration: 50,
      exercises: [
        { name: '버피', sets: 3, reps: 15 },
        { name: '마운틴 클라이머', sets: 3, reps: '30초' },
        { name: '점프 스쿼트', sets: 3, reps: 12 }
      ],
      targetMuscles: ['전신', '심폐지구력'],
      image: 'https://via.placeholder.com/300x200?text=전신운동'
    }
  ]);

  // 운동 로그 추가 상태 관리
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    duration: 0,
    exercises: [],
    type: '근력 운동' // 기본값
  });
  
  // 새 운동 종목 추가 상태
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 0,
    reps: 0,
    weight: 0
  });

  // 로그 필터 상태
  const [logPeriod, setLogPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly'

  // 주간 데이터 계산
  const getWeeklyData = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ...
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // 월요일로 설정
    
    const weeklyData = Array(7).fill(0);
    const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
    
    workoutLogs.forEach(log => {
      const logDate = new Date(log.date);
      const diffTime = logDate.getTime() - weekStart.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 7) {
        weeklyData[diffDays] += log.duration;
      }
    });
    
    return { weeklyData, dayLabels };
  };

  // 월간 통계 계산
  const getMonthlyStats = () => {
    // 운동 타입별 분류
    const typeDistribution = {
      '근력 운동': 0,
      '유산소': 0,
      '유연성': 0
    };
    
    let totalWorkouts = 0;
    let totalCalories = 0;
    
    workoutLogs.forEach(log => {
      totalWorkouts += 1;
      totalCalories += log.calories;
      
      if (log.type) {
        typeDistribution[log.type] = (typeDistribution[log.type] || 0) + 1;
      }
    });
    
    // 퍼센티지 계산
    const total = Object.values(typeDistribution).reduce((sum, val) => sum + val, 0);
    const typePercentages = {};
    
    for (const [key, value] of Object.entries(typeDistribution)) {
      typePercentages[key] = total > 0 ? Math.round((value / total) * 100) : 0;
    }
    
    // 목표 계산 (예: 월 20회 운동 목표)
    const targetWorkouts = 20;
    const completionRate = Math.min(Math.round((totalWorkouts / targetWorkouts) * 100), 100);
    
    return {
      typePercentages,
      totalWorkouts,
      completionRate,
      totalCalories
    };
  };

  // 운동 로그 추가 핸들러
  const handleAddWorkout = () => {
    const caloriesEstimate = newWorkout.exercises.length * 70 + newWorkout.duration * 5;
    
    setWorkoutLogs([
      ...workoutLogs,
      {
        id: workoutLogs.length + 1,
        ...newWorkout,
        calories: caloriesEstimate,
        completed: true
      }
    ]);
    setShowAddForm(false);
    setNewWorkout({
      title: '',
      date: new Date().toISOString().split('T')[0],
      duration: 0,
      exercises: [],
      type: '근력 운동'
    });
  };

  // 운동 종목 추가 핸들러
  const handleAddExercise = () => {
    setNewWorkout({
      ...newWorkout,
      exercises: [...newWorkout.exercises, newExercise]
    });
    setNewExercise({
      name: '',
      sets: 0,
      reps: 0,
      weight: 0
    });
  };

  // 주간 및 월간 데이터 계산
  const { weeklyData, dayLabels } = getWeeklyData();
  const monthlyStats = getMonthlyStats();

  return (
    <PageTransition>
      <div className="pb-6">
        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center px-4 py-4 md:px-6 md:py-6 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">운동 관리</h1>
        </div>

        {/* 통계 요약 - 모바일에서는 스크롤 가능 */}
        <div className="px-4 md:px-6 mb-6 overflow-x-auto">
          <div className="flex md:grid md:grid-cols-4 gap-4 min-w-max md:min-w-0">
            <div className="bg-white p-4 rounded-xl shadow-sm min-w-[140px] w-full">
              <p className="text-gray-600 mb-1">총 운동 시간</p>
              <p className="text-2xl font-bold">
                {workoutLogs.reduce((total, log) => total + log.duration, 0)} 분
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm min-w-[140px] w-full">
              <p className="text-gray-600 mb-1">이번 주 운동</p>
              <p className="text-2xl font-bold">{workoutLogs.length} 회</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm min-w-[140px] w-full">
              <p className="text-gray-600 mb-1">소모 칼로리</p>
              <p className="text-2xl font-bold">
                {workoutLogs.reduce((total, log) => total + log.calories, 0)} kcal
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm min-w-[140px] w-full">
              <p className="text-gray-600 mb-1">완료율</p>
              <p className="text-2xl font-bold">100%</p>
            </div>
          </div>
        </div>

        {/* 루틴 관리 섹션 */}
        <div className="px-4 md:px-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">내 운동 루틴</h2>
            <button
              className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 flex items-center shadow-sm"
              aria-label="새 루틴 만들기"
            >
              <i className="fas fa-plus mr-2"></i>
              <span>루틴 만들기</span>
            </button>
          </div>
          
          {/* 루틴 카드 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {routines.map((routine) => (
              <div 
                key={routine.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img 
                  src={routine.image}
                  alt={routine.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold">{routine.title}</h3>
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                      {routine.level}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    <i className="far fa-clock mr-1"></i> {routine.duration}분 운동
                  </p>
                  
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">주요 운동:</h4>
                    <ul className="text-sm text-gray-600">
                      {routine.exercises.slice(0, 2).map((exercise, idx) => (
                        <li key={idx} className="mb-1">- {exercise.name} ({exercise.sets}세트 x {exercise.reps}회)</li>
                      ))}
                      {routine.exercises.length > 2 && (
                        <li className="text-gray-500">+ {routine.exercises.length - 2}개 더...</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {routine.targetMuscles.map((muscle, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {muscle}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between">
                    <Link
                      to={`/workouts/${routine.id}`}
                      className="text-primary hover:text-primary-dark font-medium text-sm"
                    >
                      자세히 보기
                    </Link>
                    <button className="text-primary hover:text-primary-dark font-medium text-sm">
                      시작하기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 운동 로그 섹션 */}
        <div className="px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
            <h2 className="text-xl font-bold">운동 로그</h2>
            
            <div className="flex items-center">
              {/* 로그 추가 버튼 */}
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 flex items-center shadow-sm mr-3"
                aria-label="새 운동 기록 추가"
              >
                <i className="fas fa-plus mr-2"></i>
                <span>기록 추가</span>
              </button>
              
              {/* 기간 필터 */}
              <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <button 
                  className={`px-3 py-2 text-sm ${logPeriod === 'daily' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setLogPeriod('daily')}
                >
                  일별
                </button>
                <button 
                  className={`px-3 py-2 text-sm border-l border-gray-300 ${logPeriod === 'weekly' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setLogPeriod('weekly')}
                >
                  주별
                </button>
                <button 
                  className={`px-3 py-2 text-sm border-l border-gray-300 ${logPeriod === 'monthly' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setLogPeriod('monthly')}
                >
                  월별
                </button>
              </div>
            </div>
          </div>

          {/* 로그 기간별 표시 */}
          {logPeriod === 'daily' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {workoutLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">{log.date}</span>
                      <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full">
                        완료
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">{log.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <i className="fas fa-clock mr-1"></i>
                      <span>{log.duration} 분</span>
                      <i className="fas fa-fire ml-3 mr-1"></i>
                      <span>{log.calories} kcal</span>
                      {log.type && (
                        <>
                          <i className="fas fa-tag ml-3 mr-1"></i>
                          <span>{log.type}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">운동 내역</h4>
                    <ul className="space-y-2">
                      {log.exercises.map((exercise, index) => (
                        <li key={index} className="text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{exercise.name}</span>
                            {exercise.duration ? (
                              <span>{exercise.duration}분 ({exercise.distance}km)</span>
                            ) : (
                              <span>{exercise.sets} x {exercise.reps} ({exercise.weight}kg)</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex border-t border-gray-100">
                    <button className="flex-1 py-3 text-sm text-center text-primary hover:bg-orange-50 transition-colors">
                      상세 보기
                    </button>
                    <button className="flex-1 py-3 text-sm text-center text-primary hover:bg-orange-50 transition-colors border-l border-gray-100">
                      수정
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {logPeriod === 'weekly' && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-medium mb-4">이번 주 운동 통계</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="grid grid-cols-7 w-full h-full gap-2">
                  {dayLabels.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="text-sm text-gray-500 mb-2">{day}</div>
                      <div className="flex-1 w-full bg-gray-100 rounded-lg relative">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-primary rounded-lg"
                          style={{ 
                            height: `${weeklyData[idx] ? Math.min(weeklyData[idx] / 90 * 100, 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs font-medium">
                        {weeklyData[idx] ? `${weeklyData[idx]}분` : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-4">
                <h4 className="text-md font-medium mb-3">이번 주 기록</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600 mb-1">총 운동 시간</div>
                    <div className="text-xl font-bold">
                      {weeklyData.reduce((sum, time) => sum + time, 0)}분
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600 mb-1">운동 일수</div>
                    <div className="text-xl font-bold">
                      {weeklyData.filter(time => time > 0).length}일
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600 mb-1">평균 운동 시간</div>
                    <div className="text-xl font-bold">
                      {weeklyData.filter(time => time > 0).length > 0 
                        ? Math.round(weeklyData.reduce((sum, time) => sum + time, 0) / weeklyData.filter(time => time > 0).length) 
                        : 0}분
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {logPeriod === 'monthly' && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-medium mb-4">이번 달 운동 요약</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium mb-3">운동 타입 분포</h4>
                  <div className="h-48 flex items-center justify-center">
                    <div className="w-full flex items-end h-full justify-around">
                      {Object.entries(monthlyStats.typePercentages).map(([type, percentage], idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div 
                            className={`w-16 rounded-t-lg ${idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-orange-300' : 'bg-orange-200'}`} 
                            style={{ height: `${percentage}%` }}
                          ></div>
                          <div className="mt-2 text-xs">{type}</div>
                          <div className="text-sm font-medium">{percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium mb-3">총 운동 통계</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">총 운동 일수</span>
                        <span className="font-medium">{monthlyStats.totalWorkouts}일</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(monthlyStats.totalWorkouts / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">목표 달성률</span>
                        <span className="font-medium">{monthlyStats.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${monthlyStats.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">총 소모 칼로리</span>
                        <span className="font-medium">{monthlyStats.totalCalories.toLocaleString()} kcal</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${Math.min((monthlyStats.totalCalories / 10000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 운동 추가 모달 - 모바일에서는 전체 화면 */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl overflow-hidden w-full max-w-md max-h-[90vh] md:max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="text-xl font-bold">새 운동 기록</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      운동 제목
                    </label>
                    <input
                      type="text"
                      value={newWorkout.title}
                      onChange={(e) => setNewWorkout({...newWorkout, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="예: 상체 운동, 러닝 등"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      운동 날짜
                    </label>
                    <input
                      type="date"
                      value={newWorkout.date}
                      onChange={(e) => setNewWorkout({...newWorkout, date: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      운동 시간 (분)
                    </label>
                    <input
                      type="number"
                      value={newWorkout.duration}
                      onChange={(e) => setNewWorkout({...newWorkout, duration: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="60"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      운동 유형
                    </label>
                    <select
                      value={newWorkout.type}
                      onChange={(e) => setNewWorkout({...newWorkout, type: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="근력 운동">근력 운동</option>
                      <option value="유산소">유산소</option>
                      <option value="유연성">유연성</option>
                    </select>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        운동 종목
                      </label>
                      <span className="text-xs text-gray-500">
                        {newWorkout.exercises.length}개 종목 추가됨
                      </span>
                    </div>

                    {newWorkout.exercises.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <ul className="space-y-2">
                          {newWorkout.exercises.map((ex, idx) => (
                            <li key={idx} className="text-sm flex justify-between">
                              <span>{ex.name}</span>
                              <span>{ex.sets} x {ex.reps} ({ex.weight}kg)</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="border border-gray-300 rounded-lg p-3 bg-white">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            종목명
                          </label>
                          <input
                            type="text"
                            value={newExercise.name}
                            onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="벤치 프레스"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            무게(kg)
                          </label>
                          <input
                            type="number"
                            value={newExercise.weight}
                            onChange={(e) => setNewExercise({...newExercise, weight: parseInt(e.target.value)})}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="60"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            세트
                          </label>
                          <input
                            type="number"
                            value={newExercise.sets}
                            onChange={(e) => setNewExercise({...newExercise, sets: parseInt(e.target.value)})}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="3"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            반복 횟수
                          </label>
                          <input
                            type="number"
                            value={newExercise.reps}
                            onChange={(e) => setNewExercise({...newExercise, reps: parseInt(e.target.value)})}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="10"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleAddExercise}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1 rounded"
                      >
                        + 종목 추가
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleAddWorkout}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-lg font-medium"
                >
                  운동 기록 저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default WorkoutLogPage; 