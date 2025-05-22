import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// 임시 데이터 (실제로는 API에서 가져올 내용)
const WORKOUT_DATA = {
  1: {
    id: 1,
    title: '초보자용 전신 운동',
    level: '초급',
    description: '전신 근력 강화와 기초 체력 향상을 위한 운동 루틴입니다.',
    targetCalories: 250,
    targetMuscles: ['가슴', '등', '하체', '코어'],
    exercises: [
      {
        id: 101,
        name: '푸쉬업',
        image: 'https://via.placeholder.com/300x200?text=푸쉬업',
        sets: 3,
        reps: 10,
        restTime: 60,
        targetMuscle: '가슴, 삼두',
        description: '가슴과 삼두를 주로 사용하는 기초 상체 운동입니다. 어깨 너비로 손을 바닥에 대고 몸을 일직선으로 유지하며 팔을 굽혔다 펴는 동작을 반복합니다.'
      },
      {
        id: 102,
        name: '스쿼트',
        image: 'https://via.placeholder.com/300x200?text=스쿼트',
        sets: 3,
        reps: 15,
        restTime: 60,
        targetMuscle: '하체',
        description: '하체 전체를 강화하는 기본 운동입니다. 어깨 너비로 발을 벌리고 엉덩이를 뒤로 빼며 무릎을 굽혀 앉았다가 일어나는 동작을 반복합니다.'
      },
      {
        id: 103,
        name: '플랭크',
        image: 'https://via.placeholder.com/300x200?text=플랭크',
        sets: 3,
        reps: '30초',
        restTime: 45,
        targetMuscle: '코어',
        description: '코어 근육을 강화하는 정적 운동입니다. 팔꿈치와 발끝으로 몸을 지탱하며 몸을 일직선으로 유지합니다.'
      }
    ]
  },
  2: {
    id: 2,
    title: '중급자용 상체 집중 운동',
    level: '중급',
    description: '가슴, 등, 어깨를 집중적으로 발달시키는 루틴입니다.',
    targetCalories: 400,
    targetMuscles: ['가슴', '등', '어깨', '삼두'],
    exercises: [
      {
        id: 201,
        name: '벤치 프레스',
        image: 'https://via.placeholder.com/300x200?text=벤치프레스',
        sets: 4,
        reps: 12,
        restTime: 90,
        targetMuscle: '가슴, 삼두',
        description: '가슴을 주로 발달시키는 상체 운동입니다. 벤치에 누워 바벨을 가슴까지 내렸다가 다시 위로 밀어올리는 동작을 반복합니다.'
      },
      {
        id: 202,
        name: '랫 풀다운',
        image: 'https://via.placeholder.com/300x200?text=랫풀다운',
        sets: 4,
        reps: 12,
        restTime: 90,
        targetMuscle: '등, 이두',
        description: '등을 넓게 발달시키는 운동입니다. 랫 풀다운 머신에 앉아 바를 가슴 쪽으로 당겨내리는 동작을 반복합니다.'
      }
    ]
  }
};

// 추가 가능한 운동 목록
const ADDITIONAL_EXERCISES = [
  {
    id: 301,
    name: '덤벨 컬',
    image: 'https://via.placeholder.com/200x150?text=덤벨컬',
    targetMuscle: '이두',
    description: '이두근을 발달시키는 고립 운동입니다.'
  },
  {
    id: 302,
    name: '바벨 컬',
    image: 'https://via.placeholder.com/200x150?text=바벨컬',
    targetMuscle: '이두',
    description: '바벨을 이용하여 이두근을 발달시키는 운동입니다.'
  },
  {
    id: 303,
    name: '데드리프트',
    image: 'https://via.placeholder.com/200x150?text=데드리프트',
    targetMuscle: '전신, 특히 등과 하체',
    description: '전신을 사용하는 복합 운동으로 특히 등과 하체를 발달시킵니다.'
  },
  {
    id: 304,
    name: '삼두 푸쉬다운',
    image: 'https://via.placeholder.com/200x150?text=삼두푸쉬다운',
    targetMuscle: '삼두',
    description: '삼두근을 집중적으로 발달시키는 고립 운동입니다.'
  }
];

const WorkoutDetailPage = () => {
  const { workoutId } = useParams();
  const [workout, setWorkout] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [customRoutine, setCustomRoutine] = useState([]);
  const [showAdditionalExercises, setShowAdditionalExercises] = useState(false);

  useEffect(() => {
    // 실제로는 API 호출로 대체됩니다
    const fetchedWorkout = WORKOUT_DATA[workoutId] || WORKOUT_DATA[1];
    setWorkout(fetchedWorkout);
    setCustomRoutine(fetchedWorkout.exercises);
  }, [workoutId]);

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleAddExercise = (exercise) => {
    const newExercise = {
      ...exercise,
      sets: 3,
      reps: 10,
      restTime: 60
    };
    setCustomRoutine([...customRoutine, newExercise]);
    setShowAdditionalExercises(false);
  };

  const calculateTotalCalories = () => {
    // 간단한 예시: 각 운동당 일정 칼로리를 소모한다고 가정
    return customRoutine.length * 80;
  };

  if (!workout) {
    return <div className="container mx-auto p-4">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* 운동 상세 정보 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{workout.title}</h1>
        <div className="flex items-center mb-2">
          <span className="bg-primary text-white px-3 py-1 rounded-full text-sm mr-2">
            {workout.level}
          </span>
          <span className="text-gray-600">
            타겟 칼로리: {calculateTotalCalories()} kcal
          </span>
        </div>
        <p className="text-gray-700">{workout.description}</p>
        
        <div className="mt-3">
          <h3 className="font-semibold text-gray-800">주요 타겟 부위:</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {workout.targetMuscles.map((muscle, index) => (
              <span key={index} className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                {muscle}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 기본 운동 루틴 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">운동 루틴</h2>
          <button 
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
            onClick={() => setShowAdditionalExercises(!showAdditionalExercises)}
          >
            운동 추가하기
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customRoutine.map((exercise) => (
            <div 
              key={exercise.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleExerciseClick(exercise)}
            >
              <img 
                src={exercise.image} 
                alt={exercise.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{exercise.name}</h3>
                <p className="text-gray-500 mb-1">타겟: {exercise.targetMuscle}</p>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>{exercise.sets}세트 x {exercise.reps}회</span>
                  <span>휴식: {exercise.restTime}초</span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ADDITIONAL_EXERCISES.map((exercise) => (
                <div 
                  key={exercise.id} 
                  className="border rounded-lg overflow-hidden hover:border-primary"
                >
                  <img 
                    src={exercise.image} 
                    alt={exercise.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <p className="text-sm text-gray-500">{exercise.targetMuscle}</p>
                    <button 
                      className="mt-2 w-full bg-primary text-white py-1 rounded hover:bg-primary-dark"
                      onClick={() => handleAddExercise(exercise)}
                    >
                      추가하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 선택된 운동 상세 정보 모달 */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedExercise.name}</h2>
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
                  src={selectedExercise.image} 
                  alt={selectedExercise.name}
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="md:w-1/2">
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">운동 정보</h3>
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">세트:</span> {selectedExercise.sets}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">반복:</span> {selectedExercise.reps}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">휴식:</span> {selectedExercise.restTime}초
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">타겟 부위</h3>
                  <p className="text-gray-700 mb-3">{selectedExercise.targetMuscle}</p>
                  <h3 className="font-semibold mb-1">운동 설명</h3>
                  <p className="text-gray-700">{selectedExercise.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutDetailPage; 