import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { saveOnboardingData, getOnboardingData } from '../api';

import FitnessLevelStep from '../components/onboarding/FitnessLevelStep';
import BodyInfoStep      from '../components/onboarding/BodyInfoStep';
import GoalsStep         from '../components/onboarding/GoalsStep';
import MethodStep        from '../components/onboarding/MethodStep';
import EquipmentStep     from '../components/onboarding/EquipmentStep';
import ProgressBar       from '../components/onboarding/ProgressBar';

const steps = [
  { id: 'level',    title: '피트니스 레벨', Component: FitnessLevelStep },
  { id: 'body',     title: '신체 정보',     Component: BodyInfoStep },
  { id: 'goals',    title: '운동 목적',     Component: GoalsStep },
  { id: 'methods',  title: '운동 방법',     Component: MethodStep },
  { id: 'equip',    title: '운동 장비',     Component: EquipmentStep },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState({
    fitness_level: '',
    height: '',
    weight: '',
    age: '',
    goals: [],
    methods: [],
    equipment: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // 컴포넌트 마운트 시 기존 온보딩 데이터 확인
  useEffect(() => {
    const checkExistingData = async () => {
      if (user) {
        try {
          const response = await getOnboardingData();
          if (response.completed && response.data) {
            // 기존 온보딩 데이터가 있으면 홈으로 리다이렉트 또는 수정 모드로 전환
            const shouldUpdate = window.confirm(
              '이미 온보딩을 완료하셨습니다. 정보를 수정하시겠습니까?'
            );
            if (shouldUpdate) {
              setFormData({
                fitness_level: response.data.fitness_level || '',
                height: response.data.height?.toString() || '',
                weight: response.data.weight?.toString() || '',
                age: response.data.age?.toString() || '',
                goals: response.data.goals || [],
                methods: response.data.methods || [],
                equipment: response.data.equipment || [],
              });
            } else {
              navigate('/');
              return;
            }
          }
        } catch (error) {
          console.log('기존 온보딩 데이터 없음:', error);
        }
      }
      setIsInitializing(false);
    };

    checkExistingData();
  }, [user, navigate]);

  const StepComponent = steps[current].Component;

  const validateCurrentStep = () => {
    switch (current) {
      case 0: // 피트니스 레벨
        return formData.fitness_level !== '';
      case 1: // 신체 정보
        return (
          formData.height !== '' && 
          formData.weight !== '' && 
          formData.age !== '' &&
          parseInt(formData.height) > 0 &&
          parseFloat(formData.weight) > 0 &&
          parseInt(formData.age) > 0
        );
      case 2: // 목표
        return formData.goals.length > 0;
      case 3: // 운동 방법
        return formData.methods.length > 0;
      case 4: // 장비 (선택사항)
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      let message = '';
      switch (current) {
        case 0:
          message = '피트니스 레벨을 선택해주세요.';
          break;
        case 1:
          message = '신체 정보를 올바르게 입력해주세요.';
          break;
        case 2:
          message = '운동 목표를 최소 1개 이상 선택해주세요.';
          break;
        case 3:
          message = '운동 방법을 최소 1개 이상 선택해주세요.';
          break;
        default:
          message = '필수 정보를 입력해주세요.';
      }
      alert(message);
      return;
    }

    if (current < steps.length - 1) {
      setCurrent(current + 1);
    } else {
      // 마지막 스텝: 온보딩 완료 처리
      await saveOnboardingDataAsync();
    }
  };

  const saveOnboardingDataAsync = async () => {
    setIsLoading(true);
    try {
      // 백엔드 API 호출
      const payload = {
        fitness_level: formData.fitness_level,
        height: parseInt(formData.height),
        weight: parseFloat(formData.weight),
        age: parseInt(formData.age),
        goals: formData.goals,
        methods: formData.methods,
        equipment: formData.equipment || [],
      };

      console.log('온보딩 데이터 전송:', payload);

      try {
        const response = await saveOnboardingData(payload);
        console.log('온보딩 저장 성공:', response);
        
        // 로컬 스토리지에도 백업으로 저장
        if (user) {
          localStorage.setItem(`fithub_onboarding_${user.id}`, JSON.stringify(formData));
          localStorage.setItem(`fithub_onboarded_${user.id}`, 'true');
        }
        
        alert('온보딩이 완료되었습니다! 맞춤형 추천을 받으실 수 있습니다.');
        navigate('/');
        
      } catch (apiError) {
        console.error('백엔드 API 호출 실패:', apiError);
        
        // API 호출이 실패해도 로컬 스토리지에 저장하여 개발 중에도 진행 가능
        if (user) {
          localStorage.setItem(`fithub_onboarding_${user.id}`, JSON.stringify(formData));
          localStorage.setItem(`fithub_onboarded_${user.id}`, 'true');
        }
        
        alert('온보딩 정보가 저장되었습니다. (개발 모드: 로컬 저장)');
        navigate('/');
      }
      
    } catch (err) {
      console.error('온보딩 저장 실패:', err);
      alert('온보딩 정보 저장에 실패했습니다. 네트워크를 확인하고 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldName = (fieldKey) => {
    const fieldNames = {
      fitness_level: '피트니스 레벨',
      height: '키',
      weight: '몸무게',
      age: '나이',
      goals: '운동 목표',
      methods: '운동 방법',
      equipment: '운동 장비'
    };
    return fieldNames[fieldKey] || fieldKey;
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">온보딩 데이터를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FitHub</h1>
            <p className="text-gray-600">맞춤형 피트니스 추천을 위한 정보를 입력해주세요</p>
          </div>
          
          <ProgressBar step={current + 1} total={steps.length} />

          <div className="mb-8">
            <StepComponent
              data={formData}
              updateField={updateField}
            />
          </div>

          <div className="flex justify-between">
            <button 
              onClick={handlePrev} 
              disabled={current === 0 || isLoading}
              className={`px-6 py-2 rounded-lg transition ${
                current === 0 || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              이전
            </button>
            
            <div className="text-center text-sm text-gray-500">
              {current + 1} / {steps.length}
            </div>
            
            <button 
              onClick={handleNext} 
              disabled={isLoading || !validateCurrentStep()}
              className={`px-6 py-2 rounded-lg transition ${
                isLoading || !validateCurrentStep()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  저장 중...
                </span>
              ) : (
                current === steps.length - 1 ? '완료' : '다음'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}