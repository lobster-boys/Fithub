import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Target, Trophy, Zap, CheckCircle, Clock } from 'lucide-react';
import { useChallengeProgress } from '../../hooks/useChallenge';
import { useChallengePoints } from '../../hooks/usePoints';
import Button from '../common/Button';

const WeeklyGoalTracker = ({ 
  userId, 
  weeklyGoal = 3,
  className = '',
  additionalStats = {} // 추가 통계 정보 (칼로리, 시간, 연속 기록)
}) => {
  const [currentWeek, setCurrentWeek] = useState(null);
  const [goalProgress, setGoalProgress] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  
  const { 
    userLogs, 
    weeklyProgress, 
    loading, 
    fetchUserLogs, 
    checkWeeklyGoal,
    createWorkoutLog 
  } = useChallengeProgress();
  
  const { earnWorkoutPoints } = useChallengePoints();

  // 현재 주 시작일과 종료일 계산
  const getCurrentWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (일요일) ~ 6 (토요일)
    
    // 월요일을 주 시작일로 설정
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0],
      startDate: monday,
      endDate: sunday
    };
  };

  useEffect(() => {
    const weekDates = getCurrentWeekDates();
    setCurrentWeek(weekDates);
  }, []);

  useEffect(() => {
    if (currentWeek && userId) {
      checkWeeklyGoal(userId, currentWeek.start, currentWeek.end);
      fetchUserLogs({
        user: userId,
        date__gte: currentWeek.start,
        date__lte: currentWeek.end,
        log_type: 'workout_count'
      });
    }
  }, [currentWeek, userId, checkWeeklyGoal, fetchUserLogs]);

  // 주간 진행률 계산
  const getWeekProgress = () => {
    if (!weeklyProgress) return { completed: 0, percentage: 0, goalAchieved: false };
    
    const completed = weeklyProgress.totalWorkouts || 0;
    const percentage = Math.min(100, (completed / weeklyGoal) * 100);
    const goalAchieved = completed >= weeklyGoal;
    
    return { completed, percentage, goalAchieved };
  };

  // 일별 운동 기록 조회
  const getDailyWorkouts = () => {
    if (!currentWeek || !userLogs.length) return [];
    
    const days = [];
    const startDate = new Date(currentWeek.startDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLog = userLogs.find(log => 
        log.date === dateStr && log.log_type === 'workout_count'
      );
      
      days.push({
        date: date,
        dateStr: dateStr,
        dayName: date.toLocaleDateString('ko-KR', { weekday: 'short' }),
        workoutCount: dayLog?.value || 0,
        hasWorkout: !!dayLog && dayLog.value > 0
      });
    }
    
    return days;
  };

  // 운동 기록 추가
  const recordWorkout = async (date, count = 1) => {
    try {
      const logData = {
        user: userId,
        date: date,
        value: count,
        log_type: 'workout_count',
        notes: '운동 완료'
      };
      
      await createWorkoutLog(logData);
      
      // 주간 목표 다시 확인
      if (currentWeek) {
        await checkWeeklyGoal(userId, currentWeek.start, currentWeek.end);
      }
    } catch (error) {
      console.error('Failed to record workout:', error);
    }
  };

  // 주간 목표 달성 보상 지급
  const claimWeeklyReward = async () => {
    try {
      const rewardPoints = weeklyGoal * 50; // 운동 1회당 50포인트
      
      await earnWorkoutPoints(
        userId, 
        rewardPoints, 
        `주간 운동 목표 달성 (${weeklyGoal}회)`
      );
      
      setRewardClaimed(true);
      setShowRewardModal(true);
      
      // 3초 후 모달 자동 닫기
      setTimeout(() => {
        setShowRewardModal(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to claim weekly reward:', error);
    }
  };

  const { completed, percentage, goalAchieved } = getWeekProgress();
  const dailyWorkouts = getDailyWorkouts();
  const today = new Date().toISOString().split('T')[0];

  if (!currentWeek) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
                  {/* 헤더 */}
        <div className="p-6">
                      <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">주간 진행 현황</h3>
                <p className="text-sm text-gray-500">
                  {currentWeek.startDate.toLocaleDateString()} ~ {currentWeek.endDate.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/workouts" className="text-primary font-medium text-sm hover:underline">
                자세히 보기
              </Link>
              {goalAchieved && !rewardClaimed && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={claimWeeklyReward}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  보상 받기
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 진행률 */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {completed} / {weeklyGoal}
            </div>
            <div className="text-sm text-gray-500">완료된 운동</div>
            
            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  goalAchieved ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(percentage)}% 완료
            </div>
          </div>

          {/* 추가 통계 카드들 */}
          {additionalStats && Object.keys(additionalStats).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {/* 운동 일수 (메인 진행률과 동일) */}
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-lg font-bold">{completed} 일</p>
                <p className="text-sm text-gray-600">운동 일수</p>
              </div>
              
              {/* 소모 칼로리 */}
              {additionalStats.totalCalories !== undefined && (
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-orange-100 rounded-full">
                    <i className="fas fa-fire text-orange-600"></i>
                  </div>
                  <p className="text-lg font-bold">{additionalStats.totalCalories.toLocaleString()} kcal</p>
                  <p className="text-sm text-gray-600">소모 칼로리</p>
                </div>
              )}
              
              {/* 활동 시간 */}
              {additionalStats.totalDuration !== undefined && (
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-green-100 rounded-full">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-lg font-bold">{additionalStats.totalDuration} min</p>
                  <p className="text-sm text-gray-600">활동 시간</p>
                </div>
              )}
              
              {/* 연속 기록 */}
              {additionalStats.streakDays !== undefined && (
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-yellow-100 rounded-full">
                    <Zap className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-lg font-bold">{additionalStats.streakDays} 일</p>
                  <p className="text-sm text-gray-600">연속 기록</p>
                </div>
              )}
            </div>
          )}

          {/* 목표 달성 상태 */}
          {goalAchieved ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">🎉 주간 목표 달성!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                이번 주 운동 목표를 성공적으로 달성했습니다. 
                {!rewardClaimed && ` ${weeklyGoal * 50}포인트를 받으세요!`}
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-700">
                <Zap className="w-5 h-5" />
                <span className="font-medium">
                  {weeklyGoal - completed}회 더 운동하면 목표 달성!
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                목표 달성 시 {weeklyGoal * 50}포인트를 받을 수 있어요.
              </p>
            </div>
          )}

          {/* 일별 운동 기록 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">이번 주 운동 기록</span>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {dailyWorkouts.map((day, index) => (
                <DayItem
                  key={index}
                  day={day}
                  isToday={day.dateStr === today}
                  onRecord={() => recordWorkout(day.dateStr)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 보상 수령 모달 */}
      {showRewardModal && (
        <RewardModal
          points={weeklyGoal * 50}
          onClose={() => setShowRewardModal(false)}
        />
      )}
    </>
  );
};

