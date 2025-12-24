'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/utils/storeHooks';
import { initCart, updateCartLine, removeCartLines } from '@/cart/cartSlice';
import { formatPrice } from '@/utils/format';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { cart, cartId, loading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    if (!cart) {
      dispatch(initCart());
    }
  }, [dispatch, cart]);

  const handleUpdateQuantity = async (lineId: string, newQuantity: number) => {
    if (!cartId || newQuantity < 1) return;

    try {
      await dispatch(updateCartLine({ cartId, lineId, quantity: newQuantity })).unwrap();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (lineId: string) => {
    if (!cartId) return;

    try {
      await dispatch(removeCartLines({ cartId, lineIds: [lineId] })).unwrap();
      toast.success('Removed from cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
    }
  };

  const lines = cart?.lines.edges || [];
  const totalAmount = cart?.cost.totalAmount;

  if (loading && !cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {lines.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4 text-lg">Your cart is empty</p>
          <Link
            href="/"
            className="inline-block bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {lines.map(({ node: line }) => {
              const imageUrl = line.merchandise.product.images.edges[0]?.node.url;

              return (
                <div key={line.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex gap-6">
                    <div className="relative w-32 h-32 bg-gray-200 rounded flex-shrink-0">
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={line.merchandise.product.title}
                          fill
                          className="object-cover rounded"
                          sizes="128px"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/products/${line.merchandise.product.handle}`}
                        className="text-lg font-semibold hover:text-brand"
                      >
                        {line.merchandise.product.title}
                      </Link>
                      <p className="text-gray-600 mt-1">
                        {line.merchandise.title !== 'Default Title' && line.merchandise.title}
                      </p>
                      <p className="text-brand font-bold text-xl mt-2">
                        {formatPrice(
                          line.merchandise.priceV2.amount,
                          line.merchandise.priceV2.currencyCode
                        )}
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() => handleUpdateQuantity(line.id, line.quantity - 1)}
                            disabled={loading || line.quantity <= 1}
                            className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="px-4 py-2 border-x">{line.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(line.id, line.quantity + 1)}
                            disabled={loading}
                            className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(line.id)}
                          disabled={loading}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items</span>
                  <span className="font-medium">{lines.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium">
                    {lines.reduce((total, { node }) => total + node.quantity, 0)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-brand">
                    {totalAmount && formatPrice(totalAmount.amount, totalAmount.currencyCode)}
                  </span>
                </div>
              </div>

              {cart?.checkoutUrl && (
                <a
                  href={cart.checkoutUrl}
                  className="block w-full bg-brand text-white text-center py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                >
                  Proceed to Checkout
                </a>
              )}

              <Link
                href="/"
                className="block w-full text-center py-3 text-brand hover:underline mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
