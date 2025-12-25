import Link from 'next/link';
import React from 'react';

interface ProductCardProps {
  product: {
    handle: string;
    title: string;
    description?: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    featuredImage?: {
      url: string;
      altText?: string;
    };
    availableForSale: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const currencyCode = product.priceRange.minVariantPrice.currencyCode;

  return (
    <Link href={`/products/${product.handle}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Product Image */}
        <div className="aspect-square bg-gray-200 overflow-hidden">
          {product.featuredImage ? (
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode,
              }).format(price)}
            </span>
            
            {!product.availableForSale && (
              <span className="text-sm text-red-600 font-medium">
                Sold Out
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
