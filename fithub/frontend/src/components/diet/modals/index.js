// Diet 모달 컴포넌트들의 통합 export
import BaseModal from './BaseModal';
import FoodSearchModal from './FoodSearchModal';
import MealLogModal from './MealLogModal';
import MealEditModal from './MealEditModal';
import RecommendationModal from './RecommendationModal';

// 컴포넌트들을 named export로 내보내기
export {
  BaseModal,
  FoodSearchModal,
  MealLogModal,
  MealEditModal,
  RecommendationModal
};

// 레거시 호환성을 위한 별칭 (기존 import 구조 지원)
export { RecommendationModal as DietRecommendationModal }; 