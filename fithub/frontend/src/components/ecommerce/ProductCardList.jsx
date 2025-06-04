import React from 'react';
import ProductCard from './ProductCard';

const ProductCardList = ({
  products = [],
  title,
  viewAllLink,
  compact = false,
  gridCols = 'grid-cols-2 md:grid-cols-4',
  className = '',
  emptyMessage = '상품이 없습니다.',
  showAddToCart = true,
  ...props
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className} {...props}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          {viewAllLink}
        </div>
      )}
      
      <div className={`grid ${gridCols} gap-4`}>
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            compact={compact}
            showAddToCart={showAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCardList; 