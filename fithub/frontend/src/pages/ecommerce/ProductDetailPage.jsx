import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import ProductCardList from '../../components/ecommerce/ProductCardList';
import useEcommerce from '../../hooks/useEcommerce';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../api/axiosConfig';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  // 훅 사용
  const {
    getProductById,
    getRelatedProducts,
    getProductReviews,
    getProductReviewStats,
    createReview,
    loading,
    error,
    formatPrice,
    calculateDiscountedPrice
  } = useEcommerce();
  
  const { addToCart, isInCart, loading: cartLoading } = useCart();
  const { user } = useAuth();

  // 상태 관리
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  
  // 관리자용 할인율 조정 상태
  const [showDiscountControl, setShowDiscountControl] = useState(false);
  const [tempDiscountRate, setTempDiscountRate] = useState(0);
  const [isUpdatingDiscount, setIsUpdatingDiscount] = useState(false);

  // 카테고리 이름 안전하게 추출하는 함수
  const getCategoryName = (product) => {
    if (!product) return '카테고리 없음';
    
    // category_name이 있으면 사용
    if (product.category_name && typeof product.category_name === 'string') {
      // 중첩된 JSON 문자열 처리
      if (product.category_name.includes('{') && product.category_name.includes('}')) {
        try {
          const parsed = JSON.parse(product.category_name);
          return parsed.name || '카테고리 없음';
        } catch (e) {
          // JSON 파싱 실패 시 문자열에서 이름 추출 시도
          const match = product.category_name.match(/'name':\s*'([^']+)'/);
          if (match) return match[1];
        }
      }
      return product.category_name;
    }
    
    // category 객체에서 이름 추출
    if (product.category) {
      if (typeof product.category === 'string') {
        // 문자열로 된 카테고리인 경우 JSON 파싱 시도
        if (product.category.includes('{') && product.category.includes('}')) {
          try {
            const parsed = JSON.parse(product.category);
            return parsed.name || '카테고리 없음';
          } catch (e) {
            // JSON 파싱 실패 시 문자열에서 이름 추출 시도
            const match = product.category.match(/'name':\s*'([^']+)'/);
            if (match) return match[1];
          }
        }
        return product.category;
      } else if (typeof product.category === 'object' && product.category.name) {
        // 객체인 경우 name 필드 사용
        if (typeof product.category.name === 'string' && 
            product.category.name.includes('{') && 
            product.category.name.includes('}')) {
          try {
            const parsed = JSON.parse(product.category.name);
            return parsed.name || '카테고리 없음';
          } catch (e) {
            // JSON 파싱 실패 시 문자열에서 이름 추출 시도
            const match = product.category.name.match(/'name':\s*'([^']+)'/);
            if (match) return match[1];
          }
        }
        return product.category.name;
      }
    }
    
    return '카테고리 없음';
  };

  // 상품 데이터 로드
  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) return;

      try {
        // 상품 정보 로드
        const productData = await getProductById(productId);
        if (productData) {
          setProduct(productData);
          
          // 병렬로 리뷰, 리뷰 통계, 관련 상품 로드
          const [reviewsData, reviewStatsData, relatedData] = await Promise.all([
            getProductReviews(productId),
            getProductReviewStats(productId),
            getRelatedProducts(productId, 4)
          ]);
          
          setReviews(reviewsData || []);
          setReviewStats(reviewStatsData || null);
          setRelatedProducts(relatedData || []);

          // 리뷰 통계 데이터로 상품 정보 동기화
          if (reviewStatsData) {
            setProduct(prev => ({
              ...prev,
              rating: reviewStatsData.average_rating || 0,
              review_count: reviewStatsData.total_reviews || 0
            }));
          }
        }
      } catch (err) {
        console.error('상품 데이터 로드 실패:', err);
      }
    };

    loadProductData();
  }, [productId, getProductById, getProductReviews, getProductReviewStats, getRelatedProducts]);

  // 수량 변경
  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    const maxQuantity = product?.stock_quantity || product?.stock || 10;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  // 장바구니 추가
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart(product.id, quantity);
      setCartMessage('장바구니에 추가되었습니다!');
      setTimeout(() => setCartMessage(''), 3000);
    } catch (err) {
      console.error('장바구니 추가 실패:', err);
      setCartMessage('장바구니 추가에 실패했습니다.');
      setTimeout(() => setCartMessage(''), 3000);
    }
  };

  // 바로 구매
  const handleBuyNow = async () => {
    if (!product) return;

    try {
      // 바로 구매할 상품 정보 생성
      const purchaseItem = {
        id: `temp_${Date.now()}`, // 임시 ID
        product: product,
        quantity: quantity
      };

      // 결제 페이지로 바로 이동 (장바구니를 거치지 않음)
      navigate('/billing', { 
        state: { 
          selectedItems: [purchaseItem],
          fromCart: false,
          directPurchase: true
        } 
      });
    } catch (err) {
      console.error('바로 구매 실패:', err);
      alert('구매 처리 중 오류가 발생했습니다.');
    }
  };

  // 리뷰 작성
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!reviewForm.title.trim()) {
      alert('리뷰 제목을 입력해주세요.');
      return;
    }
    
    if (!reviewForm.comment.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    
    setReviewLoading(true);
    
    try {
      const reviewData = {
        product: product.id,
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        content: reviewForm.comment.trim()
      };
      
      const newReview = await createReview(reviewData);
      if (newReview) {
        // 리뷰 목록 다시 불러오기 (확실한 동기화를 위해)
        const [updatedReviews, updatedStats] = await Promise.all([
          getProductReviews(productId),
          getProductReviewStats(productId)
        ]);
        
        setReviews(updatedReviews || []);
        setReviewStats(updatedStats);

        // 상품 정보도 업데이트된 통계로 동기화
        if (updatedStats) {
          setProduct(prev => ({
            ...prev,
            rating: updatedStats.average_rating || 0,
            review_count: updatedStats.total_reviews || 0
          }));
        }
        
        // 폼 초기화
        setReviewForm({ rating: 5, title: '', comment: '' });
        setShowReviewForm(false);
        
        alert('리뷰가 성공적으로 작성되었습니다!');
      }
    } catch (err) {
      console.error('리뷰 작성 실패:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          '리뷰 작성에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setReviewLoading(false);
    }
  };

  // 관리자 할인율 조정 함수
  const handleDiscountUpdate = async () => {
    if ((!user?.is_superuser && !user?.is_staff) || !product) return;

    setIsUpdatingDiscount(true);
    try {
      // 할인율을 백분율로 변환하여 sale_price 계산
      const discountRate = tempDiscountRate / 100;
      const originalPrice = parseFloat(product.price);
      const newSalePrice = discountRate > 0 ? originalPrice * (1 - discountRate) : null;

      // 백엔드에서 요구하는 전체 데이터 형식으로 구성
      const updateData = {
        name: product.name,
        description: product.description || '',
        price: originalPrice.toString(),
        sale_price: newSalePrice ? newSalePrice.toString() : null,
        stock_quantity: product.stock_quantity || product.stock || 0,
        is_food: product.is_food || false,
        is_active: product.is_active !== false,
        is_featured: product.is_featured || false,
        category: product.category?.id || product.category_id || 1
      };

      console.log('할인율 업데이트 데이터:', {
        originalPrice,
        discountRate: tempDiscountRate,
        newSalePrice,
        updateData
      });

      const response = await axiosInstance.put(`/ecommerce/products/${product.id}/`, updateData);
      
      if (response.data) {
        // 상품 정보 업데이트
        setProduct(prev => ({
          ...prev,
          sale_price: newSalePrice
        }));
        
        setCartMessage('할인율이 성공적으로 적용되었습니다!');
        setTimeout(() => setCartMessage(''), 3000);
        setShowDiscountControl(false);
      }
    } catch (err) {
      console.error('할인율 업데이트 실패:', err);
      
      // 오류 세부 정보 표시
      if (err.response?.data) {
        console.error('서버 응답:', err.response.data);
        const errorMessages = Object.values(err.response.data).flat();
        setCartMessage(`할인율 적용 실패: ${errorMessages.join(', ')}`);
      } else {
        setCartMessage('할인율 적용에 실패했습니다. 관리자 권한을 확인해주세요.');
      }
      setTimeout(() => setCartMessage(''), 5000);
    } finally {
      setIsUpdatingDiscount(false);
    }
  };

  // 할인율 초기화 함수
  const handleDiscountReset = async () => {
    if ((!user?.is_superuser && !user?.is_staff) || !product) return;

    setIsUpdatingDiscount(true);
    try {
      // 백엔드에서 요구하는 전체 데이터 형식으로 구성
      const updateData = {
        name: product.name,
        description: product.description || '',
        price: parseFloat(product.price).toString(),
        sale_price: null,
        stock_quantity: product.stock_quantity || product.stock || 0,
        is_food: product.is_food || false,
        is_active: product.is_active !== false,
        is_featured: product.is_featured || false,
        category: product.category?.id || product.category_id || 1
      };

      const response = await axiosInstance.put(`/ecommerce/products/${product.id}/`, updateData);
      
      if (response.data) {
        setProduct(prev => ({
          ...prev,
          sale_price: null
        }));
        
        setTempDiscountRate(0);
        setCartMessage('할인율이 초기화되었습니다.');
        setTimeout(() => setCartMessage(''), 3000);
      }
    } catch (err) {
      console.error('할인율 초기화 실패:', err);
      
      // 오류 세부 정보 표시
      if (err.response?.data) {
        console.error('서버 응답:', err.response.data);
        const errorMessages = Object.values(err.response.data).flat();
        setCartMessage(`할인율 초기화 실패: ${errorMessages.join(', ')}`);
      } else {
        setCartMessage('할인율 초기화에 실패했습니다. 관리자 권한을 확인해주세요.');
      }
      setTimeout(() => setCartMessage(''), 5000);
    } finally {
      setIsUpdatingDiscount(false);
    }
  };

  // 기본 이미지 설정 (SVG 데이터 URL)
  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTUwQzE3NSAxNDQuNDc3IDE3OS40NzcgMTQwIDE4NSAxNDBIMjE1QzIyMC41MjMgMTQwIDIyNSAxNDQuNDc3IDIyNSAxNTBWMTgwQzIyNSAxODUuNTIzIDIyMC41MjMgMTkwIDIxNSAxOTBIMTg1QzE3OS40NzcgMTkwIDE3NSAxODUuNTIzIDE3NSAxODBWMTUwWiIgZmlsbD0iI0Q1RDNEQ0EiIHN0cm9rZT0iIzk5OSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiPuydtOuvuOydhCDsl4bsnYw8L3RleHQ+Cjwvc3ZnPgo=';

  // 썸네일용 기본 이미지 (작은 크기)
  const defaultThumbnail = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSAzMEMzNSAyOC45IDM1LjkgMjggMzcgMjhINDNDNDQuMSAyOCA0NSAyOC45IDQ1IDMwVjM2QzQ1IDM3LjEgNDQuMSAzOCA0MyAzOEgzN0MzNS45IDM4IDM1IDM3LjEgMzUgMzZWMzBaIiBmaWxsPSIjRDVEM0RDQSIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjEiLz4KPHR4dCB4PSI0MCIgeT0iNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4Ij7snbTrr7ztlIwg7JeG7J2MPC90ZXh0Pgo8L3N2Zz4K';

  // 이미지 오류 처리 함수
  const handleImageError = (e, isThumbnail = false) => {
    // 이미 기본 이미지인 경우 더 이상 변경하지 않음 (무한 루프 방지)
    if (e.target.src.startsWith('data:image/svg+xml')) {
      return;
    }
    
    // 오류 발생한 이미지를 기본 이미지로 교체
    e.target.src = isThumbnail ? defaultThumbnail : defaultImage;
  };

  // PATCH를 사용한 부분 업데이트 함수 (대안)
  const handleDiscountUpdatePatch = async () => {
    if ((!user?.is_superuser && !user?.is_staff) || !product) return;

    setIsUpdatingDiscount(true);
    try {
      // 할인율을 백분율로 변환하여 sale_price 계산
      const discountRate = tempDiscountRate / 100;
      const originalPrice = parseFloat(product.price);
      const newSalePrice = discountRate > 0 ? originalPrice * (1 - discountRate) : null;

      // PATCH로 부분 업데이트
      const updateData = {
        sale_price: newSalePrice ? newSalePrice.toString() : null
      };

      console.log('PATCH 할인율 업데이트 데이터:', updateData);

      const response = await axiosInstance.patch(`/ecommerce/products/${product.id}/`, updateData);
      
      if (response.data) {
        setProduct(prev => ({
          ...prev,
          sale_price: newSalePrice
        }));
        
        setCartMessage('할인율이 성공적으로 적용되었습니다!');
        setTimeout(() => setCartMessage(''), 3000);
        setShowDiscountControl(false);
      }
    } catch (err) {
      console.error('PATCH 할인율 업데이트 실패:', err);
      
      // PUT 방식으로 재시도
      console.log('PUT 방식으로 재시도합니다...');
      return handleDiscountUpdate();
    } finally {
      setIsUpdatingDiscount(false);
    }
  };

  // 이미지 갤러리 처리
  const productImages = product ? [
    product.image || defaultImage,
    ...(product.additional_images || [])
  ].filter(Boolean) : [];

  // 기본 이미지가 없는 경우 플레이스홀더 사용
  const mainImage = productImages[selectedImageIndex] || defaultImage;

  // 로딩 상태
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">상품 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-red-800 mb-2">오류 발생</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/shop')}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            상품 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 상품이 없는 경우
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center bg-yellow-50 p-8 rounded-lg">
          <i className="fas fa-search text-yellow-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-yellow-800 mb-2">상품을 찾을 수 없습니다</h2>
          <p className="text-yellow-600 mb-4">요청하신 상품이 존재하지 않거나 삭제되었습니다.</p>
          <button 
            onClick={() => navigate('/shop')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            상품 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 실제 판매가격 계산
  const originalPrice = parseFloat(product.price) || 0;
  const salePrice = product.sale_price && parseFloat(product.sale_price) > 0 ? parseFloat(product.sale_price) : null;
  const actualPrice = salePrice || originalPrice;
  const discountRate = salePrice ? Math.round((1 - salePrice / originalPrice) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate('/shop')}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <i className="fas fa-arrow-left mr-2"></i>
        상품 목록으로 돌아가기
      </button>

      {/* 장바구니 추가 메시지 */}
      {cartMessage && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg z-50 transition-all ${
          cartMessage.includes('성공') || cartMessage.includes('추가') 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <i className={`fas ${
            cartMessage.includes('성공') || cartMessage.includes('추가') 
              ? 'fa-check' 
              : 'fa-exclamation-triangle'
          } mr-2`}></i>
          {cartMessage}
        </div>
      )}

      {/* 상품 기본 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 이미지 갤러리 */}
        <div>
          {/* 메인 이미지 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4 relative">
            <img 
              src={mainImage} 
              alt={product.name} 
              className="w-full h-96 object-cover cursor-zoom-in"
              onClick={() => setIsImageModalOpen(true)}
              onError={(e) => handleImageError(e, false)}
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
                {product.discount}% 할인
              </span>
            )}
            {product.is_bestseller && (
              <span className="absolute top-4 right-4 bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
                베스트셀러
              </span>
            )}
          </div>
          
          {/* 이미지 썸네일 */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((img, index) => (
                <div 
                  key={`product-image-${product.id}-${index}`} 
                  className={`bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} ${index + 1}`} 
                    className="w-full h-20 object-cover"
                    onError={(e) => handleImageError(e, true)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 상품 정보 */}
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* 카테고리 및 태그 */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {getCategoryName(product)}
              </span>
              {product.is_bestseller && (
                <span className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded">
                  🏆 베스트셀러
                </span>
              )}
              {(product.stock_quantity || product.stock) <= 10 && (product.stock_quantity || product.stock) > 0 && (
                <span className="bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded">
                  ⚠️ 품절 임박
                </span>
              )}
            </div>
            
            {/* 상품명 */}
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            {/* 별점 및 리뷰 */}
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={`product-rating-star-${i}`} 
                    className={`${i < Math.floor(product.rating || 0) ? 'fas' : i < (product.rating || 0) ? 'fas fa-star-half-alt' : 'far'} fa-star`}
                  ></i>
                ))}
              </div>
              <span className="text-gray-500 ml-2">
                {product.rating ? product.rating.toFixed(1) : '0.0'} ({product.review_count || 0} 리뷰)
              </span>
            </div>
            
            {/* 가격 */}
            <div className="mb-6">
              {salePrice ? (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl font-bold text-primary">
                      {actualPrice.toLocaleString()}원
                    </span>
                    <span className="text-red-500 font-medium bg-red-100 px-2 py-1 rounded text-sm">
                      {discountRate}% 할인
                    </span>
                  </div>
                  <span className="text-lg text-gray-500 line-through">
                    {originalPrice.toLocaleString()}원
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {originalPrice.toLocaleString()}원
                </span>
              )}
            </div>

            {/* 관리자용 할인율 조정 */}
            {(user?.is_superuser || user?.is_staff) && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-800">
                    <i className="fas fa-user-shield mr-2"></i>
                    관리자 할인율 조정
                  </h4>
                  <button
                    onClick={() => setShowDiscountControl(!showDiscountControl)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {showDiscountControl ? '숨기기' : '표시'}
                  </button>
                </div>
                
                {showDiscountControl && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        할인율: {tempDiscountRate}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        step="5"
                        value={tempDiscountRate}
                        onChange={(e) => setTempDiscountRate(parseInt(e.target.value))}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-blue-600 mt-1">
                        <span>0%</span>
                        <span>20%</span>
                        <span>40%</span>
                        <span>60%</span>
                        <span>80%</span>
                      </div>
                    </div>
                    
                    {tempDiscountRate > 0 && (
                      <div className="text-sm text-blue-700 bg-blue-100 p-2 rounded">
                        할인 적용 시 가격: {(originalPrice * (1 - tempDiscountRate / 100)).toLocaleString()}원
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleDiscountUpdatePatch}
                        disabled={isUpdatingDiscount}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                      >
                        {isUpdatingDiscount ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-1"></i>
                            적용 중...
                          </>
                        ) : (
                          '할인율 적용'
                        )}
                      </button>
                      <button
                        onClick={handleDiscountReset}
                        disabled={isUpdatingDiscount}
                        className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 text-sm"
                      >
                        초기화
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 재고 정보 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">재고</span>
                <span className={`font-medium ${
                  (product.stock_quantity || product.stock || 0) > 10 ? 'text-green-600' : 
                  (product.stock_quantity || product.stock || 0) > 0 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {(product.stock_quantity || product.stock || 0) > 0 ? `${product.stock_quantity || product.stock}개 남음` : '품절'}
                </span>
              </div>
              {(product.stock_quantity || product.stock || 0) <= 10 && (product.stock_quantity || product.stock || 0) > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${((product.stock_quantity || product.stock) / 20) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
            
            {/* 수량 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">수량</label>
              <div className="flex items-center">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 border border-gray-300 rounded-l-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <div className="w-16 h-10 border-t border-b border-gray-300 flex items-center justify-center font-medium">
                  {quantity}
                </div>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 border border-gray-300 rounded-r-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                  disabled={quantity >= (product.stock_quantity || product.stock || 10)}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>
            
            {/* 구매 버튼 */}
            <div className="space-y-3 mb-6">
              <button 
                onClick={handleAddToCart}
                disabled={cartLoading || (product.stock_quantity || product.stock || 0) <= 0}
                className="w-full py-3 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cartLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    처리 중...
                  </>
                ) : (product.stock_quantity || product.stock || 0) <= 0 ? (
                  '품절'
                ) : isInCart(product.id) ? (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    수량 추가
                  </>
                ) : (
                  <>
                    <i className="fas fa-shopping-cart mr-2"></i>
                    장바구니에 담기
                  </>
                )}
              </button>
              
              <button 
                onClick={handleBuyNow}
                disabled={cartLoading || (product.stock_quantity || product.stock || 0) <= 0}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(product.stock_quantity || product.stock || 0) <= 0 ? '품절' : '바로 구매'}
              </button>
            </div>
            
            {/* 배송 및 서비스 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-3">배송 및 서비스</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center">
                  <i className="fas fa-truck text-primary w-5"></i>
                  <span>무료배송 (50,000원 이상 구매 시)</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-undo text-primary w-5"></i>
                  <span>30일 무료 반품/교환</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-shield-alt text-primary w-5"></i>
                  <span>100% 정품 보증</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-headset text-primary w-5"></i>
                  <span>24시간 고객 지원</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 상세 정보 탭 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        {/* 탭 메뉴 */}
        <div className="flex border-b">
          <button 
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              selectedTab === 'description' 
                ? 'text-primary border-b-2 border-primary bg-orange-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedTab('description')}
          >
            상품 설명
          </button>
          <button 
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              selectedTab === 'specs' 
                ? 'text-primary border-b-2 border-primary bg-orange-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedTab('specs')}
          >
            상세 정보
          </button>
          <button 
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              selectedTab === 'reviews' 
                ? 'text-primary border-b-2 border-primary bg-orange-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedTab('reviews')}
          >
            리뷰 ({reviewStats?.total_reviews || reviews.length})
          </button>
        </div>
        
        {/* 탭 내용 */}
        <div className="p-6">
          {/* 상품 설명 */}
          {selectedTab === 'description' && (
            <div className="prose max-w-none">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {product.description || '상품 설명이 없습니다.'}
              </div>
            </div>
          )}
          
          {/* 상세 정보 */}
          {selectedTab === 'specs' && (
            <div>
              <h3 className="text-lg font-bold mb-4">상품 상세 정보</h3>
              {product.specifications && product.specifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications.map((spec, index) => (
                    <div key={`spec-${spec.name}-${index}`} className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-800">{spec.name}</div>
                      <div className="text-gray-600">{spec.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-info-circle text-3xl mb-3"></i>
                  <p>상세 정보가 없습니다.</p>
                </div>
              )}
            </div>
          )}
          
          {/* 리뷰 섹션 */}
          {selectedTab === 'reviews' && (
            <div>
              {/* 리뷰 통계 */}
              {reviewStats && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 평균 평점 */}
                    <div className="text-center md:text-left">
                      <div className="text-3xl font-bold text-gray-800 mb-2">
                        {reviewStats.average_rating ? reviewStats.average_rating.toFixed(1) : '0.0'}
                        <span className="text-lg text-gray-500 ml-1">/ 5.0</span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start mb-2">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`fas fa-star text-lg ${
                              i < Math.round(reviewStats.average_rating || 0) 
                                ? 'text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          ></i>
                        ))}
                      </div>
                      <p className="text-gray-600">
                        총 {reviewStats.total_reviews}개의 리뷰
                      </p>
                    </div>
                    
                    {/* 평점 분포 */}
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviewStats[`rating_${rating}`] || 0;
                        const percentage = reviewStats.total_reviews > 0 
                          ? (count / reviewStats.total_reviews) * 100 
                          : 0;
                        
                        return (
                          <div key={`rating-${rating}`} className="flex items-center gap-2">
                            <span className="text-sm w-6">{rating}점</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              {/* 리뷰 작성 버튼 */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">고객 리뷰</h3>
                {user ? (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    disabled={reviewLoading}
                  >
                    <i className="fas fa-star mr-2"></i>
                    {reviewLoading ? '작성 중...' : '리뷰 작성'}
                  </button>
                ) : (
                  <p className="text-gray-500">리뷰를 작성하려면 로그인이 필요합니다.</p>
                )}
              </div>

              {/* 리뷰 작성 폼 */}
              {showReviewForm && user && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h4 className="text-lg font-semibold mb-4">리뷰 작성</h4>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">평점 *</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                            className={`text-2xl transition-colors hover:scale-110 ${
                              star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            <i className="fas fa-star"></i>
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600 self-center">
                          ({reviewForm.rating}점)
                        </span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">리뷰 제목 *</label>
                      <input
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="리뷰 제목을 입력해주세요..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                        disabled={reviewLoading}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">리뷰 내용 *</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="상품에 대한 솔직한 리뷰를 작성해주세요..."
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                        disabled={reviewLoading}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={reviewLoading}
                      >
                        {reviewLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            등록 중...
                          </>
                        ) : (
                          '리뷰 등록'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        disabled={reviewLoading}
                      >
                        취소
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* 리뷰 목록 */}
              {loading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-4"></i>
                  <p className="text-gray-500">리뷰를 불러오는 중...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-star text-gray-300 text-4xl mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">아직 리뷰가 없습니다</h3>
                  <p className="text-gray-500">첫 번째 리뷰를 작성해보세요!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                            <img 
                              src={review.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.username || review.user || '사용자')}&background=random`}
                              alt={review.user?.username || review.user} 
                              className="w-full h-full object-cover"
                              onError={(e) => handleImageError(e, true)}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {review.user?.username || review.user || '익명 사용자'}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>{new Date(review.created_at).toLocaleDateString()}</span>
                              {review.is_verified_purchase && (
                                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  구매 확인
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <i 
                              key={i} 
                              className={`fas fa-star text-sm ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            ></i>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {review.rating}.0
                          </span>
                        </div>
                      </div>
                      
                      {/* 리뷰 제목 */}
                      {review.title && (
                        <h4 className="font-medium text-gray-800 mb-2">{review.title}</h4>
                      )}
                      
                      {/* 리뷰 내용 */}
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {review.content || review.comment}
                      </p>
                      
                      {/* 리뷰 이미지 (있는 경우) */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {review.images.map((image, index) => (
                            <img
                              key={`review-${review.id}-image-${index}`}
                              src={image}
                              alt={`리뷰 이미지 ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              onError={(e) => handleImageError(e)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 관련 상품 추천 */}
      {relatedProducts.length > 0 && (
        <div className="mb-8">
          <ProductCardList
            title="이 상품과 함께 구매하면 좋은 상품"
            viewAllLink={
              <Link to="/shop" className="text-primary font-medium hover:text-orange-600">
                더 많은 상품 보기
              </Link>
            }
            products={relatedProducts}
            gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            compact={true}
          />
        </div>
      )}

      {/* 이미지 모달 */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setIsImageModalOpen(false)}>
          <div className="relative max-w-4xl max-h-full p-4">
            <img 
              src={productImages[selectedImageIndex] || product.image} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain"
              onError={(e) => handleImageError(e, false)}
            />
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
  };
  
  export default ProductDetailPage; 