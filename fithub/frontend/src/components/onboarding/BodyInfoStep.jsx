import React from 'react';

export default function BodyInfoStep({ data, updateField }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">신체 정보를 입력하세요</h2>
        <p className="text-gray-600">정확한 정보를 입력하면 더 정확한 추천을 받을 수 있습니다</p>
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
    </div>
  );
}