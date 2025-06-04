import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCardList from '../../components/ecommerce/ProductCardList';
import useEcommerce from '../../hooks/useEcommerce';

const EcommercePage = () => {
  // 이커머스 훅 사용
  const { 
    getAllProducts, 
    getProductsByCategory, 
    getCategories, 
    activeCategory, 
    setActiveCategory 
  } = useEcommerce();

  // 상품 데이터
  const products = getAllProducts();
  const categories = getCategories();

  // 디버깅 목적으로 상품 ID 확인
  useEffect(() => {
    console.log("EcommercePage에서 사용 가능한 상품 ID:", products.map(p => `${p.id} (${typeof p.id})`));
  }, [products]);

  // 카테고리 필터링
  const filteredProducts = getProductsByCategory(activeCategory);

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
      <ProductCardList 
        products={filteredProducts} 
        gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        emptyMessage={`'${activeCategory}' 카테고리에 상품이 없습니다.`}
      />
    </div>
  );
};

export default EcommercePage; 