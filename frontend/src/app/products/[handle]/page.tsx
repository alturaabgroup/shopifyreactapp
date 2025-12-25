'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Layout from '@/components/Layout';
import { ProductDetailSkeleton } from '@/components/Skeleton';
import { getProductByHandle } from '@/graphql/products';
import { addToCart } from '@/lib/cart';

export default function ProductPage({ params }: { params: { handle: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Load product data
  useState(() => {
    getProductByHandle(params.handle)
      .then((data) => {
        if (!data) {
          notFound();
        }
        setProduct(data);
        
        // Set default variant
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
          
          // Set default options
          const defaultOptions: Record<string, string> = {};
          data.variants[0].selectedOptions.forEach((option: any) => {
            defaultOptions[option.name] = option.value;
          });
          setSelectedOptions(defaultOptions);
        }
        
        // Set default image
        if (data.featuredImage) {
          setSelectedImage(data.featuredImage.url);
        }
        
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading product:', error);
        setLoading(false);
      });
  });

  if (loading) {
    return (
      <Layout>
        <ProductDetailSkeleton />
      </Layout>
    );
  }

  if (!product) {
    notFound();
  }

  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);

    // Find matching variant
    const variant = product.variants.find((v: any) =>
      v.selectedOptions.every((opt: any) => newOptions[opt.name] === opt.value)
    );

    if (variant) {
      setSelectedVariant(variant);
      if (variant.image) {
        setSelectedImage(variant.image.url);
      }
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedVariant.availableForSale) return;

    setAddingToCart(true);
    try {
      await addToCart(selectedVariant.id, quantity);
      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const price = selectedVariant
    ? parseFloat(selectedVariant.price.amount)
    : parseFloat(product.priceRange.minVariantPrice.amount);
  const currencyCode = selectedVariant
    ? selectedVariant.price.currencyCode
    : product.priceRange.minVariantPrice.currencyCode;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image.url)}
                    className={`aspect-square bg-gray-200 rounded-lg overflow-hidden border-2 ${
                      selectedImage === image.url
                        ? 'border-blue-600'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || `${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              {product.vendor && (
                <p className="text-gray-600">by {product.vendor}</p>
              )}
            </div>

            <div className="text-3xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode,
              }).format(price)}
            </div>

            {product.description && (
              <div
                className="text-gray-700 prose"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
              />
            )}

            {/* Product Options */}
            {product.options &&
              product.options.map((option: any) => (
                <div key={option.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {option.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value: string) => (
                      <button
                        key={value}
                        onClick={() => handleOptionChange(option.name, value)}
                        className={`px-4 py-2 border rounded-lg ${
                          selectedOptions[option.name] === value
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={
                !selectedVariant ||
                !selectedVariant.availableForSale ||
                addingToCart
              }
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white ${
                !selectedVariant || !selectedVariant.availableForSale
                  ? 'bg-gray-400 cursor-not-allowed'
                  : addingToCart
                  ? 'bg-blue-400 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {!selectedVariant || !selectedVariant.availableForSale
                ? 'Out of Stock'
                : addingToCart
                ? 'Adding...'
                : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
