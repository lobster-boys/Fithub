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
    sale_price,
    discount = 0,
    rating = 0,
    reviewCount = 0,
    image,
    isBestseller = false,
  } = product;

  // 가격을 숫자로 변환 (백엔드에서 문자열로 올 수 있음)
  const numericPrice = parseFloat(price) || 0;
  
  // sale_price가 있고 0보다 큰 유효한 값인지 확인
  const numericSalePrice = sale_price && 
                          sale_price !== null && 
                          sale_price !== '0' && 
                          parseFloat(sale_price) > 0 ? 
                          parseFloat(sale_price) : null;

  // 디버깅 로그 (개발용)
  console.log(`[ProductCard] 상품: ${name} | 원가: ${numericPrice} | 할인가: ${numericSalePrice} | sale_price 원본: ${sale_price}`);

  // 실제 판매가격 결정 (sale_price가 유효하면 우선 사용, 아니면 원가)
  const actualPrice = numericSalePrice || numericPrice;
  
  // 할인가 계산
  const discountedPrice = discount > 0 
    ? Math.round(actualPrice * (1 - discount / 100)) 
    : actualPrice;
    
  // 할인 여부 판단 (sale_price가 있고 원가보다 낮거나 discount가 있으면 할인)
  const hasDiscount = (numericSalePrice && numericSalePrice < numericPrice) || discount > 0;
    
  // 제품 상세 페이지로 이동하는 핸들러
  const handleCardClick = () => {
    console.log("상품 카드 클릭됨, 이름:", name, "ID:", id, "타입:", typeof id);
    navigate(`/products/${id}`);
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
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDI0MCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDUgNzZDMTA1IDcyLjY4NiAxMDcuNjg2IDcwIDExMSA3MEgxMjlDMTMyLjMxNCA3MCAxMzUgNzIuNjg2IDEzNSA3NlY4OEMxMzUgOTEuMzE0IDEzMi4zMTQgOTQgMTI5IDk0SDExMUMxMDcuNjg2IDk0IDEwNSA5MS4zMTQgMTA1IDg4Vjc2WiIgZmlsbD0iI0Q1RDNEQ" Stroke="#999" stroke-width="1"/><text x="120" y="125" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="12">이미지 없음</text></svg>';
          }}
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {numericSalePrice && numericSalePrice < numericPrice 
              ? `${Math.round((1 - numericSalePrice / numericPrice) * 100)}% 할인`
              : `${discount}% 할인`
            }
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
          {hasDiscount ? (
            <>
              <span className="font-bold text-primary">{discountedPrice.toLocaleString()}원</span>
              <span className="text-xs text-gray-500 line-through ml-2">{numericPrice.toLocaleString()}원</span>
            </>
          ) : (
            <span className="font-bold text-primary">{actualPrice.toLocaleString()}원</span>
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