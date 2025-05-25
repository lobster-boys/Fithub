import React from 'react';

export default function EquipmentStep({ data, updateField }) {
  const items = ['덤벨', '바벨', '매트', '머신', '저항 밴드'];

  const toggleEquip = item => {
    const list = data.equipment.includes(item)
      ? data.equipment.filter(i => i !== item)
      : [...data.equipment, item];
    updateField('equipment', list);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">운동 장비를 선택하세요</h2>
      <div className="grid grid-cols-2 gap-4">
        {items.map(item => (
          <label
            key={item}
            className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={data.equipment.includes(item)}
              onChange={() => toggleEquip(item)}
              className="mr-2"
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
