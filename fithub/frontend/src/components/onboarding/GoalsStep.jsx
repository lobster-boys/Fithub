import React from 'react';

export default function GoalsStep({ data, updateField }) {
  const options = ['체중 감량', '근력 강화', '심폐 지구력', '유연성'];
  
  const toggleGoal = goal => {
    const list = data.goals.includes(goal)
      ? data.goals.filter(g => g !== goal)
      : [...data.goals, goal];
    updateField('goals', list);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">운동 목표를 선택하세요</h2>
      <div className="grid grid-cols-2 gap-4">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => toggleGoal(opt)}
            className={`p-4 border rounded-2xl shadow-sm text-center hover:shadow-md transition ${
              data.goals.includes(opt)
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
