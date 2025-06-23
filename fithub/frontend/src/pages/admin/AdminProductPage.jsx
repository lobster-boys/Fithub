import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Package, Upload, X } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import useEcommerce from '../../hooks/useEcommerce';
import axiosInstance from '../../api/axiosConfig';

const AdminProductPage = () => {
  const { user } = useAuth();
  const { 
    getAllProducts, 
    fetchCategories,
    formatPrice,
    categories: ecommerceCategories
  } = useEcommerce();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    images: [],
    is_featured: false,
    is_food: false,
    stock_quantity: '',
    unit_weight_g: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [imageUrls, setImageUrls] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  // 권한 확인
  useEffect(() => {
    if (!user || !user.is_superuser) {
      alert('관리자 권한이 필요합니다.');
      window.location.href = '/';
      return;
    }
    loadData();
  }, [user]);

  // useEcommerce의 categories가 업데이트될 때마다 로컬 categories 업데이트
  useEffect(() => {
    console.log('ecommerceCategories 변경됨:', ecommerceCategories);
    if (ecommerceCategories && ecommerceCategories.length > 0) {
      const finalCategories = ecommerceCategories.filter(cat => cat.id !== 'all');
      console.log('useEcommerce categories 업데이트:', ecommerceCategories);
      console.log('필터링된 카테고리 업데이트:', finalCategories);
      setCategories(finalCategories);
    } else {
      console.log('ecommerceCategories가 비어있거나 undefined입니다.');
    }
  }, [ecommerceCategories]);

  const loadData = async () => {
    setLoading(true);
    try {
      const productsData = await getAllProducts();
      setProducts(productsData);
      
      // useEcommerce 훅의 categories를 사용 ('all' 카테고리 제외)
      const finalCategories = ecommerceCategories.filter(cat => cat.id !== 'all');
      console.log('useEcommerce categories:', ecommerceCategories);
      console.log('필터링된 카테고리:', finalCategories);
      setCategories(finalCategories);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      // 에러 발생 시에도 기본 카테고리 설정
      setCategories([
        { id: 'equipment', name: '운동 기구' },
        { id: 'supplements', name: '보충제/영양제' },
        { id: 'seafood', name: '생선/해산물' },
        { id: 'meat', name: '고기/육류' },
        { id: 'vegetables', name: '채소/과일' },
        { id: 'dairy', name: '유제품' },
        { id: 'grains', name: '곡물/견과류' },
        { id: 'beverages', name: '음료/차' },
        { id: 'snacks', name: '건강간식' },
        { id: 'apparel', name: '운동복' },
        { id: 'accessories', name: '운동용품' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      sale_price: '', // 할인가 필드 추가
      category: '',
      images: [],
      is_featured: false,
      is_food: false,
      stock_quantity: '',
      unit_weight_g: ''
    });
    setImageUrls([]);
    setFormErrors({});
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    
    // 디버깅용 로그
    console.log('[AdminProductPage] 편집할 상품 정보:', {
      id: product.id,
      name: product.name,
      price: product.price,
      sale_price: product.sale_price,
      price_type: typeof product.price,
      sale_price_type: typeof product.sale_price
    });
    
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      sale_price: product.sale_price?.toString() || '', // sale_price도 폼에 추가
      category: product.category || '',
      images: product.images || [],
      is_featured: product.is_featured || false,
      is_food: product.is_food || false,
      stock_quantity: product.stock_quantity?.toString() || '',
      unit_weight_g: product.unit_weight_g?.toString() || ''
    });
    setImageUrls(product.images || []);
    setFormErrors({});
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('이 상품을 삭제하시겠습니까?')) return;

    try {
      await axiosInstance.delete(`/ecommerce/products/${productId}/`);
      alert('상품이 삭제되었습니다.');
      await loadData();
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          '상품 삭제에 실패했습니다.';
      alert(errorMessage);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

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
    const errors = {};
    
    if (!formData.name.trim()) errors.name = '상품명을 입력해주세요.';
    if (!formData.description.trim()) errors.description = '상품 설명을 입력해주세요.';
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = '올바른 가격을 입력해주세요.';
    }
    if (!formData.category) errors.category = '카테고리를 선택해주세요.';
    if (!formData.stock_quantity || isNaN(formData.stock_quantity) || parseInt(formData.stock_quantity) < 0) {
      errors.stock_quantity = '올바른 재고 수량을 입력해주세요.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      // 카테고리 ID를 카테고리 객체로 변환
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      
      // 할인가 처리: 값이 있고 0보다 클 때만 설정, 아니면 null
      const salePrice = formData.sale_price && parseFloat(formData.sale_price) > 0 ? 
                       parseFloat(formData.sale_price).toString() : null;

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price).toString(), // 문자열로 변환하여 정확한 전송
        stock_quantity: parseInt(formData.stock_quantity),
        unit_weight_g: formData.unit_weight_g ? parseInt(formData.unit_weight_g) : 0,
        is_active: true, // 관리자가 등록하는 상품은 기본적으로 활성화
        is_featured: formData.is_featured || false,
        is_food: formData.is_food || false,
        sale_price: salePrice, // 계산된 할인가 또는 null
        category: {
          name: selectedCategory?.name || formData.category,
          description: '',
          is_active: true
        }
      };

      console.log('상품 저장 데이터:', {
        ...productData,
        debug_info: {
          input_price: formData.price,
          input_sale_price: formData.sale_price,
          calculated_sale_price: salePrice,
          sale_price_check: formData.sale_price && parseFloat(formData.sale_price) > 0
        }
      });

      const url = editingProduct 
        ? `/ecommerce/products/${editingProduct.id}/`
        : '/ecommerce/products/';
      
      let response;
      if (editingProduct) {
        response = await axiosInstance.put(url, productData);
      } else {
        response = await axiosInstance.post(url, productData);
      }

      alert(editingProduct ? '상품이 수정되었습니다.' : '상품이 등록되었습니다.');
      setShowForm(false);
      await loadData();
    } catch (error) {
      console.error('상품 저장 실패:', error);
      console.log('에러 상세:', error.response?.data);
      
      let errorMessage = '상품 저장에 실패했습니다.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          // 필드별 에러 메시지 처리
          const fieldErrors = [];
          Object.keys(errorData).forEach(field => {
            const fieldError = errorData[field];
            if (Array.isArray(fieldError)) {
              fieldErrors.push(`${field}: ${fieldError[0]}`);
            } else {
              fieldErrors.push(`${field}: ${fieldError}`);
            }
          });
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('\n');
          }
        }
      }
      
      alert(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user?.is_superuser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h2>
          <p className="text-gray-600">관리자 권한이 필요한 페이지입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">상품 관리</h1>
            <p className="text-gray-600">상품을 등록하고 관리하세요</p>
          </div>
          
          {!showForm && (
            <Button
              variant="primary"
              onClick={handleAddProduct}
              className="whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 상품 등록
            </Button>
          )}
        </div>

        {/* 상품 등록/수정 폼 */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProduct ? '상품 수정' : '새 상품 등록'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 상품명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품명 *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="상품명을 입력해주세요"
                    error={formErrors.name}
                  />
                </div>

                {/* 카테고리 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                  )}
                </div>

                {/* 가격 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    원가 (원) *
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0"
                    error={formErrors.price}
                  />
                </div>

                {/* 할인가 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    할인가 (원) <span className="text-gray-500 text-xs">(선택사항)</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.sale_price}
                    onChange={(e) => handleInputChange('sale_price', e.target.value)}
                    placeholder="할인가 없으면 비워두세요"
                    error={formErrors.sale_price}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    할인가를 입력하면 고객에게는 할인가가 표시됩니다.
                  </p>
                </div>

                {/* 재고 수량 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    재고 수량 *
                  </label>
                  <Input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                    placeholder="0"
                    error={formErrors.stock_quantity}
                  />
                </div>

                {/* 무게 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    무게 (g)
                  </label>
                  <Input
                    type="number"
                    value={formData.unit_weight_g}
                    onChange={(e) => handleInputChange('unit_weight_g', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* 상품 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품 설명 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="상품에 대한 자세한 설명을 입력해주세요"
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>

              {/* 상품 이미지 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품 이미지
                </label>
                
                {/* 이미지 미리보기 */}
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`상품 이미지 ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 이미지 업로드 */}
                <label className="flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">클릭하여 이미지 업로드</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* 옵션 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_featured" className="text-sm text-gray-700">
                    추천 상품으로 설정
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_food"
                    checked={formData.is_food}
                    onChange={(e) => handleInputChange('is_food', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_food" className="text-sm text-gray-700">
                    식품으로 분류
                  </label>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                  disabled={formLoading}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={formLoading}
                >
                  {formLoading ? '저장 중...' : (editingProduct ? '수정하기' : '등록하기')}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 검색 및 필터 */}
        {!showForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="상품명으로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체 카테고리</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 상품 목록 */}
        {!showForm && (
          loading ? (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상품
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        카테고리
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가격
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        재고
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  className="h-12 w-12 rounded object-cover"
                                  src={product.images[0]}
                                  alt={product.name}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {categories.find(cat => cat.id === product.category)?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              원가: {formatPrice(product.price)}원
                            </span>
                            {product.sale_price && parseFloat(product.sale_price) > 0 ? (
                              <span className="text-red-600 text-xs">
                                할인가: {formatPrice(product.sale_price)}원
                              </span>
                            ) : (
                              <span className="text-gray-500 text-xs">
                                할인가: 없음
                              </span>
                            )}
                            <span className="text-blue-600 text-xs mt-1">
                              원본 sale_price: {product.sale_price}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.stock_quantity}개
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {product.is_featured && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                추천
                              </span>
                            )}
                            {product.is_bestseller && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                베스트
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-900"
                              title="수정"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                등록된 상품이 없습니다
              </h3>
              <p className="text-gray-500 mb-6">
                첫 번째 상품을 등록해보세요
              </p>
              <Button
                variant="primary"
                onClick={handleAddProduct}
                className="mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                상품 등록하기
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AdminProductPage; 