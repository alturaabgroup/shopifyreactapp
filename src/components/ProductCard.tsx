'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ShopifyProduct } from '@/types/shopify';
import { formatPrice } from '@/utils/format';

interface ProductCardProps {
  product: ShopifyProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images.edges[0]?.node.url;
  const price = product.priceRange.minVariantPrice;

  return (
    <Link href={`/products/${product.handle}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-64 bg-gray-200">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {!product.availableForSale && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
              Sold Out
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
            {product.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-brand">
              {formatPrice(price.amount, price.currencyCode)}
            </span>
            {product.availableForSale && (
              <span className="text-sm text-green-600 font-medium">
                In Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
