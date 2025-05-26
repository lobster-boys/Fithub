import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    username: '',
    avatar: '',
    height: '',
    weight: '',
    targetCalories: '',
    targetFrequency: '',
    fitnessLevel: '',
    age: '',
    goals: [],
    methods: [],
    equipment: [],
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // 온보딩 데이터 로드
  useEffect(() => {
    if (user) {
      // 온보딩 데이터 가져오기
      const onboardingData = localStorage.getItem(`fithub_onboarding_${user.id}`);
      const isOnboarded = localStorage.getItem(`fithub_onboarded_${user.id}`) === 'true';
      
      if (isOnboarded && onboardingData) {
        const parsedData = JSON.parse(onboardingData);
        
        setForm({
          username: user?.username || '',
          avatar: user?.avatar || '',
          height: parsedData.height || '',
          weight: parsedData.weight || '',
          targetCalories: parsedData.targetCalories || '2000', // 기본값 설정
          targetFrequency: parsedData.targetFrequency || '3', // 기본값 설정
          fitnessLevel: parsedData.fitness_level || '',
          age: parsedData.age || '',
          goals: parsedData.goals || [],
          methods: parsedData.methods || [],
          equipment: parsedData.equipment || [],
        });
      } else {
        // 온보딩 데이터가 없는 경우 기본값으로 설정
        setForm(prev => ({
          ...prev,
          username: user?.username || '',
          avatar: user?.avatar || '',
        }));
      }
      
      // 기존 프로필 사진이 있다면 미리보기 설정
      if (user?.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 파일 업로드 핸들러
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      // 파일 미리보기
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 프로필 사진 제거
  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setForm(prev => ({ ...prev, avatar: '' }));
  };

  const handleSave = () => {
    // 프로필 사진 처리 (실제 구현에서는 서버에 업로드)
    let avatarUrl = form.avatar;
    if (avatarFile) {
      // 임시로 로컬 스토리지에 base64로 저장 (실제로는 서버 업로드 필요)
      avatarUrl = avatarPreview;
    }

    // 업데이트된 사용자 정보
    const updatedUser = { 
      ...user, 
      ...form,
      avatar: avatarUrl
    };

    // 로컬 스토리지에 프로필 정보 저장
    if (user) {
      localStorage.setItem(`fithub_user_${user.id}`, JSON.stringify(updatedUser));
      
      // 온보딩 데이터도 업데이트
      const onboardingData = {
        fitness_level: form.fitnessLevel,
        height: form.height,
        weight: form.weight,
        age: form.age,
        goals: form.goals,
        methods: form.methods,
        equipment: form.equipment,
        targetCalories: form.targetCalories,
        targetFrequency: form.targetFrequency,
      };
      localStorage.setItem(`fithub_onboarding_${user.id}`, JSON.stringify(onboardingData));
      
      alert('프로필이 저장되었습니다.');
    }
  };

  // 목표 달성률 계산
  const progress = form.targetCalories
    ? Math.min(100, Math.round((user?.totalCalories || 0) / form.targetCalories * 100))
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-orange-500">
        <h1 className="text-3xl font-bold text-orange-500 mb-6 text-center">내 프로필</h1>
        
        <div className="space-y-6">
          {/* 프로필 사진 업로드 */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-orange-200">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="프로필 사진" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fas fa-user text-4xl text-gray-400"></i>
                  </div>
                )}
              </div>
              
              {avatarPreview && (
                <button
                  onClick={removeAvatar}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              )}
            </div>
            
            <div className="mt-4 flex space-x-2">
              <label className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition cursor-pointer">
                <i className="fas fa-camera mr-2"></i>
                사진 선택
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-user mr-2 text-orange-500"></i>이름
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
                placeholder="이름을 입력하세요"
              />
            </div>

            {/* 나이 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-birthday-cake mr-2 text-orange-500"></i>나이
              </label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
                placeholder="나이"
                readOnly
              />
            </div>
          </div>

          {/* 신체 정보 */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              <i className="fas fa-ruler mr-2 text-orange-500"></i>신체 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">키 (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={form.height}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
                  placeholder="170"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">체중 (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
                  placeholder="70"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* 목표 설정 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              <i className="fas fa-target mr-2 text-green-500"></i>목표 설정
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">목표 칼로리 (kcal/일)</label>
                <input
                  type="number"
                  name="targetCalories"
                  value={form.targetCalories}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
                  placeholder="2000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">운동 빈도 (회/주)</label>
                <input
                  type="number"
                  name="targetFrequency"
                  value={form.targetFrequency}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
                  placeholder="3"
                />
              </div>
            </div>
          </div>

          {/* 목표 달성률 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              <i className="fas fa-chart-line mr-2 text-blue-500"></i>목표 달성률
            </h3>
            <div className="w-full bg-gray-200 h-6 rounded-full overflow-hidden">
              <div
                className="h-6 bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${progress}%` }}
              >
                <span className="text-white text-xs font-medium">
                  {progress > 10 ? `${progress}%` : ''}
                </span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 text-center">
              현재 진행률: <strong>{progress}%</strong>
            </p>
          </div>

          {/* 온보딩 정보 */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              <i className="fas fa-info-circle mr-2 text-purple-500"></i>운동 프로필
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="mb-2">
                  <strong>피트니스 레벨:</strong><br/>
                  <span className="text-purple-600">{form.fitnessLevel || '미설정'}</span>
                </p>
                <p>
                  <strong>운동 목적:</strong><br/>
                  <span className="text-purple-600">
                    {form.goals.length ? form.goals.join(', ') : '미설정'}
                  </span>
                </p>
              </div>
              <div>
                <p className="mb-2">
                  <strong>운동 방법:</strong><br/>
                  <span className="text-purple-600">
                    {form.methods.length ? form.methods.join(', ') : '미설정'}
                  </span>
                </p>
                <p>
                  <strong>운동 장비:</strong><br/>
                  <span className="text-purple-600">
                    {form.equipment.length ? form.equipment.join(', ') : '미설정'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition duration-200 font-semibold text-lg shadow-lg"
          >
            <i className="fas fa-save mr-2"></i>프로필 저장
          </button>

          {/* 온보딩 재설정 버튼 */}
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition duration-200 font-medium"
          >
            <i className="fas fa-redo mr-2"></i>온보딩 다시 하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
