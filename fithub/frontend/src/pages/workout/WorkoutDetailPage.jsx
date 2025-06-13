import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// WorkoutLogPage와 동일한 운동 데이터
const EXERCISE_DATA = {
  1: { id: 1, name: '벤치 프레스', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3-4', reps: '8-12', difficulty: '중급', description: '가슴과 삼두를 주로 발달시키는 대표적인 상체 운동입니다. 벤치에 누워 바벨을 가슴까지 내렸다가 다시 위로 밀어올리는 동작을 반복합니다.' },
  2: { id: 2, name: '푸시업', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '10-15', difficulty: '초급', description: '가슴과 삼두를 사용하는 기초 상체 운동입니다. 어깨 너비로 손을 바닥에 대고 몸을 일직선으로 유지하며 팔을 굽혔다 펴는 동작을 반복합니다.' },
  3: { id: 3, name: '덤벨 플라이', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '중급', description: '가슴 근육을 고립시켜 발달시키는 운동입니다. 덤벨을 양손에 들고 팔을 벌려 가슴을 늘렸다가 다시 모으는 동작을 반복합니다.' },
  4: { id: 4, name: '딥스', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '8-12', difficulty: '중급', description: '가슴 하부와 삼두를 발달시키는 운동입니다. 딥 바에 몸을 지탱하고 팔을 굽혔다 펴는 동작을 반복합니다.' },
  5: { id: 5, name: '풀업', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '5-10', difficulty: '고급', description: '등과 이두를 발달시키는 고급 운동입니다. 풀업 바에 매달려 몸을 위로 당겨올리는 동작을 반복합니다.' },
  6: { id: 6, name: '바벨 로우', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3-4', reps: '8-12', difficulty: '중급', description: '등 중부와 이두를 발달시키는 운동입니다. 바벨을 허리까지 당겨올리며 등을 수축시키는 동작을 반복합니다.' },
  7: { id: 7, name: '랫 풀다운', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '10-12', difficulty: '초급', description: '등을 넓게 발달시키는 운동입니다. 랫 풀다운 머신에 앉아 바를 가슴 쪽으로 당겨내리는 동작을 반복합니다.' },
  8: { id: 8, name: '시티드 로우', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '10-15', difficulty: '초급', description: '등 중부를 발달시키는 운동입니다. 시티드 로우 머신에 앉아 손잡이를 몸쪽으로 당기는 동작을 반복합니다.' },
  9: { id: 9, name: '오버헤드 프레스', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3-4', reps: '8-12', difficulty: '중급', description: '어깨 전체를 발달시키는 복합 운동입니다. 바벨이나 덤벨을 머리 위로 밀어올리는 동작을 반복합니다.' },
  10: { id: 10, name: '레터럴 레이즈', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '초급', description: '어깨 측면을 발달시키는 고립 운동입니다. 덤벨을 양손에 들고 옆으로 들어올리는 동작을 반복합니다.' },
  11: { id: 11, name: '리어 델트 플라이', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '초급', description: '어깨 후면을 발달시키는 운동입니다. 덤벨을 들고 상체를 앞으로 숙인 상태에서 팔을 뒤로 벌리는 동작을 반복합니다.' },
  12: { id: 12, name: '숄더 쉬러그', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '15-20', difficulty: '초급', description: '승모근을 발달시키는 운동입니다. 덤벨이나 바벨을 들고 어깨를 위로 으쓱하는 동작을 반복합니다.' },
  13: { id: 13, name: '바이셉 컬', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '초급', description: '이두근을 고립시켜 발달시키는 운동입니다. 덤벨을 들고 팔꿈치를 고정한 상태에서 팔을 굽혔다 펴는 동작을 반복합니다.' },
  14: { id: 14, name: '트라이셉 딥스', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '10-15', difficulty: '중급', description: '삼두근을 발달시키는 운동입니다. 벤치나 의자에 손을 대고 몸을 지탱한 상태에서 팔을 굽혔다 펴는 동작을 반복합니다.' },
  15: { id: 15, name: '해머 컬', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '초급', description: '이두근과 상완근을 함께 발달시키는 운동입니다. 덤벨을 해머처럼 잡고 팔을 굽혔다 펴는 동작을 반복합니다.' },
  16: { id: 16, name: '오버헤드 익스텐션', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '중급', description: '삼두근을 고립시켜 발달시키는 운동입니다. 덤벨을 머리 위로 들고 팔꿈치를 고정한 상태에서 팔을 굽혔다 펴는 동작을 반복합니다.' },
  17: { id: 17, name: '스쿼트', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3-4', reps: '10-15', difficulty: '초급', description: '하체 전체를 강화하는 기본 운동입니다. 어깨 너비로 발을 벌리고 엉덩이를 뒤로 빼며 무릎을 굽혀 앉았다가 일어나는 동작을 반복합니다.' },
  18: { id: 18, name: '런지', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '10-12', difficulty: '초급', description: '하체와 균형감각을 기르는 운동입니다. 한 발을 앞으로 내딛고 무릎을 굽혀 몸을 낮췄다가 다시 일어나는 동작을 반복합니다.' },
  19: { id: 19, name: '데드리프트', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3-4', reps: '6-10', difficulty: '고급', description: '전신을 사용하는 복합 운동으로 특히 등과 하체를 발달시킵니다. 바닥에 있는 바벨을 들어올리는 동작을 반복합니다.' },
  20: { id: 20, name: '레그 프레스', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '초급', description: '하체를 안전하게 강화할 수 있는 머신 운동입니다. 레그 프레스 머신에 앉아 발로 플레이트를 밀어내는 동작을 반복합니다.' },
  21: { id: 21, name: '플랭크', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '30-60초', difficulty: '초급', description: '코어 근육을 강화하는 정적 운동입니다. 팔꿈치와 발끝으로 몸을 지탱하며 몸을 일직선으로 유지합니다.' },
  22: { id: 22, name: '크런치', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '15-20', difficulty: '초급', description: '복직근을 발달시키는 기본 복근 운동입니다. 바닥에 누워 상체를 들어올리는 동작을 반복합니다.' },
  23: { id: 23, name: '러시안 트위스트', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '20-30', difficulty: '중급', description: '복사근을 발달시키는 운동입니다. 상체를 뒤로 기울인 상태에서 몸통을 좌우로 비트는 동작을 반복합니다.' },
  24: { id: 24, name: '마운틴 클라이머', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '30초', difficulty: '중급', description: '코어와 심폐지구력을 함께 기르는 운동입니다. 플랭크 자세에서 무릎을 가슴쪽으로 번갈아 당기는 동작을 반복합니다.' },
  25: { id: 25, name: '버피', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '10-15', difficulty: '중급', description: '전신을 사용하는 고강도 운동입니다. 스쿼트, 플랭크, 점프를 연속으로 수행하는 복합 운동입니다.' },
  26: { id: 26, name: '점프 스쿼트', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '12-15', difficulty: '중급', description: '하체 파워와 폭발력을 기르는 운동입니다. 스쿼트 동작에서 점프를 추가한 플라이오메트릭 운동입니다.' },
  27: { id: 27, name: '스러스터', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '10-12', difficulty: '고급', description: '전신을 사용하는 복합 운동입니다. 스쿼트와 오버헤드 프레스를 연결한 동작으로 높은 칼로리 소모가 특징입니다.' },
  28: { id: 28, name: '베어 크롤', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', sets: '3', reps: '30초', difficulty: '중급', description: '전신 협응성과 코어를 강화하는 운동입니다. 네발로 기어가는 동작으로 안정성과 균형감각을 기릅니다.' }
};

// 임시 데이터 (실제로는 API에서 가져올 내용)
const WORKOUT_DATA = {
  1: {
    id: 1,
    title: '전신 운동 루틴',
    level: '초급자',
    description: '20분 만에 전신을 균형있게 단련할 수 있는 초보자 친화적인 운동 프로그램입니다. 기초 체력 향상과 근력 강화에 효과적입니다.',
    duration: 20,
    targetCalories: 180,
    targetMuscles: ['전신', '가슴', '하체', '코어'],
    participants: 12400,
    exercises: [
      {
        id: 101,
        name: '워밍업 스트레칭',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 1,
        reps: '5분',
        restTime: 0,
        targetMuscle: '전신',
        description: '관절 가동성을 높이고 부상을 예방하는 기본 스트레칭입니다.'
      },
      {
        id: 102,
        name: '푸시업',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 3,
        reps: 10,
        restTime: 60,
        targetMuscle: '가슴, 삼두',
        description: '가슴과 삼두를 주로 사용하는 기초 상체 운동입니다.'
      },
      {
        id: 103,
        name: '스쿼트',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 3,
        reps: 15,
        restTime: 60,
        targetMuscle: '하체',
        description: '하체 전체를 강화하는 기본 운동입니다.'
      },
      {
        id: 104,
        name: '플랭크',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 3,
        reps: '30초',
        restTime: 45,
        targetMuscle: '코어',
        description: '코어 근육을 강화하는 정적 운동입니다.'
      },
      {
        id: 105,
        name: '점프 잭',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 3,
        reps: 20,
        restTime: 60,
        targetMuscle: '전신, 유산소',
        description: '전신을 활용한 유산소 운동으로 심폐지구력을 향상시킵니다.'
      }
    ]
  },
  2: {
    id: 2,
    title: '코어 강화 운동',
    level: '중급자',
    description: '15분 집중 코어 트레이닝으로 복부와 허리 근력을 강화하여 일상 동작의 안정성을 높입니다.',
    duration: 15,
    targetCalories: 120,
    targetMuscles: ['코어', '복근', '허리'],
    participants: 8700,
    exercises: [
      {
        id: 201,
        name: '플랭크',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 3,
        reps: '45초',
        restTime: 60,
        targetMuscle: '코어',
        description: '코어 근육을 강화하는 정적 운동입니다.'
      },
      {
        id: 202,
        name: '크런치',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 3,
        reps: 20,
        restTime: 45,
        targetMuscle: '복직근',
        description: '복직근을 발달시키는 기본 복근 운동입니다.'
      },
      {
        id: 203,
        name: '러시안 트위스트',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 3,
        reps: 25,
        restTime: 60,
        targetMuscle: '복사근',
        description: '복사근을 발달시키는 운동입니다.'
      },
      {
        id: 204,
        name: '마운틴 클라이머',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 3,
        reps: '30초',
        restTime: 60,
        targetMuscle: '코어, 유산소',
        description: '코어와 심폐지구력을 함께 기르는 운동입니다.'
      },
      {
        id: 205,
        name: '레그 레이즈',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 3,
        reps: 15,
        restTime: 45,
        targetMuscle: '하복부',
        description: '하복부를 집중적으로 강화하는 운동입니다.'
      }
    ]
  },
  3: {
    id: 3,
    title: '모닝 요가 플로우',
    level: '모든 레벨',
    description: '하루를 상쾌하게 시작할 수 있는 25분 요가 루틴입니다. 유연성 향상과 스트레스 해소에 효과적입니다.',
    duration: 25,
    targetCalories: 150,
    targetMuscles: ['전신', '유연성', '밸런스'],
    participants: 15200,
    exercises: [
      {
        id: 301,
        name: '선 스트레칭',
        image: 'https://images.unsplash.com/photo-1571019614242-c95595902d5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 1,
        reps: '3분',
        restTime: 0,
        targetMuscle: '전신',
        description: '몸 전체를 깨우는 기본 스트레칭입니다.'
      },
      {
        id: 302,
        name: '태양 인사',
        image: 'https://images.unsplash.com/photo-1571019614242-c95595902d5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 5,
        reps: '1회',
        restTime: 30,
        targetMuscle: '전신',
        description: '요가의 기본 시퀀스로 전신을 균형있게 움직입니다.'
      },
      {
        id: 303,
        name: '전사 자세',
        image: 'https://images.unsplash.com/photo-1571019614242-c95595902d5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 2,
        reps: '30초',
        restTime: 20,
        targetMuscle: '하체, 밸런스',
        description: '하체 근력과 균형감각을 기르는 요가 자세입니다.'
      },
      {
        id: 304,
        name: '나무 자세',
        image: 'https://images.unsplash.com/photo-1571019614242-c95595902d5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 2,
        reps: '30초',
        restTime: 20,
        targetMuscle: '밸런스, 코어',
        description: '균형감각과 집중력을 기르는 요가 자세입니다.'
      },
      {
        id: 305,
        name: '아이의 자세',
        image: 'https://images.unsplash.com/photo-1571019614242-c95595902d5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        sets: 1,
        reps: '2분',
        restTime: 0,
        targetMuscle: '휴식, 스트레칭',
        description: '마음을 진정시키고 등과 어깨를 이완시키는 자세입니다.'
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
  const { workoutId, exerciseId } = useParams();
  const [workout, setWorkout] = useState(null);
  const [exercise, setExercise] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [customRoutine, setCustomRoutine] = useState([]);
  const [showAdditionalExercises, setShowAdditionalExercises] = useState(false);

  useEffect(() => {
    if (exerciseId) {
      // 개별 운동 상세 정보 표시
      const fetchedExercise = EXERCISE_DATA[exerciseId];
      setExercise(fetchedExercise);
    } else if (workoutId) {
      // 기존 워크아웃 루틴 상세 정보 표시
      const fetchedWorkout = WORKOUT_DATA[workoutId] || WORKOUT_DATA[1];
      setWorkout(fetchedWorkout);
      setCustomRoutine(fetchedWorkout.exercises);
    }
  }, [workoutId, exerciseId]);

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

  // 로딩 상태 처리
  if (exerciseId && !exercise) {
    return <div className="container mx-auto p-4">운동 정보를 불러오는 중...</div>;
  }

  if (workoutId && !workout) {
    return <div className="container mx-auto p-4">운동 루틴을 불러오는 중...</div>;
  }

  // 개별 운동 상세 페이지 렌더링
  if (exerciseId && exercise) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        {/* 운동 상세 정보 헤더 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => window.history.back()}
              className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <h1 className="text-3xl font-bold">{exercise.name}</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 운동 이미지 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <img
                src={exercise.image}
                alt={exercise.name}
                className="w-full h-64 lg:h-80 object-cover"
              />
            </div>
            
            {/* 운동 정보 */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  exercise.difficulty === '초급' 
                    ? 'bg-green-100 text-green-800'
                    : exercise.difficulty === '중급'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {exercise.difficulty}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">권장 세트/횟수</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700">
                      <span className="font-medium">{exercise.sets}</span> 세트 × 
                      <span className="font-medium"> {exercise.reps}</span> 회
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">운동 설명</h3>
                  <p className="text-gray-600 leading-relaxed">{exercise.description}</p>
                </div>
                
                <div className="pt-4">
                  <button className="w-full bg-primary hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                    <i className="fas fa-play mr-2"></i>
                    운동 시작하기
                  </button>
                </div>
              </div>
            </div>
          </div>
          
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