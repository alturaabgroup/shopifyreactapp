'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/utils/storeHooks';
import { updateCartLine, removeCartLines } from '@/cart/cartSlice';
import { formatPrice } from '@/utils/format';
import toast from 'react-hot-toast';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const dispatch = useAppDispatch();
  const { cart, cartId, loading } = useAppSelector((state) => state.cart);
  const [updatingLines, setUpdatingLines] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleUpdateQuantity = async (lineId: string, newQuantity: number) => {
    if (!cartId || newQuantity < 1) return;

    setUpdatingLines((prev) => new Set(prev).add(lineId));
    try {
      await dispatch(updateCartLine({ cartId, lineId, quantity: newQuantity })).unwrap();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quantity');
    } finally {
      setUpdatingLines((prev) => {
        const newSet = new Set(prev);
        newSet.delete(lineId);
        return newSet;
      });
    }
  };

  const handleRemove = async (lineId: string) => {
    if (!cartId) return;

    setUpdatingLines((prev) => new Set(prev).add(lineId));
    try {
      await dispatch(removeCartLines({ cartId, lineIds: [lineId] })).unwrap();
      toast.success('Removed from cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
    } finally {
      setUpdatingLines((prev) => {
        const newSet = new Set(prev);
        newSet.delete(lineId);
        return newSet;
      });
    }
  };

  const lines = cart?.lines.edges || [];
  const totalAmount = cart?.cost.totalAmount;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          {lines.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Your cart is empty</p>
              <Link
                href="/"
                onClick={onClose}
                className="text-brand hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {lines.map(({ node: line }) => {
                  const imageUrl = line.merchandise.product.images.edges[0]?.node.url;
                  const isUpdating = updatingLines.has(line.id);

                  return (
                    <div key={line.id} className="flex gap-4 border-b pb-4">
                      <div className="relative w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={line.merchandise.product.title}
                            fill
                            className="object-cover rounded"
                            sizes="80px"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/products/${line.merchandise.product.handle}`}
                          onClick={onClose}
                          className="font-semibold hover:text-brand"
                        >
                          {line.merchandise.product.title}
                        </Link>
                        <p className="text-sm text-gray-600">
                          {line.merchandise.title !== 'Default Title' && line.merchandise.title}
                        </p>
                        <p className="text-brand font-semibold mt-1">
                          {formatPrice(
                            line.merchandise.priceV2.amount,
                            line.merchandise.priceV2.currencyCode
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateQuantity(line.id, line.quantity - 1)}
                            disabled={isUpdating || line.quantity <= 1}
                            className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="px-3">{line.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(line.id, line.quantity + 1)}
                            disabled={isUpdating}
                            className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemove(line.id)}
                            disabled={isUpdating}
                            className="ml-auto text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total and Checkout */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-brand">
                    {totalAmount && formatPrice(totalAmount.amount, totalAmount.currencyCode)}
                  </span>
                </div>
                {cart?.checkoutUrl && (
                  <a
                    href={cart.checkoutUrl}
                    className="block w-full bg-brand text-white text-center py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                  >
                    Checkout
                  </a>
                )}
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="block w-full text-center py-3 text-brand hover:underline mt-2"
                >
                  View Full Cart
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
