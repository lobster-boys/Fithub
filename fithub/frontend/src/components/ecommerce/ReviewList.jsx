import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, Edit, Trash2, Calendar, User } from 'lucide-react';
import Button from '../common/Button';
import ReviewModal from './ReviewModal';
import useEcommerce from '../../hooks/useEcommerce';

const ReviewList = ({ 
  productId = null,
  isMyReviews = false,
  showProductInfo = false,
  limit = null,
  className = ''
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [filterRating, setFilterRating] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const { 
    getReviews, 
    getMyReviews, 
    updateReview, 
    deleteReview 
  } = useEcommerce();

  useEffect(() => {
    loadReviews();
  }, [productId, isMyReviews, sortBy, filterRating]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const params = {
        ...(productId && { product: productId }),
        ...(filterRating !== 'all' && { rating: filterRating }),
        ordering: getSortingParam(sortBy),
        ...(limit && { limit })
      };

      const data = isMyReviews 
        ? await getMyReviews(params)
        : await getReviews(params);
      
      setReviews(data.results || data || []);
    } catch (error) {
      console.error('리뷰 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortingParam = (sortOption) => {
    switch (sortOption) {
      case 'latest':
        return '-created_at';
      case 'oldest':
        return 'created_at';
      case 'rating_high':
        return '-rating';
      case 'rating_low':
        return 'rating';
      case 'helpful':
        return '-helpful_count';
      default:
        return '-created_at';
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowEditModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('이 리뷰를 삭제하시겠습니까?')) return;

    try {
      await deleteReview(reviewId);
      alert('리뷰가 삭제되었습니다.');
      await loadReviews();
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      alert('리뷰 삭제에 실패했습니다.');
    }
  };

  const handleUpdateReview = async (reviewData) => {
    try {
      await updateReview(editingReview.id, reviewData);
      alert('리뷰가 수정되었습니다.');
      setShowEditModal(false);
      setEditingReview(null);
      await loadReviews();
    } catch (error) {
      console.error('리뷰 수정 실패:', error);
      alert('리뷰 수정에 실패했습니다.');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'oldest', label: '오래된순' },
    { value: 'rating_high', label: '평점 높은순' },
    { value: 'rating_low', label: '평점 낮은순' },
    { value: 'helpful', label: '도움순' }
  ];

  const ratingFilters = [
    { value: 'all', label: '전체' },
    { value: '5', label: '⭐⭐⭐⭐⭐' },
    { value: '4', label: '⭐⭐⭐⭐' },
    { value: '3', label: '⭐⭐⭐' },
    { value: '2', label: '⭐⭐' },
    { value: '1', label: '⭐' }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isMyReviews ? '내 리뷰' : '리뷰'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              총 {reviews.length}개의 리뷰
            </p>
          </div>

          {/* 정렬 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ratingFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 리뷰 목록 */}
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {review.user?.username || '익명'}
                        </span>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(review.created_at)}</span>
                        {review.updated_at !== review.created_at && (
                          <span className="text-blue-600">(수정됨)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isMyReviews && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 상품 정보 (내 리뷰에서만 표시) */}
                {showProductInfo && review.product && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {review.product.images && review.product.images.length > 0 && (
                        <img
                          src={review.product.images[0]}
                          alt={review.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {review.product.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {review.product.price?.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 리뷰 제목 */}
                {review.title && (
                  <h4 className="font-medium text-gray-900 mb-2">
                    {review.title}
                  </h4>
                )}

                {/* 리뷰 내용 */}
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {review.content}
                </p>

                {/* 리뷰 이미지 */}
                {review.images && review.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {JSON.parse(review.images).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`리뷰 이미지 ${index + 1}`}
                        className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          // 이미지 확대 모달 등 구현 가능
                          window.open(image, '_blank');
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* 도움됨 버튼 */}
                <div className="flex items-center gap-4 pt-3 border-t">
                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>도움됨 {review.helpful_count || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>댓글</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isMyReviews ? '작성한 리뷰가 없습니다' : '리뷰가 없습니다'}
            </h3>
            <p className="text-gray-500">
              {isMyReviews 
                ? '구매한 상품에 대한 리뷰를 작성해보세요'
                : '첫 번째 리뷰를 작성해보세요'
              }
            </p>
          </div>
        )}

        {/* 더보기 버튼 */}
        {!limit && reviews.length > 0 && reviews.length % 10 === 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={loadReviews}
              className="mx-auto"
            >
              더 많은 리뷰 보기
            </Button>
          </div>
        )}
      </div>

      {/* 리뷰 수정 모달 */}
      {showEditModal && editingReview && (
        <ReviewModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingReview(null);
          }}
          onSubmit={handleUpdateReview}
          product={editingReview.product}
          orderItem={editingReview.order_item}
          existingReview={editingReview}
        />
      )}
    </div>
  );
};

export default ReviewList; 