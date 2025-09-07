import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const NaverCallback = () => {
  const navigate = useNavigate();
  const { loadUser } = useAuth();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      navigate('/auth/login');
      return;
    }

    const exchangeCode = async () => {
      try {
        const { data } = await axiosInstance.post('/dj-rest-auth/naver/', { code });

        // JWT 저장
        if (data.access_token || data.access) {
          localStorage.setItem('access_token', data.access_token || data.access);
        }
        if (data.refresh_token || data.refresh) {
          localStorage.setItem('refresh_token', data.refresh_token || data.refresh);
        }

        // 토큰 저장 후 컨텍스트 상태 갱신
        await loadUser();
        navigate('/');
      } catch (err) {
        console.error('네이버 로그인 실패', err.response?.data);
        navigate('/auth/login');
      }
    };

    exchangeCode();
  }, [navigate, loadUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">네이버 로그인 중...</p>
    </div>
  );
};

export default NaverCallback; 