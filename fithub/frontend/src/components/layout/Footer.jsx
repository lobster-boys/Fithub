import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <i className="fas fa-fire text-primary text-2xl"></i>
              <h2 className="text-xl font-bold">FitHub</h2>
            </Link>
            <p className="text-gray-400 text-sm">
              당신의 건강한 삶을 위한 최고의 선택, FitHub와 함께 건강한 라이프스타일을 만들어보세요.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">서비스</h3>
            <ul className="space-y-2">
              <li><Link to="/workouts" className="text-gray-400 hover:text-white text-sm">운동 프로그램</Link></li>
              <li><Link to="/diet" className="text-gray-400 hover:text-white text-sm">식단 관리</Link></li>
              <li><Link to="/community" className="text-gray-400 hover:text-white text-sm">커뮤니티</Link></li>
              <li><Link to="/shop" className="text-gray-400 hover:text-white text-sm">스토어</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">회사 정보</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white text-sm">회사 소개</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white text-sm">이용약관</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white text-sm">개인정보처리방침</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white text-sm">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">고객센터</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <i className="fas fa-map-marker-alt mt-1 text-primary"></i>
                <span className="text-gray-400 text-sm">서울특별시 강남구 테헤란로 123</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-phone mt-1 text-primary"></i>
                <span className="text-gray-400 text-sm">02-123-4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-envelope mt-1 text-primary"></i>
                <span className="text-gray-400 text-sm">support@fithub.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2023 FitHub. All rights reserved.</p>
          
          {/* Social Media Links */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 