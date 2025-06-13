import React from 'react';

export default function MethodStep({ data, updateField }) {
  const methods = ['웨이트 트레이닝', '유산소 운동', '요가/필라테스', '고강도 인터벌'];

  const toggleMethod = method => {
    const list = data.methods.includes(method)
      ? data.methods.filter(m => m !== method)
      : [...data.methods, method];
    updateField('methods', list);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">운동 방식을 선택하세요</h2>
      <div className="grid grid-cols-2 gap-4">
        {methods.map(m => (
          <button
            key={m}
            onClick={() => toggleMethod(m)}
            className={`p-4 border rounded-2xl shadow-sm text-center hover:shadow-md transition ${
              data.methods.includes(m)
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}