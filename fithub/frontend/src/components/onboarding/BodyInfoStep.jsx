import React from 'react';

export default function BodyInfoStep({ data, updateField }) {
  // BMR 계산 함수 (Harris-Benedict 공식)
  const calculateBMR = (weight, height, age, gender = 'm') => {
    if (!weight || !height || !age) return 0;
    
    const w = parseFloat(weight);
    const h = parseInt(height);
    const a = parseInt(age);
    
    if (gender === 'f') {
      return 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    } else {
      return 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
    }
  };

  // 일일 목표 칼로리 계산 (활동 수준 고려)
  const calculateTargetCalories = () => {
    const bmr = calculateBMR(data.weight, data.height, data.age, data.gender);
    
    // 기본적으로 중간 활동 수준(1.5)을 적용
    const activityMultiplier = 1.5;
    
    return Math.round(bmr * activityMultiplier);
  };

  // 목표 칼로리가 계산되면 자동으로 업데이트
  React.useEffect(() => {
    if (data.weight && data.height && data.age) {
      const targetCalories = calculateTargetCalories();
      if (targetCalories > 0) {
        updateField('target_calories', targetCalories);
      }
    }
  }, [data.weight, data.height, data.age, data.gender]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">신체 정보를 입력하세요</h2>
        <p className="text-gray-600">정확한 정보를 입력하면 더 정확한 추천을 받을 수 있습니다</p>
      </div>
      
      <div className="flex flex-col">
        <label className="mb-2 text-sm font-medium text-gray-700">성별</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="m"
              checked={data.gender === 'm'}
              onChange={e => updateField('gender', e.target.value)}
              className="mr-2"
            />
            남성
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="f"
              checked={data.gender === 'f'}
              onChange={e => updateField('gender', e.target.value)}
              className="mr-2"
            />
            여성
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700">키 (cm)</label>
          <input
            type="number"
            value={data.height}
            onChange={e => updateField('height', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="예: 170"
            min="100"
            max="250"
          />
          {data.height && (parseInt(data.height) < 100 || parseInt(data.height) > 250) && (
            <p className="text-red-500 text-sm mt-1">100cm ~ 250cm 사이의 값을 입력해주세요</p>
          )}
        </div>
        
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700">몸무게 (kg)</label>
          <input
            type="number"
            step="0.1"
            value={data.weight}
            onChange={e => updateField('weight', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="예: 65.5"
            min="30"
            max="300"
          />
          {data.weight && (parseFloat(data.weight) < 30 || parseFloat(data.weight) > 300) && (
            <p className="text-red-500 text-sm mt-1">30kg ~ 300kg 사이의 값을 입력해주세요</p>
          )}
        </div>
        
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700">나이</label>
          <input
            type="number"
            value={data.age}
            onChange={e => updateField('age', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="예: 30"
            min="10"
            max="120"
          />
          {data.age && (parseInt(data.age) < 10 || parseInt(data.age) > 120) && (
            <p className="text-red-500 text-sm mt-1">10세 ~ 120세 사이의 값을 입력해주세요</p>
          )}
        </div>
      </div>
      
      {data.height && data.weight && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            BMI: {(parseFloat(data.weight) / Math.pow(parseInt(data.height) / 100, 2)).toFixed(1)}
            {(() => {
              const bmi = parseFloat(data.weight) / Math.pow(parseInt(data.height) / 100, 2);
              if (bmi < 18.5) return ' (저체중)';
              if (bmi < 25) return ' (정상)';
              if (bmi < 30) return ' (과체중)';
              return ' (비만)';
            })()}
          </p>
        </div>
      )}

      {data.weight && data.height && data.age && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium text-green-800">일일 목표 칼로리</h3>
            <div className="flex items-center space-x-2">
              <span className="text-green-700">권장: {calculateTargetCalories()}kcal</span>
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-green-700 mb-1">목표 칼로리 (직접 설정)</label>
              <input
                type="number"
                value={data.target_calories || calculateTargetCalories()}
                onChange={e => updateField('target_calories', parseInt(e.target.value))}
                className="p-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                min="1200"
                max="4000"
                placeholder={calculateTargetCalories()}
              />
              <p className="text-xs text-green-600 mt-1">
                기초대사율 기반 권장값입니다. 개인 목표에 따라 조정하세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}