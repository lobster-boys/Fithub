import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileNavigation from './components/layout/MobileNavigation';

// Pages
import HomePage from './pages/HomePage';
import WorkoutLogPage from './pages/WorkoutLogPage';
import CommunityPage from './pages/CommunityPage';
import ShopPage from './pages/ShopPage';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Placeholder Components - 실제 페이지 컴포넌트가 구현되기 전까지 사용
const PlaceholderPage = ({ title }) => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-2xl font-bold mb-4">{title} 페이지</h1>
    <p>이 페이지는 아직 개발 중입니다.</p>
  </div>
);

// 아직 구현되지 않은 페이지들은 플레이스홀더로 대체
const AuthPage = () => <PlaceholderPage title="로그인/회원가입" />;
const OnboardingPage = () => <PlaceholderPage title="온보딩" />;
const WorkoutPage = () => <PlaceholderPage title="운동" />;
const WorkoutDetailPage = () => <PlaceholderPage title="운동 상세" />;
const DietPage = () => <PlaceholderPage title="식단" />;
const CommunityPostPage = () => <PlaceholderPage title="게시글 상세" />;
const ProductDetailPage = () => <PlaceholderPage title="상품 상세" />;
const CartPage = () => <PlaceholderPage title="장바구니" />;
const CheckoutPage = () => <PlaceholderPage title="결제" />;
const OrderHistoryPage = () => <PlaceholderPage title="주문 내역" />;
const ProfilePage = () => <PlaceholderPage title="프로필" />;
const SettingsPage = () => <PlaceholderPage title="설정" />;

// 애니메이션이 있는 라우트 컴포넌트
const AnimatedRoutes = () => {
  const location = useLocation();
  // 실제 인증 상태에 따라 동적으로 변경됩니다
  const isLoggedIn = true;
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* 기본 페이지 */}
        <Route path="/" element={isLoggedIn ? <HomePage /> : <WelcomePage />} />
        
        {/* 인증 관련 페이지 */}
        <Route path="/auth">
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        
        {/* 온보딩 페이지 */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* 운동 관련 페이지 */}
        <Route path="/workouts">
          <Route index element={<WorkoutPage />} />
          <Route path="log" element={<WorkoutLogPage />} />
          <Route path=":workoutId" element={<WorkoutDetailPage />} />
        </Route>
        
        {/* 식단 관련 페이지 */}
        <Route path="/diet" element={<DietPage />} />
        
        {/* 커뮤니티 관련 페이지 */}
        <Route path="/community">
          <Route index element={<CommunityPage />} />
          <Route path=":postId" element={<CommunityPostPage />} />
        </Route>
        
        {/* 쇼핑 관련 페이지 */}
        <Route path="/shop">
          <Route index element={<ShopPage />} />
          <Route path=":productId" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrderHistoryPage />} />
        </Route>
        
        {/* 사용자 프로필 및 설정 관련 페이지 */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
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
  );
};

export default App; 