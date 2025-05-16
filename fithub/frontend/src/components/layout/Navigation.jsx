import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-50 md:hidden">
      <div className="container mx-auto px-4">
        <div className="flex justify-around">
          <Link 
            to="/"
            className={`py-3 px-4 flex flex-col items-center ${path === '/' ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
          >
            <i className="fas fa-home text-lg mb-1"></i>
            <span className="text-xs">홈</span>
          </Link>
          
          <Link 
            to="/workouts"
            className={`py-3 px-4 flex flex-col items-center ${path.includes('/workouts') ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
          >
            <i className="fas fa-dumbbell text-lg mb-1"></i>
            <span className="text-xs">운동</span>
          </Link>
          
          <Link 
            to="/diet"
            className={`py-3 px-4 flex flex-col items-center ${path.includes('/diet') ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
          >
            <i className="fas fa-utensils text-lg mb-1"></i>
            <span className="text-xs">식단</span>
          </Link>
          
          <Link 
            to="/community"
            className={`py-3 px-4 flex flex-col items-center ${path.includes('/community') ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
          >
            <i className="fas fa-users text-lg mb-1"></i>
            <span className="text-xs">커뮤니티</span>
          </Link>
          
          <Link 
            to="/shop"
            className={`py-3 px-4 flex flex-col items-center ${path.includes('/shop') ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
          >
            <i className="fas fa-shopping-bag text-lg mb-1"></i>
            <span className="text-xs">스토어</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 