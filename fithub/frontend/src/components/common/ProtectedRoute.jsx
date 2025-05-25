import React, { useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const [onboarded, setOnboarded] = useState(null);
  const location = useLocation();

  useEffect(() => {
      if (user) {
    axios.get('/api/user/profile/')
      .then(({ data }) => setOnboarded(data.is_onboarded))
     .catch(() => setOnboarded(false));
  } else {
    // 비로그인 상태인 경우에도 onboarded를 false로 초기화
    setOnboarded(false);
  }
  }, [user]);

  // 1) 로딩 중 체크
if (authLoading) {
  return <div>로딩 중...</div>;
}

// 2) 로그인 안 한 경우 → publicPaths만 통과시키고 나머지는 로그인으로
if (!user) {
  const publicPaths = ['/', '/auth/login', '/auth/register'];
  if (!publicPaths.includes(location.pathname)) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
}

// 3) 로그인은 됐지만 onboarded 데이터를 아직 못 받아 왔으면 로딩
if (onboarded === null) {
  return <div>로딩 중...</div>;
}

// 4) 온보딩이 안 끝났으면 온보딩 페이지로
if (!onboarded && location.pathname !== '/onboarding') {
  return <Navigate to="/onboarding" replace />;
}

// 5) 최종적으로 허용
return children;
};

export default ProtectedRoute;