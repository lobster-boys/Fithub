import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useOnboarding } from '../hooks/useOnboarding';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, updateProfile, createProfile, loading: profileLoading, error: profileError } = useProfile();
  const { onboardingData, loading: onboardingLoading, error: onboardingError } = useOnboarding();
  
  const [form, setForm] = useState({
    name: '',
    birth_date: '',
    gender: '',
    height: '',
    weight: '',
    fitness_goal: '',
    activity_level: '',
    profile_image: '',
    target_calories: 2000,
    target_protein: 75,
    target_carbs: 250,
    target_fat: 70,
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 프로필 및 온보딩 데이터 로드
  useEffect(() => {
    if (user) {
      // 프로필 데이터로 폼 초기화
      if (profile) {
        setForm({
          name: profile.name || '',
          birth_date: profile.birth_date || '',
          gender: profile.gender || '',
          height: profile.height || '',
          weight: profile.weight || '',
          fitness_goal: profile.fitness_goal || '',
          activity_level: profile.activity_level || '',
          profile_image: profile.profile_image || '',
          target_calories: profile.target_calories || 2000,
          target_protein: profile.target_protein || 75,
          target_carbs: profile.target_carbs || 250,
          target_fat: profile.target_fat || 70,
        });

        // 기존 프로필 사진이 있다면 미리보기 설정
        if (profile.profile_image) {
          setAvatarPreview(profile.profile_image);
        }
      } else if (onboardingData?.data) {
        // 프로필이 없지만 온보딩 데이터가 있는 경우
        const data = onboardingData.data;
        setForm(prev => ({
          ...prev,
          height: data.height || '',
          weight: data.weight || '',
          fitness_goal: data.fitness_level || '', // 매핑 필요
        }));
      }
    }
  }, [user, profile, onboardingData]);

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
    setForm(prev => ({ ...prev, profile_image: '' }));
  };

  const handleSave = async () => {
    // 기본적인 검증
    if (!form.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    // 생년월일 검증
    if (form.birth_date) {
      const birthDate = new Date(form.birth_date);
      const today = new Date();
      
      if (birthDate > today) {
        alert('생년월일은 오늘 날짜보다 이후일 수 없습니다.');
        return;
      }
      
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        alert('13세 이상만 가입 가능합니다.');
        return;
      }
      if (age > 100) {
        alert('올바른 생년월일을 입력해 주세요.');
        return;
      }
    }

    setSaving(true);
    setSuccessMessage('');

    try {
      // 프로필 사진 처리 (실제 구현에서는 서버에 업로드)
      let profileImageUrl = form.profile_image;
      if (avatarFile) {
        // TODO: 실제로는 서버에 파일 업로드 후 URL 받아와야 함
        profileImageUrl = avatarPreview;
      }

      const profileData = {
        name: form.name,
        birth_date: form.birth_date && form.birth_date.trim() !== '' ? form.birth_date : null,
        gender: form.gender && form.gender.trim() !== '' ? form.gender : null,
        height: form.height ? parseFloat(form.height) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        fitness_goal: form.fitness_goal && form.fitness_goal.trim() !== '' ? form.fitness_goal : null,
        activity_level: form.activity_level && form.activity_level.trim() !== '' ? form.activity_level : null,
        profile_image: profileImageUrl || null,
        target_calories: parseInt(form.target_calories) || 2000,
        target_protein: parseFloat(form.target_protein) || 75,
        target_carbs: parseFloat(form.target_carbs) || 250,
        target_fat: parseFloat(form.target_fat) || 70,
      };

      if (profile) {
        // 기존 프로필 업데이트
        await updateProfile(profileData);
        setSuccessMessage('프로필이 성공적으로 업데이트되었습니다!');
      } else {
        // 새 프로필 생성
        await createProfile(profileData);
        setSuccessMessage('프로필이 성공적으로 생성되었습니다!');
      }

      // 성공 메시지 표시 후 홈으로 이동
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      alert('프로필 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  // 목표 달성률 계산
  const progress = form.target_calories
    ? Math.min(100, Math.round((user?.totalCalories || 0) / form.target_calories * 100))
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
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
                placeholder="이름을 입력하세요"
              />
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-birthday-cake mr-2 text-orange-500"></i>생년월일
              </label>
              <input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]} // 오늘 날짜까지만 선택 가능
                min="1900-01-01" // 1900년부터 선택 가능
                className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
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
                  name="target_calories"
                  value={form.target_calories}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
                  placeholder="2000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">목표 단백질 (g/일)</label>
                <input
                  type="number"
                  name="target_protein"
                  value={form.target_protein}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
                  placeholder="75"
                />
              </div>
            </div>
          </div>

          {/* 영양 정보 */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              <i className="fas fa-apple-alt mr-2 text-purple-500"></i>영양 목표
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">목표 탄수화물 (g/일)</label>
                <input
                  type="number"
                  name="target_carbs"
                  value={form.target_carbs}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
                  placeholder="250"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">목표 지방 (g/일)</label>
                <input
                  type="number"
                  name="target_fat"
                  value={form.target_fat}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
                  placeholder="70"
                />
              </div>
            </div>
          </div>

          {/* 피트니스 정보 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              <i className="fas fa-dumbbell mr-2 text-blue-500"></i>피트니스 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
                >
                  <option value="">성별을 선택하세요</option>
                  <option value="m">남성</option>
                  <option value="f">여성</option>
                  <option value="o">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">피트니스 목표</label>
                <select
                  name="fitness_goal"
                  value={form.fitness_goal}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
                >
                  <option value="">목표를 선택하세요</option>
                  <option value="weight_loss">체중 감량</option>
                  <option value="muscle_gain">근육 증가</option>
                  <option value="maintenance">현상 유지</option>
                  <option value="endurance">지구력 향상</option>
                  <option value="strength">근력 향상</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">활동 수준</label>
                <select
                  name="activity_level"
                  value={form.activity_level}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3"
                >
                  <option value="">활동 수준을 선택하세요</option>
                  <option value="sedentary">앉아있는 생활</option>
                  <option value="light">가벼운 활동</option>
                  <option value="moderate">보통 활동</option>
                  <option value="active">활발한 활동</option>
                  <option value="very_active">매우 활발한 활동</option>
                </select>
              </div>
            </div>
          </div>

          {/* 로딩 상태 및 에러 표시 */}
          {(profileLoading || onboardingLoading || saving) && (
            <div className="text-center py-4">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-lg">
                <i className="fas fa-spinner fa-spin mr-2 text-blue-500"></i>
                <span className="text-blue-700">처리 중...</span>
              </div>
            </div>
          )}

          {(profileError || onboardingError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                <span className="text-red-700">{profileError || onboardingError}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                <span className="text-green-700">{successMessage}</span>
              </div>
            </div>
          )}

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={saving || profileLoading}
            className={`w-full py-4 px-6 rounded-lg transition duration-200 font-semibold text-lg shadow-lg ${
              saving || profileLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
            }`}
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>저장 중...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>프로필 저장
              </>
            )}
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
