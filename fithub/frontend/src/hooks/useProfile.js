import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from './useAuth';

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 프로필 조회
  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get('/users/profiles/me/');
      setProfile(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      if (err.response?.status === 404) {
        // 프로필이 없는 경우 새로 생성할 수 있도록 null 유지
        setProfile(null);
      } else {
        setError(err.response?.data?.detail || '프로필을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 프로필 생성
  const createProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post('/users/profiles/', profileData);
      setProfile(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to create profile:', err);
      const errorMessage = err.response?.data?.detail || 
                          Object.values(err.response?.data || {}).flat().join(', ') ||
                          '프로필 생성 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 프로필 업데이트
  const updateProfile = async (profileData) => {
    if (!profile?.user) {
      throw new Error('프로필이 존재하지 않습니다.');
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Profile update request:', {
        endpoint: `/users/profiles/${profile.user}/`,
        data: profileData
      });
      
      // 정확한 API 엔드포인트 사용 (ViewSet 기반)
      const response = await axiosInstance.patch(`/users/profiles/${profile.user}/`, profileData);
      setProfile(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to update profile:', err);
      console.error('Error response:', err.response?.data); // 디버깅용 로그 추가
      console.error('Request data that caused error:', profileData); // 요청 데이터 로그
      
      // 더 자세한 에러 메시지 처리
      let errorMessage = '프로필 업데이트 중 오류가 발생했습니다.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // 개별 필드 에러 메시지 조합
        const fieldErrors = [];
        Object.entries(errorData).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            const fieldName = {
              'birth_date': '생년월일',
              'name': '이름',
              'height': '키', 
              'weight': '체중',
              'gender': '성별',
              'fitness_goal': '운동 목표',
              'activity_level': '활동 수준'
            }[field] || field;
            
            fieldErrors.push(`${fieldName}: ${messages.join(', ')}`);
          }
        });
        
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join('\n');
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 프로필 삭제
  const deleteProfile = async () => {
    if (!profile?.user) {
      throw new Error('프로필이 존재하지 않습니다.');
    }

    setLoading(true);
    setError(null);
    
    try {
      // 정확한 API 엔드포인트 사용 (ViewSet 기반)
      await axiosInstance.delete(`/users/profiles/${profile.user}/`);
      setProfile(null);
      return true;
    } catch (err) {
      console.error('Failed to delete profile:', err);
      const errorMessage = err.response?.data?.detail || '프로필 삭제 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 사용자가 변경될 때마다 프로필 새로고침
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    refetch: fetchProfile
  };
}; 