import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const MobileNavigation = () => {
  const location = useLocation();
  
  // 네비게이션 아이템
  const navItems = [
    {
      path: '/',
      icon: 'fas fa-home',
      label: '홈'
    },
    {
      path: '/workouts/log',
      icon: 'fas fa-dumbbell',
      label: '운동'
    },
    {
      path: '/shop',
      icon: 'fas fa-shopping-bag',
      label: '스토어'
    },
    {
      path: '/community',
      icon: 'fas fa-users',
      label: '커뮤니티'
    },
    {
      path: '/profile',
      icon: 'fas fa-user',
      label: '프로필'
    }
  ];
  
  // 현재 경로가 해당 네비게이션 항목에 포함되는지 확인
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="container mx-auto px-4">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="py-3 px-4 flex flex-col items-center"
            style={{ color: isActive(item.path) ? '#FC4E00' : '#6B7280' }}
          >
            <i className={`${item.icon} text-lg mb-1`}></i>
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation; 