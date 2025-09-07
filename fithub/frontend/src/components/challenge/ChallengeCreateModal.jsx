import React, { useState, useEffect } from 'react';
import { X, Trophy, Users, Calendar, Coins, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import { useChallenge } from '../../hooks/useChallenge';
import { usePoints } from '../../hooks/usePoints';

const ChallengeCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    period: 'weekly',
    is_personal: false,
    entry_cost: 100,
    min_participants: 5,
    reward_multiplier: 1.5,
    start_date: '',
    end_date: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { createChallenge } = useChallenge();
  const { pointBalance } = usePoints();

  // 모달이 열릴 때 기본 날짜 설정
  useEffect(() => {
    if (isOpen && !formData.start_date && !formData.end_date) {
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      
      // 기본값이 weekly이므로 1주일 후로 설정
      const endDateTime = new Date(today);
      endDateTime.setDate(today.getDate() + 7);
      const endDate = endDateTime.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        start_date: startDate,
        end_date: endDate
      }));
    }
  }, [isOpen, formData.start_date, formData.end_date]);

  // 기간 변경 시 시작일/종료일 자동 설정
  const handlePeriodChange = (e) => {
    const period = e.target.value;
    const today = new Date();
    
    // 시작일은 오늘로 설정
    const startDate = today.toISOString().split('T')[0];
    
    // 종료일은 기간에 따라 계산
    let endDate;
    if (period === 'weekly') {
      // 1주일 후
      const endDateTime = new Date(today);
      endDateTime.setDate(today.getDate() + 7);
      endDate = endDateTime.toISOString().split('T')[0];
    } else if (period === 'monthly') {
      // 1개월 후
      const endDateTime = new Date(today);
      endDateTime.setMonth(today.getMonth() + 1);
      endDate = endDateTime.toISOString().split('T')[0];
    }
    
    setFormData(prev => ({
      ...prev,
      period,
      start_date: startDate,
      end_date: endDate
    }));
    
    // 에러 클리어
    if (errors.period || errors.start_date || errors.end_date) {
      setErrors(prev => ({
        ...prev,
        period: null,
        start_date: null,
        end_date: null
      }));
    }
  };

  // 폼 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    if (type === 'checkbox') {
      processedValue = checked;
    } else if (type === 'number') {
      // 숫자 입력 처리
      if (value === '') {
        processedValue = '';  // 빈 문자열은 그대로 유지
      } else {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          processedValue = numValue;
        } else {
          return; // 유효하지 않은 값은 무시
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // 에러 클리어
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };



  // 참여자 수별 보상 배수 자동 설정
  const handleMinParticipantsChange = (e) => {
    const participants = Number(e.target.value);
    let multiplier = 1.5;
    
    if (participants >= 100) multiplier = 5.0;
    else if (participants >= 50) multiplier = 3.0;
    else if (participants >= 25) multiplier = 2.5;
    else if (participants >= 10) multiplier = 2.0;
    else if (participants >= 5) multiplier = 1.5;
    
    setFormData(prev => ({
      ...prev,
      min_participants: participants,
      reward_multiplier: multiplier
    }));
    
    if (errors.min_participants) {
      setErrors(prev => ({ ...prev, min_participants: null }));
    }
  };

  // 폼 검증
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '챌린지 이름을 입력해주세요.';
    } else if (formData.name.length > 100) {
      newErrors.name = '챌린지 이름은 100자 이하로 입력해주세요.';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '챌린지 설명을 입력해주세요.';
    } else if (formData.description.length > 500) {
      newErrors.description = '설명은 500자 이하로 입력해주세요.';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = '시작일을 선택해주세요.';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = '종료일을 선택해주세요.';
    } else if (formData.start_date && formData.end_date <= formData.start_date) {
      newErrors.end_date = '종료일은 시작일보다 뒤여야 합니다.';
    }
    
    // 개인 챌린지가 아닌 경우에만 참여 비용 검증
    if (!formData.is_personal) {
      const entryCost = formData.entry_cost === '' ? 0 : Number(formData.entry_cost);
      if (isNaN(entryCost) || entryCost < 0) {
        newErrors.entry_cost = '참여 비용은 0 이상이어야 합니다.';
      } else if (pointBalance !== undefined && pointBalance !== null && entryCost > pointBalance) {
        newErrors.entry_cost = `보유 포인트(${pointBalance}P)보다 많을 수 없습니다.`;
      }
    }
    
    if (formData.min_participants < 1 || formData.min_participants > 1000) {
      newErrors.min_participants = '최소 참여자는 1~1000명 사이여야 합니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // 챌린지 생성 데이터 준비
      const submitData = {
        ...formData,
        period: formData.period === 'weekly' ? 'W' : 'M', // 백엔드 형식에 맞춤
        entry_cost: formData.entry_cost === '' ? 0 : Number(formData.entry_cost),
        // 백엔드 필수 필드 추가
        goal_type: 'WORKOUT_COUNT', // 기본값: 운동 횟수
        goal_value: formData.period === 'weekly' ? 7 : 30, // 주간: 7회, 월간: 30회
        target_value: formData.period === 'weekly' ? 7 : 30, // goal_value와 동일
        status: 'active'
      };
      
      const newChallenge = await createChallenge(submitData);
      console.log('✅ 챌린지 생성 성공:', newChallenge);
      
      // 성공 콜백 호출
      if (onSuccess) {
        console.log('🔄 성공 콜백 호출 중...');
        onSuccess(newChallenge);
      }
      
      // 모달 닫기 및 폼 초기화
      console.log('🚪 모달 닫기');
      onClose();
      setFormData({
        name: '',
        description: '',
        period: 'weekly',
        is_personal: false,
        entry_cost: 100,
        min_participants: 5,
        reward_multiplier: 1.5,
        start_date: '',
        end_date: ''
      });
      
    } catch (error) {
      console.error('챌린지 생성 실패:', error);
      setErrors({
        submit: error.response?.data?.message || error.message || '챌린지 생성에 실패했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  // 오늘 날짜 (최소 시작일)
  const today = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold">새 챌린지 만들기</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">기본 정보</h3>
            
            {/* 챌린지 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                챌린지 이름 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="예: 7일 연속 운동 챌린지"
                maxLength={100}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명 *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="챌린지에 대한 자세한 설명을 입력하세요..."
                maxLength={500}
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.description.length}/500
              </div>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* 기간 및 타입 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  기간
                </label>
                <select
                  name="period"
                  value={formData.period}
                  onChange={handlePeriodChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="weekly">주간 (1주)</option>
                  <option value="monthly">월간 (1개월)</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_personal"
                    checked={formData.is_personal}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">개인 챌린지</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  개인 챌린지는 나만 참여할 수 있습니다
                </p>
              </div>
            </div>
          </div>

          {/* 날짜 설정 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">날짜 설정</h3>
              <p className="text-sm text-gray-500">
                {formData.period === 'weekly' ? '1주일 챌린지' : '1개월 챌린지'} 
                {formData.start_date && formData.end_date && (
                  <span className="ml-2 text-primary">
                    ({formData.start_date} ~ {formData.end_date})
                  </span>
                )}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작일 *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  min={today}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.start_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.start_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료일 *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  min={formData.start_date || today}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.end_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.end_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                )}
              </div>
            </div>
            
            {/* 자동 설정 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  기간을 변경하면 오늘부터 {formData.period === 'weekly' ? '1주일' : '1개월'} 후까지 자동으로 설정됩니다.
                </span>
              </div>
            </div>
          </div>

          {/* 포인트 설정 */}
          {!formData.is_personal && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">포인트 설정</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    참여 비용
                  </label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="entry_cost"
                      value={formData.entry_cost}
                      onChange={handleInputChange}
                      min={0}
                      max={pointBalance || 999999}
                      step={10}
                      className={`w-full pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.entry_cost ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">P</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    보유: {pointBalance}P
                  </p>
                  {errors.entry_cost && (
                    <p className="text-red-500 text-sm mt-1">{errors.entry_cost}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    최소 참여자 수
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="min_participants"
                      value={formData.min_participants}
                      onChange={handleMinParticipantsChange}
                      min={1}
                      max={1000}
                      step={1}
                      className={`w-full pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.min_participants ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">명</span>
                  </div>
                  {errors.min_participants && (
                    <p className="text-red-500 text-sm mt-1">{errors.min_participants}</p>
                  )}
                </div>
              </div>

              {/* 보상 배수 표시 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    예상 보상: {Math.round(formData.entry_cost * formData.reward_multiplier)}P
                  </span>
                </div>
                <p className="text-xs text-yellow-700">
                  참여자 수가 많을수록 보상 배수가 증가합니다 (현재 {formData.reward_multiplier}x)
                </p>
              </div>
            </div>
          )}

          {/* 에러 메시지 */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{errors.submit}</span>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? '생성 중...' : '챌린지 생성'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeCreateModal; 