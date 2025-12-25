'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { getCart, updateCartLine, removeFromCart, Cart as CartType } from '@/lib/cart';

export default function CartPage() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (lineId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setUpdating(lineId);
    try {
      const updatedCart = await updateCartLine(lineId, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating cart:', error);
      alert('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (lineId: string) => {
    setUpdating(lineId);
    try {
      const updatedCart = await removeFromCart(lineId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!cart || !cart.lines.edges || cart.lines.edges.length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
            <a
              href="/collections"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
  const total = parseFloat(cart.cost.totalAmount.amount);
  const currencyCode = cart.cost.totalAmount.currencyCode;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.lines.edges.map(({ node: line }) => (
              <div
                key={line.id}
                className="bg-white rounded-lg shadow-sm p-4 flex gap-4"
              >
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {line.merchandise.product.featuredImage ? (
                    <img
                      src={line.merchandise.product.featuredImage.url}
                      alt={
                        line.merchandise.product.featuredImage.altText ||
                        line.merchandise.product.title
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-grow">
                  <a
                    href={`/products/${line.merchandise.product.handle}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {line.merchandise.product.title}
                  </a>
                  <p className="text-gray-600 text-sm">{line.merchandise.title}</p>
                  <p className="text-lg font-bold text-gray-900 mt-2">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: line.merchandise.price.currencyCode,
                    }).format(parseFloat(line.merchandise.price.amount))}
                  </p>
                </div>

                {/* Quantity & Remove */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => handleRemoveItem(line.id)}
                    disabled={updating === line.id}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(line.id, line.quantity - 1)
                      }
                      disabled={updating === line.id || line.quantity <= 1}
                      className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(line.id, line.quantity + 1)
                      }
                      disabled={updating === line.id}
                      className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currencyCode,
                    }).format(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currencyCode,
                    }).format(total)}
                  </span>
                </div>
              </div>

              <a
                href={cart.checkoutUrl}
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Proceed to Checkout
              </a>

              <a
                href="/collections"
                className="block w-full text-center py-3 text-blue-600 hover:text-blue-700 font-medium mt-4"
              >
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
