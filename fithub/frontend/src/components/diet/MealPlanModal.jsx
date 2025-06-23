import React, { useState } from 'react';
import PropTypes from 'prop-types';

const MealPlanModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    end_date: initialData?.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: initialData?.is_active ?? false,
    is_public: initialData?.is_public ?? false,
    target_goal: initialData?.target_goal || 'weight_loss',
    target_calories_min: initialData?.target_calories_min || 1200,
    target_calories_max: initialData?.target_calories_max || 2000,
    difficulty: initialData?.difficulty || 'easy',
    items: initialData?.items || []
  });

  const [errors, setErrors] = useState({});

  const targetGoalOptions = [
    { value: 'weight_loss', label: '체중 감량' },
    { value: 'muscle_gain', label: '근육 증가' },
    { value: 'maintenance', label: '체중 유지' },
    { value: 'health', label: '건강 관리' }
  ];

  const difficultyOptions = [
    { value: 'easy', label: '쉬움' },
    { value: 'medium', label: '보통' },
    { value: 'hard', label: '어려움' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '식단 계획 이름은 필수입니다.';
    }

    if (!formData.start_date) {
      newErrors.start_date = '시작일은 필수입니다.';
    }

    if (!formData.end_date) {
      newErrors.end_date = '종료일은 필수입니다.';
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = '종료일은 시작일보다 늦어야 합니다.';
    }

    if (formData.target_calories_min && formData.target_calories_max && 
        formData.target_calories_min > formData.target_calories_max) {
      newErrors.target_calories_max = '최대 칼로리는 최소 칼로리보다 커야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: false,
      is_public: false,
      target_goal: 'weight_loss',
      target_calories_min: 1200,
      target_calories_max: 2000,
      difficulty: 'easy',
      items: []
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              {initialData ? '식단 계획 수정' : '새 식단 계획 만들기'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  식단 계획 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="예: 건강한 다이어트 식단"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="3"
                  placeholder="식단 계획에 대한 간단한 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작일 *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.start_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료일 *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.end_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
              </div>
            </div>

            {/* 목표 및 칼로리 설정 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  목표
                </label>
                <select
                  value={formData.target_goal}
                  onChange={(e) => handleChange('target_goal', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {targetGoalOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  난이도
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {difficultyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최소 칼로리
                </label>
                <input
                  type="number"
                  value={formData.target_calories_min}
                  onChange={(e) => handleChange('target_calories_min', parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="0"
                  placeholder="1200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최대 칼로리
                </label>
                <input
                  type="number"
                  value={formData.target_calories_max}
                  onChange={(e) => handleChange('target_calories_max', parseInt(e.target.value) || 0)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.target_calories_max ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  placeholder="2000"
                />
                {errors.target_calories_max && <p className="text-red-500 text-sm mt-1">{errors.target_calories_max}</p>}
              </div>
            </div>

            {/* 설정 옵션 */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  현재 활성 식단으로 설정
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => handleChange('is_public', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
                  다른 사용자에게 공개
                </label>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                {initialData ? '수정하기' : '생성하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

MealPlanModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object
};

export default MealPlanModal; 