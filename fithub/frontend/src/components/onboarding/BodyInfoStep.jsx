import React from 'react';

export default function BodyInfoStep({ data, updateField }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">신체 정보를 입력하세요</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="mb-1">키 (cm)</label>
          <input
            type="number"
            value={data.height}
            onChange={e => updateField('height', e.target.value)}
            className="p-2 border rounded-lg"
            placeholder="예: 170"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">몸무게 (kg)</label>
          <input
            type="number"
            value={data.weight}
            onChange={e => updateField('weight', e.target.value)}
            className="p-2 border rounded-lg"
            placeholder="예: 65"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">나이</label>
          <input
            type="number"
            value={data.age}
            onChange={e => updateField('age', e.target.value)}
            className="p-2 border rounded-lg"
            placeholder="예: 30"
          />
        </div>
      </div>
    </div>
  );
}