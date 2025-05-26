import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    username: '',
    avatar: '',
    height: '',
    weight: '',
    targetCalories: '',
    targetFrequency: '',
    fitnessLevel: '',   // 피트니스 레벨
    age: '',            // 나이
    goals: [],          // 운동 목적
    methods: [],        // 운동 방법
    equipment: [],      // 운동 장비

  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const { data } = await axios.get('/api/profile/', { headers: { Authorization: `Bearer ${token}` } });
    setUser(data);
     setForm({
       username: data.username || '',
       avatar: data.avatar || '',
       height: data.height || '',
       weight: data.weight || '',
       targetCalories: data.targetCalories || '',
       targetFrequency: data.targetFrequency || '',
       // ── 응답에 포함된 온보딩 필드들
       fitnessLevel: data.fitness_level || '',
       age: data.age || '',
       goals: data.goals || [],
       methods: data.methods || [],
       equipment: data.equipment || [],
    });
      } catch (error) {
        console.error('프로필을 불러오는 중 오류 발생:', error);
      }
    };
    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        '/api/profile/',
        { ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser((prev) => ({ ...prev, ...form }));
    } catch (error) {
      console.error('프로필 저장 중 오류 발생:', error);
    }
  };

  if (!user) {
    return <div className="container mx-auto px-4 py-8">로딩 중...</div>;
  }

  const progress = form.targetCalories
    ? Math.min(
        100,
        Math.round((user.totalCalories / form.targetCalories) * 100)
      )
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-8 border border-orange-500">
        <h1 className="text-3xl font-bold text-orange-500 mb-6">내 프로필</h1>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              프로필 사진 URL
            </label>
            <input
              type="url"
              name="avatar"
              value={form.avatar}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                키 (cm)
              </label>
              <input
                type="number"
                name="height"
                value={form.height}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                체중 (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                목표 칼로리 (kcal)
              </label>
              <input
                type="number"
                name="targetCalories"
                value={form.targetCalories}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                운동 빈도 (회/주)
              </label>
              <input
                type="number"
                name="targetFrequency"
                value={form.targetFrequency}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              목표 달성률
            </h2>
            <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
              <div
                className="h-4 bg-orange-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-right text-sm text-gray-600">
              {progress}%
            </p>
          </div>
          <div className="mt-8 bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">온보딩 정보</h2>
          <p>
            <strong>피트니스 레벨:</strong>{' '}
            {form.fitnessLevel || '미설정'}
          </p>
          <p>
            <strong>나이:</strong>{' '}
            {form.age ? `${form.age}세` : '미설정'}
          </p>
          <p>
            <strong>운동 목적:</strong>{' '}
            {form.goals.length ? form.goals.join(', ') : '미설정'}
          </p>
          <p>
            <strong>운동 방법:</strong>{' '}
            {form.methods.length ? form.methods.join(', ') : '미설정'}
          </p>
         <p>
            <strong>운동 장비:</strong>{' '}
           {form.equipment.length ? form.equipment.join(', ') : '미설정'}
          </p>
        </div>
          <button
            onClick={handleSave}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg"
          >
            변경 사항 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
