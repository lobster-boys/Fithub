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
      const response = await axiosInstance.patch(`/users/profile/${profile.user}/`, profileData);
      setProfile(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorMessage = err.response?.data?.detail || 
                          Object.values(err.response?.data || {}).flat().join(', ') ||
                          '프로필 업데이트 중 오류가 발생했습니다.';
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
      await axiosInstance.delete(`/users/profile/${profile.user}/`);
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