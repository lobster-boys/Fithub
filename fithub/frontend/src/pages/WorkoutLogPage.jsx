import React, { useState } from 'react';
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
      completed: true
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
      completed: true
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
      completed: true
    }
  ]);

  // 운동 로그 추가 상태 관리
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    duration: 0,
    exercises: []
  });
  
  // 새 운동 종목 추가 상태
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 0,
    reps: 0,
    weight: 0
  });

  // 운동 로그 추가 핸들러
  const handleAddWorkout = () => {
    setWorkoutLogs([
      ...workoutLogs,
      {
        id: workoutLogs.length + 1,
        ...newWorkout,
        calories: Math.floor(Math.random() * 200) + 200, // 샘플 칼로리 계산
        completed: true
      }
    ]);
    setShowAddForm(false);
    setNewWorkout({
      title: '',
      date: new Date().toISOString().split('T')[0],
      duration: 0,
      exercises: []
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

  return (
    <PageTransition>
      <div className="pb-6">
        <div className="flex justify-between items-center px-4 py-4 md:px-6 md:py-6">
          <h1 className="text-2xl md:text-3xl font-bold">내 운동 로그</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 flex items-center shadow-sm"
            aria-label="새 운동 기록 추가"
          >
            <i className="fas fa-plus mr-2"></i>
            <span className="hidden sm:inline">새 운동 기록</span>
            <span className="sm:hidden">추가</span>
          </button>
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

        {/* 운동 로그 목록 */}
        <div className="px-4 md:px-6">
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
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        운동 종목
                      </label>
                      <button
                        type="button"
                        className="text-sm text-primary hover:text-orange-600"
                        onClick={() => {
                          if (newExercise.name) handleAddExercise();
                        }}
                      >
                        <i className="fas fa-plus mr-1"></i> 추가
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {newWorkout.exercises.map((exercise, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded-lg text-sm">
                          {exercise.name} - {exercise.sets}세트 x {exercise.reps}회 ({exercise.weight}kg)
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-2 p-3 border border-gray-200 rounded-lg">
                      <input
                        type="text"
                        value={newExercise.name}
                        onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                        placeholder="운동 이름"
                      />
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">세트</label>
                          <input
                            type="number"
                            value={newExercise.sets}
                            onChange={(e) => setNewExercise({...newExercise, sets: parseInt(e.target.value)})}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">횟수</label>
                          <input
                            type="number"
                            value={newExercise.reps}
                            onChange={(e) => setNewExercise({...newExercise, reps: parseInt(e.target.value)})}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">무게(kg)</label>
                          <input
                            type="number"
                            value={newExercise.weight}
                            onChange={(e) => setNewExercise({...newExercise, weight: parseInt(e.target.value)})}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAddWorkout}
                    className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-orange-600"
                    disabled={!newWorkout.title || newWorkout.exercises.length === 0}
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default WorkoutLogPage; 