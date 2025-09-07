import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from './useAuth';

export const useOnboarding = () => {
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);

  // 온보딩 데이터 조회
  const fetchOnboardingData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get('/onboarding/data/');
      setOnboardingData(response.data);
      setCompleted(response.data.completed || false);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch onboarding data:', err);
      if (err.response?.status === 404) {
        // 온보딩 데이터가 없는 경우
        setOnboardingData(null);
        setCompleted(false);
      } else {
        setError(err.response?.data?.detail || '온보딩 데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 온보딩 상태 조회
  const fetchOnboardingStatus = async () => {
    if (!user) return;
    
    try {
      const response = await axiosInstance.get('/onboarding/status/');
      setCompleted(response.data.onboarding_completed || false);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch onboarding status:', err);
      setCompleted(false);
    }
  };

  // 온보딩 데이터 저장
  const saveOnboardingData = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post('/onboarding/save/', data);
      setOnboardingData(response.data);
      setCompleted(true);
      return response.data;
    } catch (err) {
      console.error('Failed to save onboarding data:', err);
      const errorMessage = err.response?.data?.errors ? 
                          Object.values(err.response.data.errors).flat().join(', ') :
                          err.response?.data?.error || 
                          '온보딩 데이터 저장 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 온보딩 데이터 업데이트
  const updateOnboardingData = async (data, partial = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const method = partial ? 'patch' : 'put';
      const response = await axiosInstance[method]('/onboarding/update_data/', data);
      setOnboardingData(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to update onboarding data:', err);
      const errorMessage = err.response?.data?.errors ? 
                          Object.values(err.response.data.errors).flat().join(', ') :
                          err.response?.data?.error || 
                          '온보딩 데이터 업데이트 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 온보딩 초기화
  const resetOnboarding = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post('/onboarding/reset/');
      setOnboardingData(null);
      setCompleted(false);
      return response.data;
    } catch (err) {
      console.error('Failed to reset onboarding:', err);
      const errorMessage = err.response?.data?.error || '온보딩 초기화 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 온보딩 선택지 조회
  const fetchOnboardingChoices = async () => {
    try {
      const response = await axiosInstance.get('/onboarding/choices/');
      return response.data;
    } catch (err) {
      console.error('Failed to fetch onboarding choices:', err);
      return null;
    }
  };

  // 온보딩 히스토리 조회
  const fetchOnboardingHistory = async () => {
    try {
      const response = await axiosInstance.get('/onboarding/history/');
      return response.data;
    } catch (err) {
      console.error('Failed to fetch onboarding history:', err);
      return null;
    }
  };

  // 사용자가 변경될 때마다 온보딩 데이터 새로고침
  useEffect(() => {
    if (user) {
      fetchOnboardingStatus();
      fetchOnboardingData();
    } else {
      setOnboardingData(null);
      setCompleted(false);
    }
  }, [user]);

  return {
    onboardingData,
    loading,
    error,
    completed,
    fetchOnboardingData,
    fetchOnboardingStatus,
    saveOnboardingData,
    updateOnboardingData,
    resetOnboarding,
    fetchOnboardingChoices,
    fetchOnboardingHistory,
    refetch: fetchOnboardingData
  };
}; 