// 일별 운동 기록 아이템
const DayItem = ({ day, isToday, onRecord }) => {
  const [recording, setRecording] = useState(false);

  const handleRecord = async () => {
    if (recording) return;
    
    setRecording(true);
    try {
      await onRecord();
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className={`
      text-center p-2 rounded-lg border-2 transition-all cursor-pointer
      ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
      ${day.hasWorkout ? 'bg-green-50 border-green-300' : ''}
    `}>
      <div className="text-xs font-medium text-gray-600 mb-1">
        {day.dayName}
      </div>
      <div className="text-xs text-gray-500 mb-2">
        {day.date.getDate()}
      </div>
      
      {day.hasWorkout ? (
        <div className="flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
      ) : isToday ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRecord}
          disabled={recording}
          className="w-full h-8 text-xs"
        >
          {recording ? '...' : '기록'}
        </Button>
      ) : (
        <div className="w-5 h-5 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-xs text-gray-400">-</span>
        </div>
      )}
      
      {day.workoutCount > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          {day.workoutCount}회
        </div>
      )}
    </div>
  );
};

// 보상 수령 모달
const RewardModal = ({ points, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-sm w-full p-6 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          목표 달성!
        </h3>
        <p className="text-gray-600 mb-4">
          주간 운동 목표를 달성하여 <br />
          <span className="text-lg font-semibold text-green-600">{points}포인트</span>를 받았습니다!
        </p>
        <Button
          variant="primary"
          onClick={onClose}
          className="w-full"
        >
          확인
        </Button>
      </div>
    </div>
  );
};

export default WeeklyGoalTracker; 