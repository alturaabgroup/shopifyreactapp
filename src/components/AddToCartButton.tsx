'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/utils/storeHooks';
import { addToCart, initCart } from '@/cart/cartSlice';
import toast from 'react-hot-toast';

interface AddToCartButtonProps {
  variantId: string;
  availableForSale: boolean;
  className?: string;
}

export default function AddToCartButton({
  variantId,
  availableForSale,
  className = '',
}: AddToCartButtonProps) {
  const dispatch = useAppDispatch();
  const { cartId, loading } = useAppSelector((state) => state.cart);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!availableForSale) {
      toast.error('This product is not available for sale');
      return;
    }

    setIsAdding(true);
    try {
      // Initialize cart if not exists
      let currentCartId = cartId;
      if (!currentCartId) {
        const result = await dispatch(initCart()).unwrap();
        currentCartId = result.id;
      }

      // Add to cart
      await dispatch(
        addToCart({
          cartId: currentCartId,
          variantId,
          quantity: 1,
        })
      ).unwrap();

      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={!availableForSale || loading || isAdding}
      className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
        !availableForSale
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
          : loading || isAdding
          ? 'bg-gray-400 text-white cursor-wait'
          : 'bg-brand text-white hover:bg-teal-700'
      } ${className}`}
    >
      {isAdding ? 'Adding...' : !availableForSale ? 'Sold Out' : 'Add to Cart'}
    </button>
  );
}
