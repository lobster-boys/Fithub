import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import ProductCardList from '../../components/ecommerce/ProductCardList';
import useEcommerce from '../../hooks/useEcommerce';
import { useCart } from '../../hooks/useCart';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  // 훅 사용
  const {
    getProductById,
    getRelatedProducts,
    getProductReviews,
    createReview,
    loading,
    error,
    formatPrice,
    calculateDiscountedPrice
  } = useEcommerce();
  
  const { addToCart, isInCart, loading: cartLoading } = useCart();

  // 상태 관리
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // 상품 데이터 로드
  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) return;

      try {
        // 상품 정보 로드
        const productData = await getProductById(productId);
        if (productData) {
          setProduct(productData);
          
          // 병렬로 리뷰와 관련 상품 로드
          const [reviewsData, relatedData] = await Promise.all([
            getProductReviews(productId),
            getRelatedProducts(productId, 4)
          ]);
          
          setReviews(reviewsData || []);
          setRelatedProducts(relatedData || []);
        }
      } catch (err) {
        console.error('상품 데이터 로드 실패:', err);
      }
    };

    loadProductData();
  }, [productId, getProductById, getProductReviews, getRelatedProducts]);

  // 수량 변경
  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    const maxQuantity = product?.stock || 10;
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
    await handleAddToCart();
    navigate('/shop/cart');
  };

  // 리뷰 작성
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const reviewData = {
        product: product.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      };
      
      const newReview = await createReview(reviewData);
      if (newReview) {
        setReviews(prev => [newReview, ...prev]);
        setReviewForm({ rating: 5, comment: '' });
        setShowReviewForm(false);
      }
    } catch (err) {
      console.error('리뷰 작성 실패:', err);
      alert('리뷰 작성에 실패했습니다.');
    }
  };

  // 이미지 갤러리 처리
  const productImages = product ? [
    product.image,
    ...(product.additional_images || [])
  ].filter(Boolean) : [];

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

  const discountedPrice = product.discount 
    ? calculateDiscountedPrice(product.price, product.discount)
    : product.price;

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
              src={productImages[selectedImageIndex] || product.image} 
              alt={product.name} 
              className="w-full h-96 object-cover cursor-zoom-in"
              onClick={() => setIsImageModalOpen(true)}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
              }}
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
                  key={index} 
                  className={`bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} ${index + 1}`} 
                    className="w-full h-20 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                    }}
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
                {product.category_name || product.category}
              </span>
              {product.is_bestseller && (
                <span className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded">
                  🏆 베스트셀러
                </span>
              )}
              {product.stock <= 10 && product.stock > 0 && (
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
                    key={i} 
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
              {product.discount > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(discountedPrice)}원
                    </span>
                    <span className="text-red-500 font-medium bg-red-100 px-2 py-1 rounded text-sm">
                      {product.discount}% 할인
                    </span>
                  </div>
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.price)}원
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}원
                </span>
              )}
            </div>

            {/* 재고 정보 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">재고</span>
                <span className={`font-medium ${
                  product.stock > 10 ? 'text-green-600' : 
                  product.stock > 0 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 ? `${product.stock}개 남음` : '품절'}
                </span>
              </div>
              {product.stock <= 10 && product.stock > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${(product.stock / 20) * 100}%` }}
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
                  disabled={quantity >= (product.stock || 10)}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>
            
            {/* 구매 버튼 */}
            <div className="space-y-3 mb-6">
              <button 
                onClick={handleAddToCart}
                disabled={cartLoading || product.stock <= 0}
                className="w-full py-3 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cartLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    처리 중...
                  </>
                ) : product.stock <= 0 ? (
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
                disabled={cartLoading || product.stock <= 0}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock <= 0 ? '품절' : '바로 구매'}
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
            리뷰 ({reviews.length})
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
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
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
              {/* 리뷰 작성 버튼 */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">고객 리뷰</h3>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <i className="fas fa-star mr-2"></i>
                  리뷰 작성
                </button>
              </div>

              {/* 리뷰 작성 폼 */}
              {showReviewForm && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">평점</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                            className={`text-2xl ${
                              star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            <i className="fas fa-star"></i>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">리뷰 내용</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="상품에 대한 솔직한 리뷰를 작성해주세요..."
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        리뷰 등록
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* 리뷰 목록 */}
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-star text-gray-300 text-4xl mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">아직 리뷰가 없습니다</h3>
                  <p className="text-gray-500">첫 번째 리뷰를 작성해보세요!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                          <img 
                            src={review.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name || '사용자')}&background=random`}
                            alt={review.user_name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <div className="font-medium">{review.user_name || '익명 사용자'}</div>
                          <div className="flex items-center text-sm">
                            <div className="flex text-yellow-400 mr-2">
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className={`fas fa-star ${i < review.rating ? '' : 'text-gray-300'}`}></i>
                              ))}
                            </div>
                            <span className="text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
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