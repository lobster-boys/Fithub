import React from 'react';

export default function ProgressBar({ step, total }) {
  const percent = Math.round((step / total) * 100);
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
      <div
        className="h-2 rounded-full"
        style={{ width: `${percent}%`, backgroundColor: '#3B82F6' }}
      />
    </div>
  );
}
