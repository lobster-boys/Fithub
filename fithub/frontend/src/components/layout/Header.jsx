import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const Header = () => {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const navigate = useNavigate();
  
  // AuthContext에서 실제 인증 상태 가져오기
  const { user, isAuthenticated, logout } = useAuth();
  
  // 장바구니 상태 가져오기
  const { cartItemsCount, loading: cartLoading } = useCart();
  
  const handleSearch = (e) => {
    e.preventDefault();
    // 검색 처리 로직
    setShowSearchBar(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <i className="fas fa-fire text-primary text-2xl"></i>
          <h1 className="text-xl font-bold">FitHub</h1>
        </Link>
        <div className="flex items-center space-x-4">
          {!showSearchBar ? (
            <>
              <button 
                onClick={() => setShowSearchBar(true)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <i className="fas fa-search text-gray-600"></i>
              </button>
              <Link to="/shop/cart" className="p-2 rounded-full hover:bg-gray-100 relative">
                <i className="fas fa-shopping-cart text-gray-600"></i>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <i className="fas fa-bell text-gray-600"></i>
              </button>
              {isAuthenticated ? (
                <div className="relative group">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white cursor-pointer">
                    <span className="text-sm font-medium">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                  </div>
                  {/* 드롭다운 메뉴 */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="fas fa-user mr-2"></i>프로필
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link 
                      to="/routine-feed" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="fas fa-share-alt mr-2"></i>루틴 피드
                    </Link>
                    <Link 
                      to="/diet/recommendation" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="fas fa-utensils mr-2"></i>식단 추천
                    </Link>
                    <Link 
                      to="/community" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="fas fa-users mr-2"></i>커뮤니티
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link 
                      to="/settings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="fas fa-cog mr-2"></i>설정
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>로그아웃
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/auth/login')}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <i className="fas fa-user text-gray-600"></i>
                </button>
              )}
            </>
          ) : (
            <div className="absolute inset-x-0 top-0 h-16 bg-white px-4 flex items-center animate-fadeIn">
              <form onSubmit={handleSearch} className="flex-1 flex items-center">
                <button 
                  type="button" 
                  onClick={() => setShowSearchBar(false)}
                  className="mr-2"
                >
                  <i className="fas fa-arrow-left text-gray-600"></i>
                </button>
                <input
                  type="text"
                  placeholder="검색어를 입력하세요"
                  className="flex-1 border-none outline-none bg-transparent"
                  autoFocus
                />
                <button type="submit">
                  <i className="fas fa-search text-gray-600"></i>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 