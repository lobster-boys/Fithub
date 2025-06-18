import React from 'react';

export default function GoalsStep({ data, updateField }) {
  const options = [
    { value: 'weight_loss', label: '체중 감량', icon: '📉', color: 'red' },
    { value: 'muscle_gain', label: '근육 증가', icon: '💪', color: 'blue' },
    { value: 'strength', label: '근력 향상', icon: '🔥', color: 'orange' },
    { value: 'endurance', label: '지구력 향상', icon: '🏃‍♂️', color: 'green' },
    { value: 'health', label: '건강 관리', icon: '❤️', color: 'pink' },
    { value: 'body_shape', label: '체형 관리', icon: '✨', color: 'purple' }
  ];
  
  const toggleGoal = goalValue => {
    const list = data.goals.includes(goalValue)
      ? data.goals.filter(g => g !== goalValue)
      : [...data.goals, goalValue];
    updateField('goals', list);
  };

  const getColorClasses = (color, isSelected) => {
    const colorMap = {
      red: isSelected ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-red-300',
      blue: isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300',
      orange: isSelected ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-orange-300',
      green: isSelected ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300',
      pink: isSelected ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 hover:border-pink-300',
      purple: isSelected ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300'
    };
    return colorMap[color] || 'border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">운동 목표를 선택하세요</h2>
        <p className="text-gray-600">최대 3개까지 선택할 수 있습니다</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => toggleGoal(opt.value)}
            disabled={!data.goals.includes(opt.value) && data.goals.length >= 3}
            className={`relative p-4 border-2 rounded-xl shadow-sm text-center hover:shadow-md transition-all duration-200 ${
              getColorClasses(opt.color, data.goals.includes(opt.value))
            } ${!data.goals.includes(opt.value) && data.goals.length >= 3 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-lg font-medium">{opt.label}</span>
            </div>
            {data.goals.includes(opt.value) && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-blue-800 font-medium">선택된 목표:</span>
          <span className="text-blue-600">{data.goals.length}/3</span>
        </div>
        {data.goals.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {data.goals.map(goal => {
              const option = options.find(opt => opt.value === goal);
              return (
                <span key={goal} className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
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
