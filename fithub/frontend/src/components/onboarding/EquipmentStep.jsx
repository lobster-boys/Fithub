import React from 'react';

export default function EquipmentStep({ data, updateField }) {
  const items = [
    { value: 'dumbbells', label: '덤벨', icon: '🏋️', category: 'weights' },
    { value: 'barbell', label: '바벨', icon: '🏋️‍♀️', category: 'weights' },
    { value: 'resistance_bands', label: '저항 밴드', icon: '🎗️', category: 'accessories' },
    { value: 'pull_up_bar', label: '턱걸이 바', icon: '🎯', category: 'equipment' },
    { value: 'kettlebell', label: '케틀벨', icon: '⚡', category: 'weights' },
    { value: 'yoga_mat', label: '요가 매트', icon: '🧘‍♀️', category: 'accessories' },
    { value: 'none', label: '장비 없음', icon: '🚶‍♂️', category: 'bodyweight' }
  ];

  const toggleEquip = itemValue => {
    // '장비 없음'을 선택하면 다른 모든 장비 선택 해제
    if (itemValue === 'none') {
      updateField('equipment', data.equipment.includes('none') ? [] : ['none']);
      return;
    }
    
    // 다른 장비를 선택하면 '장비 없음' 선택 해제
    const currentEquipment = data.equipment.filter(eq => eq !== 'none');
    const list = currentEquipment.includes(itemValue)
      ? currentEquipment.filter(i => i !== itemValue)
      : [...currentEquipment, itemValue];
    updateField('equipment', list);
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      weights: 'border-red-200 bg-red-50 text-red-700',
      accessories: 'border-green-200 bg-green-50 text-green-700',
      equipment: 'border-blue-200 bg-blue-50 text-blue-700',
      bodyweight: 'border-gray-200 bg-gray-50 text-gray-700'
    };
    return colorMap[category] || 'border-gray-200 bg-gray-50 text-gray-700';
  };

  const isDisabled = (itemValue) => {
    if (itemValue === 'none') return false;
    if (data.equipment.includes('none')) return true;
    return !data.equipment.includes(itemValue) && data.equipment.length >= 5;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">사용 가능한 장비를 선택하세요</h2>
        <p className="text-gray-600">보유하고 있거나 사용할 수 있는 장비를 선택해주세요 (최대 5개)</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(item => (
          <label
            key={item.value}
            className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 ${
              data.equipment.includes(item.value)
                ? getCategoryColor(item.category)
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            } ${isDisabled(item.value) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="checkbox"
              checked={data.equipment.includes(item.value)}
              onChange={() => toggleEquip(item.value)}
              disabled={isDisabled(item.value)}
              className="sr-only"
            />
            <div className="text-3xl mb-2">{item.icon}</div>
            <span className="text-sm font-medium text-center">{item.label}</span>
            {data.equipment.includes(item.value) && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
            )}
          </label>
        ))}
      </div>
      
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-purple-800 font-medium">선택된 장비:</span>
          <span className="text-purple-600">{data.equipment.length}/5</span>
        </div>
        
        {data.equipment.length === 0 ? (
          <p className="text-purple-600 text-sm">장비를 선택하거나 '장비 없음'을 선택해주세요</p>
        ) : data.equipment.includes('none') ? (
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🚶‍♂️</span>
            <span className="text-purple-800 text-sm">장비 없이 맨몸 운동을 추천해드릴게요!</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.equipment.map(equipment => {
              const option = items.find(opt => opt.value === equipment);
              return (
                <span key={equipment} className="inline-flex items-center space-x-1 bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full">
                  <span>{option?.icon}</span>
                  <span>{option?.label}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-blue-800 text-sm text-center">
          💡 선택한 장비에 맞는 맞춤 운동 프로그램을 추천해드립니다
        </p>
      </div>
    </div>
  );
}
