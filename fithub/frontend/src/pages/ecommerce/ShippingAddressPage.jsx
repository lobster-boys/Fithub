import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Star, Home } from 'lucide-react';
import ShippingAddressForm from '../../components/ecommerce/ShippingAddressForm';
import Button from '../../components/common/Button';
import useEcommerce from '../../hooks/useEcommerce';

const ShippingAddressPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const { 
    getShippingAddresses,
    createShippingAddress,
    updateShippingAddress,
    deleteShippingAddress,
    setDefaultShippingAddress
  } = useEcommerce();

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await getShippingAddresses();
      setAddresses(data.results || data || []);
    } catch (error) {
      console.error('배송지 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('이 배송지를 삭제하시겠습니까?')) return;

    try {
      await deleteShippingAddress(addressId);
      alert('배송지가 삭제되었습니다.');
      await loadAddresses();
    } catch (error) {
      console.error('배송지 삭제 실패:', error);
      alert('배송지 삭제에 실패했습니다.');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultShippingAddress(addressId);
      alert('기본 배송지로 설정되었습니다.');
      await loadAddresses();
    } catch (error) {
      console.error('기본 배송지 설정 실패:', error);
      alert('기본 배송지 설정에 실패했습니다.');
    }
  };

  const handleSubmitForm = async (formData) => {
    setFormLoading(true);
    try {
      if (editingAddress) {
        await updateShippingAddress(editingAddress.id, formData);
        alert('배송지가 수정되었습니다.');
      } else {
        await createShippingAddress(formData);
        alert('새 배송지가 등록되었습니다.');
      }
      
      setShowForm(false);
      setEditingAddress(null);
      await loadAddresses();
    } catch (error) {
      console.error('배송지 저장 실패:', error);
      alert('배송지 저장에 실패했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">배송지 관리</h1>
            <p className="text-gray-600">
              주문 시 사용할 배송지를 등록하고 관리하세요
            </p>
          </div>
          
          {!showForm && (
            <Button
              variant="primary"
              onClick={handleAddAddress}
              className="whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 배송지 추가
            </Button>
          )}
        </div>

        {/* 폼 표시 */}
        {showForm && (
          <div className="mb-8">
            <ShippingAddressForm
              onSubmit={handleSubmitForm}
              onCancel={handleCancelForm}
              existingAddress={editingAddress}
              loading={formLoading}
            />
          </div>
        )}

        {/* 배송지 목록 */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div 
                key={address.id} 
                className={`bg-white rounded-lg shadow-sm border p-6 ${
                  address.is_default ? 'ring-2 ring-blue-500 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      address.is_default 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {address.is_default ? <Star className="w-5 h-5 fill-current" /> : <Home className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {address.recipient_name}
                        </h3>
                        {address.is_default && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                            기본 배송지
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {address.phone_number}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!address.is_default && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="기본 배송지로 설정"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="수정"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">{address.address_line1}</p>
                      {address.address_line2 && (
                        <p>{address.address_line2}</p>
                      )}
                      <p>{address.city}, {address.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              등록된 배송지가 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              주문을 위해 배송지를 등록해주세요
            </p>
            <Button
              variant="primary"
              onClick={handleAddAddress}
              className="mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              첫 번째 배송지 등록
            </Button>
          </div>
        )}

        {/* 하단 정보 */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            배송지 관리 안내
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">배송지 등록</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 정확한 주소와 연락처를 입력해주세요</li>
                <li>• 여러 개의 배송지를 등록할 수 있습니다</li>
                <li>• 주소 찾기 기능을 활용해보세요</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">기본 배송지</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 주문 시 기본 배송지가 자동으로 선택됩니다</li>
                <li>• 별표 아이콘을 클릭하여 기본 배송지를 변경할 수 있습니다</li>
                <li>• 기본 배송지는 하나만 설정 가능합니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingAddressPage; 