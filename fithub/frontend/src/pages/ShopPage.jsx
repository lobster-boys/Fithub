import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ShopPage = () => {
  // 카테고리 상태
  const [activeCategory, setActiveCategory] = useState('all');

  // 상품 데이터
  const products = [
    {
      id: 1,
      name: '프리미엄 요가 매트',
      category: 'equipment',
      price: 39000,
      discount: 10,
      rating: 4.8,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1599447292461-38fb53fb0fee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      isBestseller: true
    },
    {
      id: 2,
      name: '조절식 덤벨 세트',
      category: 'equipment',
      price: 150000,
      discount: 0,
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1638536532686-d610adba8c7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
      isBestseller: true
    },
    {
      id: 3,
      name: '운동용 저항 밴드 세트',
      category: 'equipment',
      price: 25000,
      discount: 20,
      rating: 4.6,
      reviews: 245,
      image: 'https://images.unsplash.com/photo-1598550480917-1c485268a92a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      isBestseller: false
    },
    {
      id: 4,
      name: '프로틴 쉐이커 보틀',
      category: 'accessories',
      price: 15000,
      discount: 0,
      rating: 4.5,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80',
      isBestseller: false
    },
    {
      id: 5,
      name: '프리미엄 웨이트 프로틴',
      category: 'nutrition',
      price: 59000,
      discount: 5,
      rating: 4.7,
      reviews: 312,
      image: 'https://images.unsplash.com/photo-1579722821273-0f6c1b933c0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      isBestseller: true
    },
    {
      id: 6,
      name: '스포츠 손목 밴드',
      category: 'accessories',
      price: 12000,
      discount: 0,
      rating: 4.3,
      reviews: 68,
      image: 'https://images.unsplash.com/photo-1531917115039-473db54f8482?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      isBestseller: false
    }
  ];

  // 카테고리 필터링
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  // 카테고리 목록
  const categories = [
    { id: 'all', name: '전체 상품' },
    { id: 'equipment', name: '운동 기구' },
    { id: 'nutrition', name: '영양 보충제' },
    { id: 'accessories', name: '악세서리' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">FitHub 스토어</h1>
        <p className="text-gray-600">건강한 생활을 위한 최고의 피트니스 제품을 만나보세요.</p>
      </div>

      {/* 프로모션 배너 */}
      <div className="bg-gradient-to-r from-orange-400 to-primary rounded-xl p-6 mb-8 text-white flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">여름 맞이 특별 할인</h2>
          <p className="mb-4">모든 운동 기구 최대 20% 할인 혜택을 놓치지 마세요!</p>
          <button className="bg-white text-primary font-medium px-6 py-2 rounded-lg hover:bg-gray-100">
            할인 상품 보기
          </button>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1579758629938-03607ccdbaba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
          alt="Promotion" 
          className="w-40 h-40 object-cover rounded-lg mt-4 md:mt-0"
        />
      </div>

      {/* 카테고리 탭 */}
      <div className="flex overflow-x-auto pb-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full mr-2 ${
              activeCategory === category.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* 상품 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Link to={`/shop/${product.id}`} key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="relative">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-48 object-cover"
              />
              {product.discount > 0 && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {product.discount}% 할인
                </span>
              )}
              {product.isBestseller && (
                <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                  베스트셀러
                </span>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
              
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas fa-star ${i < Math.floor(product.rating) ? '' : 'text-gray-300'}`}></i>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
              </div>
              
              <div className="flex items-center">
                {product.discount > 0 ? (
                  <>
                    <span className="font-bold text-lg">{Math.round(product.price * (1 - product.discount / 100)).toLocaleString()}원</span>
                    <span className="text-sm text-gray-500 line-through ml-2">{product.price.toLocaleString()}원</span>
                  </>
                ) : (
                  <span className="font-bold text-lg">{product.price.toLocaleString()}원</span>
                )}
              </div>
            </div>
            
            <div className="px-4 pb-4">
              <button className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-orange-600 flex items-center justify-center">
                <i className="fas fa-shopping-cart mr-2"></i>
                장바구니에 담기
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ShopPage; 