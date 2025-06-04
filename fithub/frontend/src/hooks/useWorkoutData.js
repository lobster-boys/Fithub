import { useState, useEffect } from 'react';

const useWorkoutData = () => {
  // 로컬 스토리지에서 운동 로그 데이터 가져오기
  const [workoutLogs, setWorkoutLogs] = useState([]);

  useEffect(() => {
    // 로컬 스토리지에서 데이터 불러오기
    const savedLogs = localStorage.getItem('workoutLogs');
    if (savedLogs) {
      setWorkoutLogs(JSON.parse(savedLogs));
    } else {
      // 초기 데모 데이터
      const initialLogs = [
        {
          id: 1,
          date: '2023-12-18',
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
          date: '2023-12-19',
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
          date: '2023-12-20',
          title: '유산소 운동',
          duration: 30,
          exercises: [
            { name: '러닝', duration: 30, distance: 5 }
          ],
          calories: 250,
          completed: true,
          type: '유산소'
        },
        {
          id: 4,
          date: '2023-12-21',
          title: '요가',
          duration: 40,
          exercises: [
            { name: '하타 요가', duration: 40 }
          ],
          calories: 150,
          completed: true,
          type: '유연성'
        },
        {
          id: 5,
          date: '2023-12-22',
          title: '전신 운동',
          duration: 35,
          exercises: [
            { name: '버피', sets: 3, reps: 15 },
            { name: '마운틴 클라이머', sets: 3, reps: 20 },
            { name: '점프 스쿼트', sets: 3, reps: 12 }
          ],
          calories: 290,
          completed: true,
          type: '근력 운동'
        }
      ];
      setWorkoutLogs(initialLogs);
      localStorage.setItem('workoutLogs', JSON.stringify(initialLogs));
    }
  }, []);

  // 운동 로그 추가
  const addWorkoutLog = (newLog) => {
    const updatedLogs = [...workoutLogs, { ...newLog, id: Date.now() }];
    setWorkoutLogs(updatedLogs);
    localStorage.setItem('workoutLogs', JSON.stringify(updatedLogs));
  };

  // 주간 데이터 계산
  const getWeeklyStats = () => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - 7); // 지난 7일

    const weekLogs = workoutLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= currentWeekStart && logDate <= today;
    });

    const totalDuration = weekLogs.reduce((sum, log) => sum + log.duration, 0);
    const totalCalories = weekLogs.reduce((sum, log) => sum + log.calories, 0);
    const workoutDays = weekLogs.length;
    const maxStreakDays = 7; // 임시로 고정값

    return {
      totalDuration,
      totalCalories,
      workoutDays,
      maxStreakDays
    };
  };

  // 연속 운동 일수 계산
  const getStreakDays = () => {
    if (workoutLogs.length === 0) return 0;

    const sortedLogs = [...workoutLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].date);
      const diffDays = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));

      if (i === 0 && diffDays <= 1) {
        // 오늘 또는 어제 운동했으면 시작
        streak = 1;
        currentDate = logDate;
      } else if (diffDays === 1) {
        // 연속된 날짜면 증가
        streak++;
        currentDate = logDate;
      } else {
        // 연속성이 끊어지면 중단
        break;
      }
    }

    return streak;
  };

  // 총 월간 통계
  const getMonthlyStats = () => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthLogs = workoutLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= monthStart && logDate <= today;
    });

    const totalWorkouts = monthLogs.length;
    const totalCalories = monthLogs.reduce((sum, log) => sum + log.calories, 0);
    const totalDuration = monthLogs.reduce((sum, log) => sum + log.duration, 0);

    // 운동 타입별 분류
    const typeDistribution = {
      '근력 운동': 0,
      '유산소': 0,
      '유연성': 0
    };

    monthLogs.forEach(log => {
      if (log.type && typeDistribution.hasOwnProperty(log.type)) {
        typeDistribution[log.type]++;
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
      totalCalories,
      totalDuration
    };
  };

  return {
    workoutLogs,
    setWorkoutLogs,
    addWorkoutLog,
    getWeeklyStats,
    getStreakDays,
    getMonthlyStats
  };
};

export default useWorkoutData; 