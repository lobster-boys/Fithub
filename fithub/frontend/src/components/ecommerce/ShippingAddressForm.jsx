import React, { useState, useEffect } from 'react';
import { MapPin, User, Phone, Home } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const ShippingAddressForm = ({ 
  onSubmit,
  onCancel,
  existingAddress = null,
  loading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    recipient_name: '',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    country: '대한민국',
    is_default: false
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingAddress) {
      setFormData({
        recipient_name: existingAddress.recipient_name || '',
        phone_number: existingAddress.phone_number || '',
        address_line1: existingAddress.address_line1 || '',
        address_line2: existingAddress.address_line2 || '',
        city: existingAddress.city || '',
        country: existingAddress.country || '대한민국',
        is_default: existingAddress.is_default || false
      });
    }
  }, [existingAddress]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.recipient_name.trim()) {
      newErrors.recipient_name = '받는 분 이름을 입력해주세요.';
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = '연락처를 입력해주세요.';
    } else if (!/^[\d-]+$/.test(formData.phone_number)) {
      newErrors.phone_number = '올바른 연락처를 입력해주세요.';
    }
    
    if (!formData.address_line1.trim()) {
      newErrors.address_line1 = '기본 주소를 입력해주세요.';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = '시/도를 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    await onSubmit(formData);
  };

  const handlePostcodeSearch = () => {
    // 다음 우편번호 API 사용 (실제 구현 시)
    // 여기서는 간단한 예시만 제공
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function(data) {
          setFormData(prev => ({
            ...prev,
            address_line1: data.address,
            city: data.sido
          }));
        }
      }).open();
    } else {
      alert('주소 검색 기능을 사용하려면 다음 우편번호 API가 필요합니다.');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {existingAddress ? '배송지 수정' : '새 배송지 등록'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 받는 분 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              받는 분 이름 *
            </label>
            <Input
              type="text"
              value={formData.recipient_name}
              onChange={(e) => handleInputChange('recipient_name', e.target.value)}
              placeholder="받는 분의 이름을 입력해주세요"
              error={errors.recipient_name}
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              연락처 *
            </label>
            <Input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              placeholder="010-1234-5678"
              error={errors.phone_number}
            />
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Home className="w-4 h-4 inline mr-1" />
              주소 *
            </label>
            
            {/* 기본 주소 */}
            <div className="flex gap-2 mb-3">
              <Input
                type="text"
                value={formData.address_line1}
                onChange={(e) => handleInputChange('address_line1', e.target.value)}
                placeholder="기본 주소를 입력해주세요"
                error={errors.address_line1}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handlePostcodeSearch}
                className="whitespace-nowrap"
              >
                주소 찾기
              </Button>
            </div>
            
            {/* 상세 주소 */}
            <Input
              type="text"
              value={formData.address_line2}
              onChange={(e) => handleInputChange('address_line2', e.target.value)}
              placeholder="상세 주소를 입력해주세요 (선택)"
              className="mb-3"
            />
            
            {/* 시/도 */}
            <Input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="시/도"
              error={errors.city}
            />
          </div>

          {/* 국가 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              국가
            </label>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="대한민국">대한민국</option>
            </select>
          </div>

          {/* 기본 배송지 설정 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => handleInputChange('is_default', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_default" className="text-sm text-gray-700">
              기본 배송지로 설정
            </label>
          </div>

          {/* 안내 메시지 */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-700 mb-2">
              배송지 등록 안내
            </h4>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• 정확한 주소와 연락처를 입력해주세요.</li>
              <li>• 기본 배송지로 설정하면 주문 시 자동으로 선택됩니다.</li>
              <li>• 배송 관련 문의는 입력하신 연락처로 연락드립니다.</li>
            </ul>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
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
              {loading ? '저장 중...' : (existingAddress ? '수정하기' : '등록하기')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingAddressForm; 