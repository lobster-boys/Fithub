import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileNavigation from './components/layout/MobileNavigation';

// Pages
import HomePage from './pages/home/HomePage';
import WorkoutLogPage from './pages/workout/WorkoutLogPage';
import CommunityPage from './pages/community/CommunityPage';
import ContentDetailPage from './pages/community/ContentDetailPage';
import EcommercePage from './pages/ecommerce/EcommercePage';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetailPage from './pages/ecommerce/ProductDetailPage';
import ShoppingCartPage from './pages/ecommerce/ShoppingCartPage';
import WorkoutDetailPage from './pages/workout/WorkoutDetailPage';
import IngredientDetailPage from './pages/diet/IngredientDetailPage';
import DietLogPage from './pages/diet/DietLogPage';
import OnboardingPage from './pages/OnboardingPage';

// Context and Hooks
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Placeholder Components - 실제 페이지 컴포넌트가 구현되기 전까지 사용
const PlaceholderPage = ({ title }) => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-2xl font-bold mb-4">{title} 페이지</h1>
    <p>이 페이지는 아직 개발 중입니다.</p>
  </div>
);

// 아직 구현되지 않은 페이지들은 플레이스홀더로 대체
const CheckoutPage = () => <PlaceholderPage title="결제" />;
const OrderHistoryPage = () => <PlaceholderPage title="주문 내역" />;
const ProfilePage = () => <PlaceholderPage title="프로필" />;
const SettingsPage = () => <PlaceholderPage title="설정" />;

// 인증이 필요한 페이지들을 보호하는 컴포넌트
const ProtectedPage = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  // 로그인하지 않은 경우 웰컴 페이지로
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 온보딩 체크
  if (user) {
    const onboarded = localStorage.getItem(`fithub_onboarded_${user.id}`) === 'true';
    
    // 온보딩이 안 끝났으면 온보딩 페이지로
    if (!onboarded && location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
    
    // 온보딩이 끝났는데 온보딩 페이지에 있으면 홈으로
    if (onboarded && location.pathname === '/onboarding') {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// 애니메이션이 있는 라우트 컴포넌트
const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* 기본 페이지 */}
        <Route path="/" element={isAuthenticated ? <HomePage /> : <WelcomePage />} />
        
        {/* 인증 관련 페이지 (로그인하지 않은 사용자만 접근 가능) */}
        <Route path="/auth/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/auth/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} />
        
        {/* 온보딩 페이지 (로그인한 사용자만 접근 가능) */}
        <Route path="/onboarding" element={
          <ProtectedPage>
            <OnboardingPage />
          </ProtectedPage>
        } />
        
        {/* 운동 관련 페이지 (인증 필요) */}
        <Route path="/workouts" element={
          <ProtectedPage>
            <WorkoutLogPage />
          </ProtectedPage>
        } />
        <Route path="/workouts/:workoutId" element={
          <ProtectedPage>
            <WorkoutDetailPage />
          </ProtectedPage>
        } />
        <Route path="/workouts/exercise/:exerciseId" element={
          <ProtectedPage>
            <WorkoutDetailPage />
          </ProtectedPage>
        } />
        
        {/* 식단 관련 페이지 (인증 필요) */}
        <Route path="/diet" element={
          <ProtectedPage>
            <DietLogPage />
          </ProtectedPage>
        } />
        <Route path="/diet/ingredient/:mealId" element={
          <ProtectedPage>
            <IngredientDetailPage />
          </ProtectedPage>
        } />
        
        {/* 커뮤니티 관련 페이지 (인증 필요) */}
        <Route path="/community" element={
          <ProtectedPage>
            <CommunityPage />
          </ProtectedPage>
        } />
        <Route path="/community/:postId" element={
          <ProtectedPage>
            <ContentDetailPage />
          </ProtectedPage>
        } />
        
        {/* 쇼핑 관련 페이지 (인증 필요) */}
        <Route path="/shop" element={
          <ProtectedPage>
            <EcommercePage />
          </ProtectedPage>
        } />
        <Route path="/shop/:productId" element={
          <ProtectedPage>
            <ProductDetailPage />
          </ProtectedPage>
        } />
        <Route path="/shop/cart" element={
          <ProtectedPage>
            <ShoppingCartPage />
          </ProtectedPage>
        } />
        <Route path="/shop/checkout" element={
          <ProtectedPage>
            <CheckoutPage />
          </ProtectedPage>
        } />
        <Route path="/shop/orders" element={
          <ProtectedPage>
            <OrderHistoryPage />
          </ProtectedPage>
        } />
        
        {/* 사용자 프로필 및 설정 관련 페이지 (인증 필요) */}
        <Route path="/profile" element={
          <ProtectedPage>
            <ProfilePage />
          </ProtectedPage>
        } />
        <Route path="/settings" element={
          <ProtectedPage>
            <SettingsPage />
          </ProtectedPage>
        } />
        
        {/* 404 페이지 */}
        <Route path="*" element={
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="mb-8">페이지를 찾을 수 없습니다.</p>
            <a href="/" className="text-primary hover:underline">홈으로 돌아가기</a>
          </div>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  // 모바일 디바이스 체크 (초기에는 윈도우 크기로 판단)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 윈도우 리사이즈 이벤트 리스너
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <AuthProvider>
     <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* 헤더 (고정 상단) */}
        <Header />
        
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 pb-16">
          <main className="container mx-auto px-4 py-6">
            <AnimatedRoutes />
          </main>
        </div>
        
        {/* 푸터 (데스크톱에서만 표시) */}
        {!isMobile && <Footer />}
        
        {/* 하단 탐색 바 (모바일에서만 표시) */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
            <MobileNavigation />
          </div>
        )}
      </div>
    </Router>
    </AuthProvider>
  );
};

export default App;