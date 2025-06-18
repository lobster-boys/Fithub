import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import { useCart } from '../../hooks/useCart';

const ProductCard = ({
  product,
  compact = false,
  className = '',
  showAddToCart = true,
  ...props
}) => {
  if (!product) return null;
  
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, isInCart, loading } = useCart();

  const {
    id,
    name,
    price,
    discount = 0,
    rating = 0,
    reviewCount = 0,
    image,
    isBestseller = false,
  } = product;

  // 할인가 계산
  const discountedPrice = discount > 0 
    ? Math.round(price * (1 - discount / 100)) 
    : price;
    
  // 제품 상세 페이지로 이동하는 핸들러
  const handleCardClick = () => {
    console.log("상품 카드 클릭됨, 이름:", name, "ID:", id, "타입:", typeof id);
    navigate(`/shop/${id}`);
  };
  
  // 장바구니에 담기 핸들러 (클릭 이벤트 버블링 방지)
  const handleAddToCart = async (e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    
    try {
      await addToCart(id, 1);
      
      // 사용자에게 피드백 제공
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 2000); // 2초 후 메시지 사라짐
      
      console.log(`장바구니에 상품 추가: ${name}`);
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      alert('장바구니에 상품을 추가하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <Card 
      className={`${className} hover:shadow-md transition-shadow cursor-pointer relative`} 
      onClick={handleCardClick}
      {...props}
    >
      {/* 장바구니 추가 성공 메시지 */}
      {isAdded && (
        <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-1 text-xs font-medium z-10">
          장바구니에 추가됨!
        </div>
      )}
      <div className="relative">
        <img 
          src={image} 
          alt={name} 
          className={`w-full ${compact ? 'h-32' : 'h-48'} object-cover`}
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discount}% 할인
          </span>
        )}
        {isBestseller && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
            베스트셀러
          </span>
        )}
      </div>
      
      <div className="p-3">
        <h3 className={`${compact ? 'text-sm' : 'text-base'} font-bold text-gray-900 mb-1 line-clamp-2`}>{name}</h3>
        
        {rating > 0 && (
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400 text-xs">
              {[...Array(5)].map((_, i) => (
                <i 
                  key={i} 
                  className={i < Math.floor(rating) ? 'fas fa-star' : i < rating ? 'fas fa-star-half-alt' : 'far fa-star'}
                ></i>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">({reviewCount.toLocaleString()})</span>
          </div>
        )}
        
        <div className="flex items-center">
          {discount > 0 ? (
            <>
              <span className="font-bold text-primary">{discountedPrice.toLocaleString()}원</span>
              <span className="text-xs text-gray-500 line-through ml-2">{price.toLocaleString()}원</span>
            </>
          ) : (
            <span className="font-bold text-primary">{price.toLocaleString()}원</span>
          )}
        </div>
      </div>
      
      {showAddToCart && (
        <div className="px-3 pb-3">
          <button 
            onClick={handleAddToCart}
            disabled={loading}
            className={`block w-full py-2 rounded-lg font-medium text-center text-sm transition-colors
              ${loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : isAdded 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : isInCart(id)
                    ? 'bg-gray-500 hover:bg-gray-600 text-white'
                    : 'bg-primary hover:bg-orange-600 text-white'}`}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-1"></i>
                처리 중...
              </>
            ) : isAdded ? (
              <>
                <i className="fas fa-check mr-1"></i>
                장바구니에 추가됨
              </>
            ) : isInCart(id) ? (
              <>
                <i className="fas fa-plus mr-1"></i>
                수량 추가
              </>
            ) : (
              <>
                <i className="fas fa-shopping-cart mr-1"></i>
                장바구니에 담기
              </>
            )}
          </button>
        </div>
      )}
    </Card>
  );
};

export default ProductCard; 