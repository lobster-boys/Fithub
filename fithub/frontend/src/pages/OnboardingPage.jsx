import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const navigate = useNavigate();

  const StepComponent = steps[current].Component;

  const handleNext = () => {
    if (current < steps.length - 1) {
      setCurrent(current + 1);
    } else {
      // 마지막 스텝: 서버에 저장 + 온보딩 완료 플래그 true
      axios.post('/api/user/profile/onboard/', formData)
        .then(() => navigate('/'))
        .catch(err => console.error(err));
    }
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="onboarding-container">
      <h1>FitHub</h1>
      <ProgressBar step={current + 1} total={steps.length} />

      <StepComponent
        data={formData}
        updateField={updateField}
      />

      <div className="buttons">
        <button onClick={handlePrev} disabled={current === 0}>
          이전
        </button>
        <button onClick={handleNext}>
          {current === steps.length - 1 ? '완료' : '다음'}
        </button>
      </div>
    </div>
  );
}