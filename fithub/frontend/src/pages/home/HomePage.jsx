import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import ProductCardList from '../../components/ecommerce/ProductCardList';
import DietRecommendationModal from '../../components/diet/DietRecommendationModal';
import ChallengeCard from '../../components/challenge/ChallengeCard';
import WeeklyGoalTracker from '../../components/workout/WeeklyGoalTracker';

import useWorkoutData from '../../hooks/useWorkoutData';
import useEcommerce from '../../hooks/useEcommerce';
import useCommunity from '../../hooks/useCommunity';
import { useAuth } from '../../hooks/useAuth';
import { useChallenge } from '../../hooks/useChallenge';
import { useDietLogs } from '../../hooks/diet/useDietLogs';
import useDietRecommendations from '../../hooks/diet/useDietRecommendations';
import { transformDietLogsToMeals } from '../../utils/dietTransformers';

function HomePage() {
  // AuthContext에서 실제 인증 상태와 사용자 정보 가져오기
  const { user, isAuthenticated } = useAuth();
  
  // 기본값 설정 (사용자 정보가 없을 때)
  const userInfo = user || {
    username: '사용자',
    level: '초급자',
    goals: '체중 감량, 근력 강화'
  };

  // 운동 데이터 훅 사용
  const { 
    routines,
    workoutLogs,
    fetchRoutines,
    fetchWorkoutLogs,
    refreshWorkoutLogs,
    getWeeklyStats, 
    getStreakDays,
    loading: workoutLoading,
    error: workoutError
  } = useWorkoutData();
  
  const weeklyStats = getWeeklyStats();
  const streakDays = getStreakDays();

  // 추천 루틴 상태
  const [recommendedRoutines, setRecommendedRoutines] = useState([]);

  // 식단 추천 모달 상태
  const [showDietModal, setShowDietModal] = useState(false);

  // 운동 탭 상태 (맞춤 추천 vs 운동 로그)
  const [workoutTab, setWorkoutTab] = useState('recommended'); // 'recommended' or 'logs'

  // 글로벌 새로고침 함수 등록 (운동 완료 시 사용)
  useEffect(() => {
    if (refreshWorkoutLogs) {
      console.log('🌐 HomePage: 글로벌 새로고침 함수 등록');
      window.refreshWorkoutLogs = refreshWorkoutLogs;
    } else {
      console.log('⚠️ HomePage: refreshWorkoutLogs 함수가 없음');
    }
    
    return () => {
      // 컴포넌트 언마운트 시에만 정리
      if (!refreshWorkoutLogs) {
        console.log('🧹 HomePage: 글로벌 새로고침 함수 해제');
        delete window.refreshWorkoutLogs;
      }
    };
  }, []); // 의존성 배열을 빈 배열로 변경하여 무한 등록/해제 방지

  // 컴포넌트 마운트 시 추천 루틴과 운동 로그 가져오기
  useEffect(() => {
    const loadData = async () => {
      try {
        // 인증 여부와 관계없이 공개 루틴을 가져옴
        await fetchRoutines({ is_public: true, limit: 3 });
        
        // 인증된 사용자에게만 운동 로그 가져오기
        if (isAuthenticated && fetchWorkoutLogs) {
          await fetchWorkoutLogs({ limit: 5 });
        }

        // 인증된 사용자에게만 챌린지 데이터 가져오기
        if (isAuthenticated && fetchChallenges) {
          await fetchChallenges({ limit: 3, is_active: true });
        }
      } catch (error) {
        console.log('데이터 로드 실패, 폴백 데이터 사용:', error);
        // 에러 발생 시에도 폴백 카드를 표시하도록 함
      }
    };
    
    loadData();
  }, [isAuthenticated]);

  // 페이지 포커스 시 루틴 데이터 새로고침 (새 루틴이 추가되었을 때 반영)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        fetchRoutines({ is_public: true, limit: 3 });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  // 루틴 데이터가 로드되면 추천 루틴 설정
  useEffect(() => {
    if (routines.length > 0) {
      // 최대 3개의 루틴만 표시
      setRecommendedRoutines(routines.slice(0, 3));
    }
  }, [routines]);

  /* ---------- 식단 기록 및 추천 훅 ---------- */
  const {
    todayMeals,
    loading: dietLoading,
    error: dietError,
    fetchTodayDietLogs,
    createMealLog
  } = useDietLogs();

  const {
    getBasicRecommendation,
    getRecommendationByMealType
  } = useDietRecommendations();

  const [isRecommending, setIsRecommending] = useState(false);

  // 컴포넌트 마운트 시 오늘 식단 기록 로드
  useEffect(() => {
    if (isAuthenticated) {
      fetchTodayDietLogs();
    }
  }, [isAuthenticated, fetchTodayDietLogs]);

  // DietLogPage와 동일한 라벨 함수
  const getMealTypeLabel = (type) => {
    switch (type) {
      case 'breakfast': return '아침';
      case 'lunch': return '점심';
      case 'dinner': return '저녁';
      case 'snack': return '간식';
      default: return type;
    }
  };

  // 추천 생성 후 저장 로직 (DietLogPage 일부 차용)
  const saveMealRecommendation = async (foods, mealType, date) => {
    const mealLogData = {
      meal_name: `AI 추천 ${getMealTypeLabel(mealType)}`,
      meal_time: mealType,
      date: date,
      foods: foods.map(food => ({ id: food.id, quantity: (food.servings || 1) * 100 })),
      notes: `AI가 추천한 ${getMealTypeLabel(mealType)} 식단`
    };
    await createMealLog(mealLogData);
  };

  const handleApplyRecommendations = async (recommendationData, mealType = null) => {
    const today = new Date().toISOString().split('T')[0];
    const mealsToApply = recommendationData.meals || [];
    const processMeal = async (meal) => {
      if (meal && Array.isArray(meal.foods) && meal.foods.length > 0) {
        await saveMealRecommendation(meal.foods, meal.meal_type, today);
      }
    };
    if (mealType) {
      const meal = mealsToApply.find(m => m.meal_type === mealType);
      await processMeal(meal);
    } else {
      for (const meal of mealsToApply) {
        await processMeal(meal);
      }
    }
    // 저장 후 오늘 식단 재로딩
    await fetchTodayDietLogs();
  };

  const generateRecommendationSummary = (recommendationData, mealType) => {
    const allMeals = recommendationData.meals || [];
    let summary = '';
    let totalCalories = 0;
    const targetMeals = mealType ? allMeals.filter(m => m.meal_type === mealType) : allMeals;
    targetMeals.forEach(meal => {
      const mealCalories = meal.total_calories || meal.foods.reduce((sum, f) => sum + (f.calories || 0), 0);
      totalCalories += mealCalories;
      summary += `🍽️ ${getMealTypeLabel(meal.meal_type)}: ${Math.round(mealCalories)}kcal\n`;
      meal.foods.forEach(food => {
        summary += `   • ${food.name} (${Math.round(food.calories)}kcal)\n`;
      });
      summary += '\n';
    });
    summary += `📊 총 칼로리: ${Math.round(totalCalories)}kcal`;
    return summary;
  };

  const handleGetRecommendation = async (mealType = null) => {
    setIsRecommending(true);
    try {
      let recommendationData;
      if (mealType) {
        recommendationData = await getRecommendationByMealType(mealType);
      } else {
        recommendationData = await getBasicRecommendation();
      }
      if (recommendationData && recommendationData.meals && recommendationData.meals.length > 0) {
        const summary = generateRecommendationSummary(recommendationData, mealType);
        if (window.confirm(`AI 추천 식단을 생성했습니다!\n\n${summary}\n\n식단 기록에 추가하시겠습니까?`)) {
          await handleApplyRecommendations(recommendationData, mealType);
          alert('추천 식단이 저장되었습니다!');
        }
      } else {
        alert('추천 데이터를 생성할 수 없습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('추천 생성 중 오류가 발생했습니다.');
    } finally {
      setIsRecommending(false);
    }
  };

  /* ---------- todayMeals를 HomePage UI 형식으로 변환 ---------- */
  const mappedMeals = (todayMeals || []).map(meal => ({
    id: meal.id,
    name: getMealTypeLabel(meal.meal_time || meal.meal_type || meal.type),
    foods: meal.foods.map(f => f.name),
    calories: Math.round(meal.calories)
  }));

  const dietData = {
    loading: dietLoading,
    error: dietError,
    todayMealPlan: { meals: mappedMeals }
  };

  // 전자상거래 훅 사용
  const { products, loading: ecommerceLoading } = useEcommerce();
  
  // 커뮤니티 훅 사용
  const { posts, loading: communityLoading } = useCommunity();

  // 챌린지 훅 사용 (인증된 사용자만)
  const { 
    challenges, 
    loading: challengeLoading, 
    fetchChallenges 
  } = isAuthenticated ? useChallenge() : { challenges: [], loading: false, fetchChallenges: () => {} };

  // 목표 값들 (설정 가능)
  const weeklyWorkoutGoal = 5; // 주 5회 운동 목표
  const workoutDaysProgress = Math.min((weeklyStats.workoutDays / weeklyWorkoutGoal) * 100, 100);

  // 난이도 표시 함수
  const getDifficultyDisplay = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return { text: '초급자', color: 'bg-green-500' };
      case 'intermediate':
        return { text: '중급자', color: 'bg-yellow-500' };
      case 'advanced':
        return { text: '고급자', color: 'bg-red-500' };
      default:
        return { text: '모든 레벨', color: 'bg-primary' };
    }
  };

  // 기본 이미지 URL 배열 (고정된 Unsplash 이미지 사용)
  const defaultImages = [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1538805060514-97d9cc87630a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    'https://images.unsplash.com/photo-1571019614242-c95595902d5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  ];

  // 이미지 로드 실패를 추적하는 state
  const [failedImages, setFailedImages] = useState(new Set());

  // 추천 운동 카드 렌더링 함수
  const renderWorkoutCard = (routine, index) => {
    const difficulty = getDifficultyDisplay(routine.difficulty_level);
    const defaultImageUrl = defaultImages[index % defaultImages.length];
    const routineKey = `${routine.id || index}-${routine.name}`;
    
    // 실패한 이미지는 바로 기본 이미지를 사용
    const shouldUseDefault = failedImages.has(routineKey);
    const imageUrl = shouldUseDefault ? defaultImageUrl : (routine.image_url || defaultImageUrl);
    
    const handleImageError = (e) => {
      // 무한 루프 방지: 이미 실패 처리된 이미지는 다시 처리하지 않음
      if (!failedImages.has(routineKey)) {
        setFailedImages(prev => new Set(prev).add(routineKey));
        e.target.src = defaultImageUrl;
      }
    };
    
    return (
      <Link 
        key={routine.id || index} 
        to={`/workouts/${routine.id}`} 
        className="bg-white rounded-xl overflow-hidden shadow-sm relative workout-card group"
      >
        <img
          src={imageUrl}
          alt={routine.name}
          className="w-full h-40 object-cover"
          onError={handleImageError}
          loading="lazy"
        />
        <div className={`absolute top-2 right-2 ${difficulty.color} text-white text-xs px-2 py-1 rounded-full`}>
          <i className="fas fa-bolt mr-1"></i> {difficulty.text}
        </div>
        <div className="p-4">
          <h3 className="font-bold mb-1">{routine.name}</h3>
          <p className="text-sm text-gray-600 mb-2">
            {routine.estimated_duration}분 • {routine.estimated_calories || 150}kcal
          </p>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <i className="fas fa-user-circle text-gray-400 mr-1"></i>
              <span className="text-xs text-gray-500">
                {routine.usage_count || 0}명 참여
              </span>
            </div>
            <span className="text-primary font-medium text-sm">
              시작하기
            </span>
          </div>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-primary text-white px-4 py-2 rounded-full font-medium">
            <i className="fas fa-play mr-1"></i> 운동 시작하기
          </span>
        </div>
      </Link>
    );
  };

  // 폴백 카드 (데이터가 없을 때)
  const renderFallbackCards = () => {
    const fallbackData = [
      { name: '전신 운동 루틴', duration: 20, calories: 180, level: 'beginner' },
      { name: '코어 강화 운동', duration: 15, calories: 120, level: 'intermediate' },
      { name: '모닝 요가 플로우', duration: 25, calories: 150, level: 'beginner' }
    ];

    return fallbackData.map((routine, index) => {
      const difficulty = getDifficultyDisplay(routine.level);
      
      return (
        <div 
          key={`fallback-${index}`}
          className="bg-white rounded-xl overflow-hidden shadow-sm relative opacity-60"
        >
          <img
            src={defaultImages[index]}
            alt={routine.name}
            className="w-full h-40 object-cover"
            loading="lazy"
            onError={(e) => {
              // 폴백 카드는 이미 기본 이미지를 사용하므로 에러시 숨기기
              e.target.style.display = 'none';
            }}
          />
          <div className={`absolute top-2 right-2 ${difficulty.color} text-white text-xs px-2 py-1 rounded-full`}>
            <i className="fas fa-bolt mr-1"></i> {difficulty.text}
          </div>
          <div className="p-4">
            <h3 className="font-bold mb-1">{routine.name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {routine.duration}분 • {routine.calories}kcal
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <i className="fas fa-user-circle text-gray-400 mr-1"></i>
                <span className="text-xs text-gray-500">준비 중...</span>
              </div>
              <span className="text-gray-400 font-medium text-sm">
                준비 중
              </span>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div>

      {/* Welcome Section with User Info */}
      <section className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-14 h-14 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3">
            <i className="fas fa-user text-primary text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold">안녕하세요, {userInfo?.username}님!</h2>
            <p className="text-sm text-gray-600">레벨: {userInfo?.level} • {userInfo?.goals}</p>
          </div>
        </div>
        
        {/* 주간 운동 목표 & 통계 - 통합된 WeeklyGoalTracker 사용 */}
        <WeeklyGoalTracker 
          userId={user?.id} 
          weeklyGoal={weeklyWorkoutGoal}
          additionalStats={{
            totalCalories: weeklyStats.totalCalories,
            totalDuration: weeklyStats.totalDuration,
            streakDays: streakDays
          }}
        />
      </section>

      {/* 운동 & 루틴 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">운동 & 루틴</h2>
          <Link to="/workouts" className="text-primary font-medium">
            더보기
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* 탭 헤더 */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setWorkoutTab('recommended')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                workoutTab === 'recommended'
                  ? 'text-primary border-b-2 border-primary bg-orange-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <i className="fas fa-star mr-2"></i>
              맞춤 추천
            </button>
            <button
              onClick={() => setWorkoutTab('logs')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                workoutTab === 'logs'
                  ? 'text-primary border-b-2 border-primary bg-orange-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <i className="fas fa-clipboard-list mr-2"></i>
              운동 로그
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="p-6">
            {workoutTab === 'recommended' ? (
              // 추천 운동 탭 컨텐츠
              <div>
                {workoutLoading ? (
                  // 로딩 상태
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={`loading-${index}`} className="bg-gray-50 rounded-xl animate-pulse">
                        <div className="w-full h-40 bg-gray-200 rounded-xl"></div>
                        <div className="p-4">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                          <div className="flex justify-between items-center">
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : workoutError ? (
                  // 에러 상태
                  <div className="bg-red-50 rounded-xl p-6 text-center">
                    <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
                    <p className="text-red-600 mb-3">추천 운동을 불러오는 중 오류가 발생했습니다.</p>
                    <button 
                      onClick={() => fetchRoutines({ limit: 3 })}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      다시 시도
                    </button>
                  </div>
                ) : recommendedRoutines.length > 0 ? (
                  // 실제 데이터 표시
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedRoutines.map((routine, index) => renderWorkoutCard(routine, index))}
                  </div>
                ) : !isAuthenticated ? (
                  // 비로그인 상태
                  <div className="text-center py-8">
                    <i className="fas fa-dumbbell text-gray-300 text-4xl mb-4"></i>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">맞춤 추천 운동</h3>
                    <p className="text-gray-500 mb-4">로그인하면 개인화된 운동 루틴을 추천받을 수 있습니다.</p>
                    <Link 
                      to="/auth/login" 
                      className="inline-flex items-center bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      로그인하기
                    </Link>
                  </div>
                ) : (
                  // 데이터가 없을 때 폴백 표시
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {renderFallbackCards()}
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
                      <span className="text-yellow-800">아직 추천 운동이 없습니다. 곧 다양한 운동 루틴이 추가될 예정입니다!</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 운동 로그 탭 컨텐츠
              <div>
                {workoutLogs && workoutLogs.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold">최근 운동 기록</h3>
                      <Link 
                        to="/workouts" 
                        className="text-primary font-medium text-sm hover:underline"
                      >
                        전체 보기
                      </Link>
                    </div>
                    {workoutLogs.slice(0, 3).map((log, index) => (
                      <div key={log.id || index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{log.routine_name || '운동'}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(log.date || log.start_time).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>소모 칼로리: {log.calories_burned || 0} kcal</span>
                          <span>운동 시간: {log.duration || log.duration_minutes || 0} 분</span>
                        </div>
                        {log.exercises && log.exercises.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            {log.exercises.length}개 운동 완료
                          </div>
                        )}
                      </div>
                    ))}
                    <Link 
                      to="/workouts" 
                      className="w-full block text-center bg-primary text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                      운동 기록하기
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-clipboard-list text-gray-300 text-4xl mb-4"></i>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">운동 로그</h3>
                    <p className="text-gray-500 mb-4">아직 운동 기록이 없습니다. 첫 운동을 시작해보세요!</p>
                    <Link 
                      to="/workouts" 
                      className="inline-flex items-center bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      운동 기록하기
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 식단 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">식단 관리</h2>
          <Link to="/diet" className="text-primary font-medium">
            더보기
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {!isAuthenticated ? (
            <div className="p-8 text-center">
              <i className="fas fa-utensils text-gray-300 text-3xl mb-3"></i>
              <p className="text-gray-500 mb-3">식단 관리를 위해 로그인이 필요합니다.</p>
              <Link 
                to="/login" 
                className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                <i className="fas fa-sign-in-alt mr-1"></i>
                로그인하기
              </Link>
            </div>
          ) : dietData && dietData.loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-500">식단 정보를 불러오는 중...</p>
            </div>
          ) : dietData && dietData.error ? (
            <div className="p-8 text-center">
              <i className="fas fa-exclamation-triangle text-yellow-500 text-2xl mb-2"></i>
              <p className="text-gray-500">{dietData.error}</p>
            </div>
          ) : dietData && dietData.todayMealPlan && dietData.todayMealPlan.meals && dietData.todayMealPlan.meals.length > 0 ? (
            <>
              {dietData.todayMealPlan.meals.map((meal, index) => {
                const mealIcons = {
                  '아침': 'fas fa-utensils',
                  '점심': 'fas fa-drumstick-bite',
                  '저녁': 'fas fa-utensils',
                  '간식': 'fas fa-apple-alt'
                };
                
                const mealTypes = {
                  '아침': '고단백',
                  '점심': '균형 잡힌',
                  '저녁': '저칼로리',
                  '간식': '건강한 지방'
                };

                return (
                  <Link 
                    key={index} 
                    to={`/diet/ingredient/${meal.id || index + 1}`} 
                    className={`block p-4 hover:bg-gray-50 transition-colors ${
                      index < dietData.todayMealPlan.meals.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center mr-4">
                        <i className={`${mealIcons[meal.name] || 'fas fa-utensils'} text-primary text-xl`}></i>
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold">{meal.name}</h3>
                        <p className="text-sm text-gray-600">
                          {meal.foods.join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{meal.calories} kcal</p>
                        <p className="text-xs text-gray-500">{mealTypes[meal.name] || '영양가 있는'}</p>
                      </div>
                      <div className="ml-3">
                        <i className="fas fa-chevron-right text-gray-400"></i>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {/* 식단 추천 버튼 */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => handleGetRecommendation()}
                  disabled={isRecommending}
                  className={`w-full py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center ${
                    isRecommending ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-orange-600'
                  }`}
                >
                  <i className="fas fa-lightbulb mr-2"></i>
                  맞춤 식단 추천 받기
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="p-8 text-center">
                <i className="fas fa-utensils text-gray-300 text-3xl mb-3"></i>
                <p className="text-gray-500 mb-3">오늘 등록된 식사가 없습니다.</p>
                <Link 
                  to="/diet" 
                  className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
                >
                  <i className="fas fa-plus mr-1"></i>
                  식사 추가하기
                </Link>
              </div>
              {/* 로그인했지만 식사가 없는 경우에도 식단 추천 버튼 표시 */}
              {isAuthenticated && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => handleGetRecommendation()}
                    disabled={isRecommending}
                    className={`w-full py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center ${
                      isRecommending ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-orange-600'
                    }`}
                  >
                    <i className="fas fa-lightbulb mr-2"></i>
                    맞춤 식단 추천 받기
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 챌린지 섹션 - 인증된 사용자만 */}
      {isAuthenticated && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">활성 챌린지</h2>
            <Link to="/community" className="text-primary font-medium">
              모든 챌린지 보기
            </Link>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challengeLoading ? (
              // 로딩 스켈레톤
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : challenges.length > 0 ? (
              challenges.slice(0, 3).map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))
            ) : (
              <div className="col-span-full bg-white rounded-xl shadow-sm p-8 text-center">
                <i className="fas fa-trophy text-gray-300 text-3xl mb-3"></i>
                <p className="text-gray-500 mb-3">현재 활성 챌린지가 없습니다.</p>
                <Link 
                  to="/community" 
                  className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
                >
                  <i className="fas fa-plus mr-1"></i>
                  챌린지 둘러보기
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 쇼핑 섹션 */}
      <section className="mb-8">
        <ProductCardList
          title="추천 용품"
          viewAllLink={
            <Link to="/shop" className="text-primary font-medium">
              모두 보기
            </Link>
          }
          products={products}
          compact={true}
        />
      </section>

      {/* 커뮤니티 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">커뮤니티</h2>
          <Link to="/community" className="text-primary font-medium">
            더보기
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <Link 
                key={post.id} 
                to={`/community/${post.id}`}
                className={`block p-4 hover:bg-gray-50 transition-colors ${
                  index < posts.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{post.author.name}</h4>
                    <p className="text-xs text-gray-500">{post.date}</p>
                  </div>
                </div>
                <h3 className="font-bold mb-2">{post.title}</h3>
                <p className="mb-3 text-gray-700 line-clamp-2">
                  {post.content.length > 100 
                    ? `${post.content.substring(0, 100)}...` 
                    : post.content
                  }
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <div className="flex items-center text-gray-500">
                      <i className="far fa-heart mr-1"></i>
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <i className="far fa-comment mr-1"></i>
                      <span>{post.comments}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <i className="far fa-eye mr-1"></i>
                      <span>{post.views}</span>
                    </div>
                  </div>
                  <div className="text-gray-500">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center">
              <i className="fas fa-comments text-gray-300 text-3xl mb-3"></i>
              <p className="text-gray-500 mb-3">아직 게시글이 없습니다.</p>
              <Link 
                to="/community" 
                className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
              >
                <i className="fas fa-plus mr-1"></i>
                첫 번째 글 작성하기
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 식단 추천 모달 */}
      <DietRecommendationModal 
        isOpen={showDietModal}
        onClose={() => setShowDietModal(false)}
      />
    </div>
  );
}

export default HomePage; 