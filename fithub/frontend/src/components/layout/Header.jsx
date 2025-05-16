import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const navigate = useNavigate();
  
  // 실제 인증 상태에 따라 동적으로 변경됩니다
  const isLoggedIn = false;
  
  const handleSearch = (e) => {
    e.preventDefault();
    // 검색 처리 로직
    setShowSearchBar(false);
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <i className="fas fa-fire text-primary text-2xl"></i>
          <h1 className="text-xl font-bold">FitHub</h1>
        </div>
        <div className="flex items-center space-x-4">
          {!showSearchBar ? (
            <>
              <button 
                onClick={() => setShowSearchBar(true)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <i className="fas fa-search text-gray-600"></i>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <i className="fas fa-bell text-gray-600"></i>
              </button>
              {isLoggedIn ? (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <span className="text-sm font-medium">U</span>
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