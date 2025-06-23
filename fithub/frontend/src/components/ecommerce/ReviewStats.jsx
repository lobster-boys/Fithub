import React from 'react';
import { Star, BarChart3 } from 'lucide-react';

const ReviewStats = ({ 
  stats = {
    average_rating: 0,
    total_reviews: 0,
    rating_1: 0,
    rating_2: 0,
    rating_3: 0,
    rating_4: 0,
    rating_5: 0
  },
  className = ''
}) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingPercentage = (count) => {
    if (stats.total_reviews === 0) return 0;
    return (count / stats.total_reviews) * 100;
  };

  const ratingDistribution = [
    { rating: 5, count: stats.rating_5 },
    { rating: 4, count: stats.rating_4 },
    { rating: 3, count: stats.rating_3 },
    { rating: 2, count: stats.rating_2 },
    { rating: 1, count: stats.rating_1 }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">리뷰 통계</h3>
      </div>

      {stats.total_reviews === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Star className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500">아직 작성된 리뷰가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">
            첫 번째 리뷰를 작성해보세요!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 평균 평점 */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats.average_rating ? stats.average_rating.toFixed(1) : '0.0'}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {renderStars(stats.average_rating)}
            </div>
            <p className="text-sm text-gray-600">
              총 {stats.total_reviews}개의 리뷰
            </p>
          </div>

          {/* 평점 분포 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">평점 분포</h4>
            {ratingDistribution.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                </div>
                
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getRatingPercentage(count)}%` }}
                  />
                </div>
                
                <div className="text-sm text-gray-600 w-8 text-right">
                  {count}
                </div>
                
                <div className="text-xs text-gray-500 w-12 text-right">
                  {getRatingPercentage(count).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>

          {/* 추가 통계 */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {stats.rating_4 + stats.rating_5}
                </div>
                <div className="text-xs text-gray-500">만족 (4점 이상)</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {stats.total_reviews > 0 
                    ? (((stats.rating_4 + stats.rating_5) / stats.total_reviews) * 100).toFixed(0)
                    : 0}%
                </div>
                <div className="text-xs text-gray-500">만족도</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewStats; 