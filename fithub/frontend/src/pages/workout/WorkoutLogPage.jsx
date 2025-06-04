import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../../components/layout/PageTransition';
import useWorkoutData from '../../hooks/useWorkoutData';

const WorkoutLogPage = () => {
  const navigate = useNavigate();
  
  // 웹킷 스크롤바 숨기기 스타일 추가
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      #routines-carousel::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // 커스텀 훅으로 운동 데이터 관리
  const { 
    workoutLogs, 
    setWorkoutLogs, 
    addWorkoutLog, 
    getWeeklyStats, 
    getMonthlyStats 
  } = useWorkoutData();

  // 주간 및 월간 통계 데이터
  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();

  // 예시 루틴 데이터 - 상태를 최상단으로 이동
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
      image: 'https://picsum.photos/300/200?random=1'
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
      image: 'https://picsum.photos/300/200?random=2'
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
      image: 'https://picsum.photos/300/200?random=3'
    }
  ]);

  // 루틴 만들기 모달 상태
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [selectedWorkoutType, setSelectedWorkoutType] = useState('');
  const [showExercises, setShowExercises] = useState(false);
  
  // 루틴 생성 관련 상태
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineLevel, setRoutineLevel] = useState('초급');

  // 운동 로그 상세 보기 및 수정 모달 상태
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [editingLog, setEditingLog] = useState(null);

  // 캐러셀 상태 관리
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  // 캐러셀 스크롤 상태 확인
  const checkScrollButtons = () => {
    const container = document.getElementById('routines-carousel');
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  // 캐러셀 스크롤 함수
  const scrollCarousel = (direction) => {
    const container = document.getElementById('routines-carousel');
    if (container) {
      const scrollAmount = 300; // 카드 너비(280px) + gap(20px)
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      // 스크롤 완료 후 버튼 상태 업데이트
      setTimeout(checkScrollButtons, 300);
    }
  };

  // 컴포넌트 마운트 시 스크롤 버튼 상태 확인
  useEffect(() => {
    const container = document.getElementById('routines-carousel');
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons(); // 초기 상태 확인
      
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
      };
    }
  }, []); // 컴포넌트 마운트 시에만 실행

  // routines 변경 시 스크롤 버튼 상태 업데이트
  useEffect(() => {
    // DOM이 업데이트된 후 스크롤 상태 확인
    setTimeout(checkScrollButtons, 100);
  }, [routines]);

  // 부위별 운동 데이터
  const bodyParts = [
    { value: 'chest', label: '가슴' },
    { value: 'back', label: '등' },
    { value: 'shoulders', label: '어깨' },
    { value: 'arms', label: '팔' },
    { value: 'legs', label: '다리' },
    { value: 'core', label: '코어' },
    { value: 'fullbody', label: '전신' }
  ];

  const workoutTypes = [
    { value: 'ascending', label: '근력 증가 (Ascending)' },
    { value: 'descending', label: '근지구력 (Descending)' },
    { value: 'durability', label: '지구력 (Durability)' },
    { value: 'strength', label: '근력 (Strength)' },
    { value: 'performance', label: '퍼포먼스 (Performance)' }
  ];

  // 부위별 운동 목록
  const exercisesByBodyPart = {
    chest: [
      { id: 1, name: '벤치 프레스', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3-4', reps: '8-12', difficulty: '중급' },
      { id: 2, name: '푸시업', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '10-15', difficulty: '초급' },
      { id: 3, name: '덤벨 플라이', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '중급' },
      { id: 4, name: '딥스', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '8-12', difficulty: '중급' }
    ],
    back: [
      { id: 5, name: '풀업', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '5-10', difficulty: '고급' },
      { id: 6, name: '바벨 로우', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3-4', reps: '8-12', difficulty: '중급' },
      { id: 7, name: '랫 풀다운', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '10-12', difficulty: '초급' },
      { id: 8, name: '시티드 로우', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '10-15', difficulty: '초급' }
    ],
    shoulders: [
      { id: 9, name: '오버헤드 프레스', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3-4', reps: '8-12', difficulty: '중급' },
      { id: 10, name: '레터럴 레이즈', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '초급' },
      { id: 11, name: '리어 델트 플라이', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '초급' },
      { id: 12, name: '숄더 쉬러그', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '15-20', difficulty: '초급' }
    ],
    arms: [
      { id: 13, name: '바이셉 컬', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '초급' },
      { id: 14, name: '트라이셉 딥스', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '10-15', difficulty: '중급' },
      { id: 15, name: '해머 컬', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '초급' },
      { id: 16, name: '오버헤드 익스텐션', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '중급' }
    ],
    legs: [
      { id: 17, name: '스쿼트', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3-4', reps: '10-15', difficulty: '초급' },
      { id: 18, name: '런지', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '10-12', difficulty: '초급' },
      { id: 19, name: '데드리프트', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3-4', reps: '6-10', difficulty: '고급' },
      { id: 20, name: '레그 프레스', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '초급' }
    ],
    core: [
      { id: 21, name: '플랭크', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '30-60초', difficulty: '초급' },
      { id: 22, name: '크런치', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '15-20', difficulty: '초급' },
      { id: 23, name: '러시안 트위스트', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '20-30', difficulty: '중급' },
      { id: 24, name: '마운틴 클라이머', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '30초', difficulty: '중급' }
    ],
    fullbody: [
      { id: 25, name: '버피', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '10-15', difficulty: '중급' },
      { id: 26, name: '점프 스쿼트', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '중급' },
      { id: 27, name: '스러스터', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '10-12', difficulty: '고급' },
      { id: 28, name: '베어 크롤', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '30초', difficulty: '중급' }
    ]
  };

  // 운동 선택 핸들러
  const handleExerciseSelection = () => {
    if (selectedBodyPart && selectedWorkoutType) {
      setShowExercises(true);
    }
  };

  // 운동 체크박스 토글 핸들러
  const handleExerciseToggle = (exercise) => {
    setSelectedExercises(prev => {
      const isSelected = prev.some(ex => ex.id === exercise.id);
      if (isSelected) {
        return prev.filter(ex => ex.id !== exercise.id);
      } else {
        return [...prev, exercise];
      }
    });
  };

  // 선택된 운동 제거 핸들러
  const removeSelectedExercise = (exerciseId) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  // 루틴 생성 핸들러
  const handleCreateRoutine = () => {
    if (!routineTitle.trim() || selectedExercises.length === 0) {
      alert('루틴 제목과 최소 1개의 운동을 선택해주세요.');
      return;
    }

    const newRoutine = {
      id: routines.length + 1,
      title: routineTitle.trim(),
      level: routineLevel,
      duration: selectedExercises.length * 15, // 운동당 15분 예상
      exercises: selectedExercises.map(ex => ({
        name: ex.name,
        sets: parseInt(ex.sets.split('-')[0]) || 3,
        reps: parseInt(ex.reps.split('-')[0]) || 10
      })),
      targetMuscles: [bodyParts.find(p => p.value === selectedBodyPart)?.label],
      image: `https://picsum.photos/300/200?random=${routines.length + 1}`
    };

    setRoutines(prev => [...prev, newRoutine]);
    resetRoutineModal();
    alert('새 루틴이 성공적으로 생성되었습니다!');
  };

  // 모달 리셋
  const resetRoutineModal = () => {
    setShowRoutineModal(false);
    setSelectedBodyPart('');
    setSelectedWorkoutType('');
    setShowExercises(false);
    setSelectedExercises([]);
    setRoutineTitle('');
    setRoutineLevel('초급');
  };

  // 주간 데이터 계산 (차트용)
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

  // 운동 로그 추가 핸들러
  const handleAddWorkout = () => {
    const caloriesEstimate = newWorkout.exercises.length * 70 + newWorkout.duration * 5;
    
    const workoutToAdd = {
      ...newWorkout,
      calories: caloriesEstimate,
      completed: true
    };
    
    addWorkoutLog(workoutToAdd);
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

  // 운동 로그 상세 보기 핸들러
  const handleViewDetail = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  // 운동 로그 수정 핸들러
  const handleEditLog = (log) => {
    setEditingLog({ ...log });
    setShowEditModal(true);
  };

  // 운동 로그 수정 저장 핸들러
  const handleSaveEdit = () => {
    setWorkoutLogs(prev => 
      prev.map(log => 
        log.id === editingLog.id ? editingLog : log
      )
    );
    setShowEditModal(false);
    setEditingLog(null);
  };

  // 운동 로그 삭제 핸들러
  const handleDeleteLog = (logId) => {
    if (confirm('정말로 이 운동 기록을 삭제하시겠습니까?')) {
      setWorkoutLogs(prev => prev.filter(log => log.id !== logId));
      setShowDetailModal(false);
      setShowEditModal(false);
    }
  };

  // 수정 중인 운동 종목 업데이트
  const handleUpdateExercise = (index, field, value) => {
    const updatedExercises = [...editingLog.exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    setEditingLog({
      ...editingLog,
      exercises: updatedExercises
    });
  };

  // 수정 중인 운동 종목 삭제
  const handleRemoveExerciseFromEdit = (index) => {
    const updatedExercises = editingLog.exercises.filter((_, i) => i !== index);
    setEditingLog({
      ...editingLog,
      exercises: updatedExercises
    });
  };

  // 수정 중인 운동에 새 종목 추가
  const handleAddExerciseToEdit = () => {
    setEditingLog({
      ...editingLog,
      exercises: [
        ...editingLog.exercises,
        { name: '', sets: 3, reps: 10, weight: 0 }
      ]
    });
  };

  // 주간 및 월간 데이터 계산
  const { weeklyData, dayLabels } = getWeeklyData();

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
              onClick={() => setShowRoutineModal(true)}
              className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 flex items-center shadow-sm"
              aria-label="새 루틴 만들기"
            >
              <i className="fas fa-plus mr-2"></i>
              <span>루틴 만들기</span>
            </button>
          </div>
          
          {/* 루틴 캐러셀 */}
          <div className="relative">
            {/* 좌측 스크롤 버튼 */}
            <button
              onClick={() => scrollCarousel('left')}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-gray-600 hover:text-primary transition-colors ${!canScrollLeft && 'opacity-50 cursor-not-allowed'}`}
              style={{ marginLeft: '-20px' }}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            {/* 우측 스크롤 버튼 */}
            <button
              onClick={() => scrollCarousel('right')}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-gray-600 hover:text-primary transition-colors ${!canScrollRight && 'opacity-50 cursor-not-allowed'}`}
              style={{ marginRight: '-20px' }}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
            
            {/* 캐러셀 컨테이너 */}
            <div 
              id="routines-carousel"
              className="flex gap-5 overflow-x-auto scroll-smooth pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitScrollbar: { display: 'none' },
                scrollSnapType: 'x mandatory'
              }}
              onScroll={checkScrollButtons}
            >
              {routines.map((routine) => (
                <div 
                  key={routine.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex-shrink-0"
                  style={{ 
                    minWidth: '280px', 
                    width: '280px',
                    scrollSnapAlign: 'start'
                  }}
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
              
              {/* 새 루틴 추가 카드 */}
              <div 
                onClick={() => setShowRoutineModal(true)}
                className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors flex-shrink-0 cursor-pointer flex items-center justify-center"
                style={{ minWidth: '280px', width: '280px', height: '320px' }}
              >
                <div className="text-center text-gray-500">
                  <i className="fas fa-plus text-3xl mb-3"></i>
                  <p className="font-medium">새 루틴 만들기</p>
                  <p className="text-sm">나만의 운동 루틴을 추가하세요</p>
                </div>
              </div>
            </div>
            
            {/* 스크롤 인디케이터 (모바일에서만 표시) */}
            <div className="md:hidden flex justify-center mt-4 space-x-2">
              {Array.from({ length: Math.ceil((routines.length + 1) / 2) }).map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-gray-300"
                ></div>
              ))}
            </div>
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
                    <button 
                      onClick={() => handleViewDetail(log)}
                      className="flex-1 py-3 text-sm text-center text-primary hover:bg-orange-50 transition-colors"
                    >
                      상세 보기
                    </button>
                    <button 
                      onClick={() => handleEditLog(log)}
                      className="flex-1 py-3 text-sm text-center text-primary hover:bg-orange-50 transition-colors border-l border-gray-100"
                    >
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

        {/* 루틴 만들기 모달 */}
        {showRoutineModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl overflow-hidden w-full max-w-6xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="text-xl font-bold">새 루틴 만들기</h3>
                <button
                  onClick={resetRoutineModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden flex">
                {!showExercises ? (
                  <div className="w-full p-6">
                    <div className="max-w-md mx-auto space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          루틴 제목
                        </label>
                        <input
                          type="text"
                          value={routineTitle}
                          onChange={(e) => setRoutineTitle(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="나만의 운동 루틴 이름을 입력하세요"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          난이도 설정
                        </label>
                        <select
                          value={routineLevel}
                          onChange={(e) => setRoutineLevel(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="초급">초급</option>
                          <option value="중급">중급</option>
                          <option value="고급">고급</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          타겟 부위 선택
                        </label>
                        <select
                          value={selectedBodyPart}
                          onChange={(e) => setSelectedBodyPart(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="">부위를 선택하세요</option>
                          {bodyParts.map((part) => (
                            <option key={part.value} value={part.value}>
                              {part.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          운동 방법 선택
                        </label>
                        <select
                          value={selectedWorkoutType}
                          onChange={(e) => setSelectedWorkoutType(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="">운동 방법을 선택하세요</option>
                          {workoutTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <button
                        onClick={handleExerciseSelection}
                        disabled={!selectedBodyPart || !selectedWorkoutType}
                        className={`w-full py-3 rounded-lg font-medium ${
                          selectedBodyPart && selectedWorkoutType
                            ? 'bg-primary hover:bg-orange-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        운동 선택하기
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full">
                    {/* 왼쪽: 운동 선택 영역 */}
                    <div className="flex-1 p-4 border-r border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold">
                          {bodyParts.find(p => p.value === selectedBodyPart)?.label} 운동 선택
                        </h4>
                        <button
                          onClick={() => setShowExercises(false)}
                          className="text-primary hover:text-orange-600 font-medium"
                        >
                          <i className="fas fa-arrow-left mr-1"></i>
                          뒤로 가기
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                        {exercisesByBodyPart[selectedBodyPart]?.map((exercise) => {
                          const isSelected = selectedExercises.some(ex => ex.id === exercise.id);
                          return (
                            <div
                              key={exercise.id}
                              onClick={() => handleExerciseToggle(exercise)}
                              className={`relative bg-white border-2 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                                isSelected ? 'border-primary bg-orange-50' : 'border-gray-200'
                              }`}
                            >
                              {/* 체크박스 */}
                              <div className="absolute top-2 left-2 z-10">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                  isSelected 
                                    ? 'bg-primary border-primary text-white' 
                                    : 'bg-white border-gray-300'
                                }`}>
                                  {isSelected && <i className="fas fa-check text-xs"></i>}
                                </div>
                              </div>
                              
                              <div className="aspect-square overflow-hidden">
                                <img
                                  src={exercise.image}
                                  alt={exercise.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="p-3">
                                <h5 className="font-bold text-sm mb-1">{exercise.name}</h5>
                                <p className="text-xs text-gray-600 mb-1">
                                  {exercise.sets}세트 × {exercise.reps}회
                                </p>
                                <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                                  exercise.difficulty === '초급' 
                                    ? 'bg-green-100 text-green-800'
                                    : exercise.difficulty === '중급'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {exercise.difficulty}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* 오른쪽: 선택된 운동 및 루틴 생성 영역 */}
                    <div className="w-96 p-4 bg-gray-50 flex flex-col">
                      <div className="mb-4">
                        <h4 className="text-lg font-bold mb-2">선택된 운동</h4>
                        <div className="bg-white rounded-lg p-3 mb-3">
                          <div className="text-sm text-gray-600 mb-1">루틴 제목</div>
                          <div className="font-medium">{routineTitle || '제목 없음'}</div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        {selectedExercises.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <i className="fas fa-dumbbell text-3xl mb-2 opacity-50"></i>
                            <p>운동을 선택해주세요</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-80 overflow-y-auto">
                            {selectedExercises.map((exercise, index) => (
                              <div key={exercise.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm">{exercise.name}</div>
                                    <div className="text-xs text-gray-600">
                                      {exercise.sets}세트 × {exercise.reps}회
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeSelectedExercise(exercise.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex justify-between text-sm">
                            <span>총 운동 개수:</span>
                            <span className="font-bold">{selectedExercises.length}개</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>예상 시간:</span>
                            <span className="font-bold">{selectedExercises.length * 15}분</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={handleCreateRoutine}
                          disabled={!routineTitle.trim() || selectedExercises.length === 0}
                          className={`w-full py-3 rounded-lg font-medium ${
                            routineTitle.trim() && selectedExercises.length > 0
                              ? 'bg-primary hover:bg-orange-600 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          루틴 생성하기
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 운동 로그 상세 보기 모달 */}
        {showDetailModal && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold">운동 기록 상세</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {/* 기본 정보 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-bold mb-3">{selectedLog.title}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">운동 날짜</span>
                      <p className="font-medium">{selectedLog.date}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">운동 시간</span>
                      <p className="font-medium">{selectedLog.duration}분</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">소모 칼로리</span>
                      <p className="font-medium">{selectedLog.calories} kcal</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">운동 타입</span>
                      <p className="font-medium">{selectedLog.type || '일반 운동'}</p>
                    </div>
                  </div>
                </div>

                {/* 운동 상세 내역 */}
                <div>
                  <h4 className="text-lg font-bold mb-4">운동 내역</h4>
                  <div className="space-y-3">
                    {selectedLog.exercises.map((exercise, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-gray-800">{exercise.name}</h5>
                          <span className="text-sm bg-primary text-white px-2 py-1 rounded-full">
                            {index + 1}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          {exercise.duration ? (
                            <>
                              <div>
                                <span className="text-gray-600">시간</span>
                                <p className="font-medium">{exercise.duration}분</p>
                              </div>
                              <div>
                                <span className="text-gray-600">거리</span>
                                <p className="font-medium">{exercise.distance}km</p>
                              </div>
                              <div>
                                <span className="text-gray-600">평균 속도</span>
                                <p className="font-medium">{exercise.speed || '-'}km/h</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="text-gray-600">세트</span>
                                <p className="font-medium">{exercise.sets}세트</p>
                              </div>
                              <div>
                                <span className="text-gray-600">반복</span>
                                <p className="font-medium">{exercise.reps}회</p>
                              </div>
                              <div>
                                <span className="text-gray-600">중량</span>
                                <p className="font-medium">{exercise.weight}kg</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={() => handleEditLog(selectedLog)}
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i>
                  수정하기
                </button>
                <button
                  onClick={() => handleDeleteLog(selectedLog.id)}
                  className="bg-red-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i>
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 운동 로그 수정 모달 */}
        {showEditModal && editingLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold">운동 기록 수정</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {/* 기본 정보 수정 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-bold mb-4">기본 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">운동 제목</label>
                      <input
                        type="text"
                        value={editingLog.title}
                        onChange={(e) => setEditingLog({...editingLog, title: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">운동 날짜</label>
                      <input
                        type="date"
                        value={editingLog.date}
                        onChange={(e) => setEditingLog({...editingLog, date: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">운동 시간 (분)</label>
                      <input
                        type="number"
                        value={editingLog.duration}
                        onChange={(e) => setEditingLog({...editingLog, duration: parseInt(e.target.value)})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">운동 타입</label>
                      <select
                        value={editingLog.type || '근력 운동'}
                        onChange={(e) => setEditingLog({...editingLog, type: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="근력 운동">근력 운동</option>
                        <option value="유산소">유산소</option>
                        <option value="요가">요가</option>
                        <option value="필라테스">필라테스</option>
                        <option value="스트레칭">스트레칭</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 운동 종목 수정 */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-bold">운동 종목</h4>
                    <button
                      onClick={handleAddExerciseToEdit}
                      className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      종목 추가
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {editingLog.exercises.map((exercise, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-bold text-gray-800">운동 #{index + 1}</h5>
                          <button
                            onClick={() => handleRemoveExerciseFromEdit(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">운동명</label>
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={(e) => handleUpdateExercise(index, 'name', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="운동명"
                            />
                          </div>
                          
                          {exercise.duration ? (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">시간 (분)</label>
                                <input
                                  type="number"
                                  value={exercise.duration}
                                  onChange={(e) => handleUpdateExercise(index, 'duration', parseInt(e.target.value))}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">거리 (km)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={exercise.distance || 0}
                                  onChange={(e) => handleUpdateExercise(index, 'distance', parseFloat(e.target.value))}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">속도 (km/h)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={exercise.speed || 0}
                                  onChange={(e) => handleUpdateExercise(index, 'speed', parseFloat(e.target.value))}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">세트</label>
                                <input
                                  type="number"
                                  value={exercise.sets}
                                  onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value))}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">반복</label>
                                <input
                                  type="number"
                                  value={exercise.reps}
                                  onChange={(e) => handleUpdateExercise(index, 'reps', parseInt(e.target.value))}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">중량 (kg)</label>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={exercise.weight}
                                  onChange={(e) => handleUpdateExercise(index, 'weight', parseFloat(e.target.value))}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDeleteLog(editingLog.id)}
                    className="bg-red-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    <i className="fas fa-trash mr-2"></i>
                    삭제
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    <i className="fas fa-save mr-2"></i>
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