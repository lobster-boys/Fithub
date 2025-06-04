import React from 'react';

export default function FitnessLevelStep({ data, updateField }) {
  const levels = ['초보자', '중급자', '고급자'];
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">피트니스 레벨을 선택하세요</h2>
      <div className="grid grid-cols-3 gap-4">
        {levels.map(level => (
          <button
            key={level}
            onClick={() => updateField('fitness_level', level)}
            className={`p-4 border rounded-2xl shadow-sm text-center hover:shadow-md transition ${
              data.fitness_level === level
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}