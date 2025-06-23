import React, { useState, useEffect } from 'react';
import { X, Star, Upload, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  product,
  orderItem,
  existingReview = null,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5,
    images: []
  });
  
  const [imageUrls, setImageUrls] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingReview) {
      setFormData({
        title: existingReview.title || '',
        content: existingReview.content || '',
        rating: existingReview.rating || 5,
        images: existingReview.images ? JSON.parse(existingReview.images) : []
      });
      setImageUrls(existingReview.images ? JSON.parse(existingReview.images) : []);
    } else {
      setFormData({
        title: '',
        content: '',
        rating: 5,
        images: []
      });
      setImageUrls([]);
    }
    setErrors({});
  }, [existingReview, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleRatingClick = (rating) => {
    handleInputChange('rating', rating);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // 이미지 미리보기 생성
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImageUrl = e.target.result;
          setImageUrls(prev => [...prev, newImageUrl]);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, newImageUrl]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleImageRemove = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '리뷰 제목을 입력해주세요.';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '리뷰 내용을 입력해주세요.';
    }
    
    if (formData.content.trim().length < 10) {
      newErrors.content = '리뷰 내용은 최소 10자 이상 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const reviewData = {
      ...formData,
      product: product.id,
      order_item: orderItem.id,
      images: JSON.stringify(formData.images)
    };
    
    await onSubmit(reviewData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {existingReview ? '리뷰 수정' : '리뷰 작성'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {product?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* 별점 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              평점 *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className="text-2xl transition-colors hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                ({formData.rating}점)
              </span>
            </div>
          </div>

          {/* 제목 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              리뷰 제목 *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="리뷰 제목을 입력해주세요"
              error={errors.title}
            />
          </div>

          {/* 내용 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              리뷰 내용 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="상품에 대한 솔직한 리뷰를 작성해주세요 (최소 10자)"
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.content.length}/500자
            </p>
          </div>

          {/* 이미지 업로드 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사진 첨부 (선택)
            </label>
            
            {/* 이미지 미리보기 */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`리뷰 이미지 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* 업로드 버튼 */}
            {imageUrls.length < 5 && (
              <label className="flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    클릭하여 이미지 업로드
                  </p>
                  <p className="text-xs text-gray-500">
                    최대 5장까지 가능
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 주의사항 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              리뷰 작성 시 주의사항
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 구매한 상품에 대해서만 리뷰 작성이 가능합니다.</li>
              <li>• 허위 정보나 광고성 내용은 삭제될 수 있습니다.</li>
              <li>• 개인정보가 포함되지 않도록 주의해주세요.</li>
              <li>• 작성된 리뷰는 다른 고객들에게 도움이 됩니다.</li>
            </ul>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading}
            >
              {loading ? '저장 중...' : (existingReview ? '수정하기' : '리뷰 등록')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal; 