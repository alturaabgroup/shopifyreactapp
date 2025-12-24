'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { shopifyRequest } from '@/api/shopifyClient';
import { GET_PRODUCT_BY_HANDLE } from '@/api/queries';
import AddToCartButton from '@/components/AddToCartButton';
import { Skeleton } from '@/components/Skeleton';
import type { ShopifyProduct, ShopifyProductVariant } from '@/types/shopify';
import { formatPrice } from '@/utils/format';

export default function ProductPage() {
  const params = useParams();
  const handle = params.handle as string;
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response: any = await shopifyRequest(GET_PRODUCT_BY_HANDLE, { handle });
        const productData = response.productByHandle;
        setProduct(productData);
        
        // Set default variant
        if (productData?.variants.edges.length > 0) {
          setSelectedVariant(productData.variants.edges[0].node);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [handle]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
        </div>
      </div>
    );
  }

  const mainImage = product.images.edges[0]?.node.url;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image Available
              </div>
            )}
          </div>
          
          {/* Thumbnail gallery */}
          {product.images.edges.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.edges.slice(1, 5).map((edge, idx) => (
                <div key={idx} className="relative aspect-square bg-gray-200 rounded overflow-hidden">
                  <Image
                    src={edge.node.url}
                    alt={edge.node.altText || product.title}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
          
          {selectedVariant && (
            <div className="mb-6">
              <p className="text-3xl font-bold text-brand">
                {formatPrice(selectedVariant.priceV2.amount, selectedVariant.priceV2.currencyCode)}
              </p>
              {selectedVariant.availableForSale ? (
                <p className="text-green-600 font-medium mt-2">In Stock</p>
              ) : (
                <p className="text-red-600 font-medium mt-2">Out of Stock</p>
              )}
            </div>
          )}

          {/* Variant Selection */}
          {product.variants.edges.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Variant
              </label>
              <select
                value={selectedVariant?.id}
                onChange={(e) => {
                  const variant = product.variants.edges.find(
                    (edge) => edge.node.id === e.target.value
                  );
                  if (variant) setSelectedVariant(variant.node);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              >
                {product.variants.edges.map((edge) => (
                  <option key={edge.node.id} value={edge.node.id}>
                    {edge.node.title} - {formatPrice(edge.node.priceV2.amount, edge.node.priceV2.currencyCode)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Add to Cart */}
          {selectedVariant && (
            <AddToCartButton
              variantId={selectedVariant.id}
              availableForSale={selectedVariant.availableForSale}
              className="w-full mb-6"
            />
          )}

          {/* Description */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <div
              className="text-gray-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-semibold mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
