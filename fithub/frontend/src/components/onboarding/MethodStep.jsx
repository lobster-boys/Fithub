import React from 'react';

export default function MethodStep({ data, updateField }) {
  const methods = [
    { value: 'gym', label: '헬스장', icon: '🏋️‍♂️', description: '전문 장비와 시설 이용' },
    { value: 'home', label: '홈트레이닝', icon: '🏠', description: '집에서 편리하게' },
    { value: 'outdoor', label: '야외 운동', icon: '🌳', description: '공원, 산책로 등에서' },
    { value: 'group', label: '단체 운동', icon: '👥', description: '함께하는 재미' },
    { value: 'personal', label: '개인 트레이닝', icon: '🎯', description: '1:1 전문 지도' }
  ];

  const toggleMethod = methodValue => {
    const list = data.methods.includes(methodValue)
      ? data.methods.filter(m => m !== methodValue)
      : [...data.methods, methodValue];
    updateField('methods', list);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">운동 방식을 선택하세요</h2>
        <p className="text-gray-600">선호하는 운동 환경을 최대 3개까지 선택해주세요</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map(m => (
          <button
            key={m.value}
            onClick={() => toggleMethod(m.value)}
            disabled={!data.methods.includes(m.value) && data.methods.length >= 3}
            className={`relative p-5 border-2 rounded-xl shadow-sm text-left hover:shadow-md transition-all duration-200 ${
              data.methods.includes(m.value)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            } ${!data.methods.includes(m.value) && data.methods.length >= 3 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{m.icon}</div>
              <div className="flex-1">
                <div className="text-lg font-semibold mb-1">{m.label}</div>
                <div className="text-sm text-gray-600">{m.description}</div>
              </div>
            </div>
            {data.methods.includes(m.value) && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-green-800 font-medium">선택된 방법:</span>
          <span className="text-green-600">{data.methods.length}/3</span>
        </div>
        {data.methods.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {data.methods.map(method => {
              const option = methods.find(opt => opt.value === method);
              return (
                <span key={method} className="inline-flex items-center space-x-1 bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                  <span>{option?.icon}</span>
                  <span>{option?.label}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}