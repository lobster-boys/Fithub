import React from 'react';

export default function FitnessLevelStep({ data, updateField }) {
  const levels = [
    { 
      value: 'beginner', 
      label: '초급', 
      description: '운동 경험이 없거나 6개월 미만',
      icon: '🌱'
    },
    { 
      value: 'intermediate', 
      label: '중급', 
      description: '규칙적으로 운동한 지 6개월 이상',
      icon: '💪'
    },
    { 
      value: 'advanced', 
      label: '고급', 
      description: '운동 경험이 풍부하고 체력이 우수',
      icon: '🏆'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">피트니스 레벨을 선택하세요</h2>
        <p className="text-gray-600">현재 운동 수준에 맞는 프로그램을 추천해드립니다</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {levels.map(level => (
          <button
            key={level.value}
            onClick={() => updateField('fitness_level', level.value)}
            className={`p-6 border-2 rounded-xl shadow-sm text-center hover:shadow-md transition-all duration-200 ${
              data.fitness_level === level.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-4xl mb-3">{level.icon}</div>
            <div className="text-xl font-semibold mb-2">{level.label}</div>
            <div className="text-sm text-gray-600">{level.description}</div>
          </button>
        ))}
      </div>
      
      {data.fitness_level && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm text-center">
            ✓ {levels.find(l => l.value === data.fitness_level)?.label} 레벨이 선택되었습니다
          </p>
        </div>
      )}
    </div>
  );
}