'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAppDispatch, useAppSelector } from '@/utils/storeHooks';
import { addToCart, initCart } from '@/cart/cartSlice';
import type { ShopifyOrder } from '@/types/shopify';
import { formatPrice, formatDateTime, formatOrderNumber } from '@/utils/format';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const isAuthenticated = useAuthGuard();
  const params = useParams();
  const orderId = decodeURIComponent(params.id as string);
  const dispatch = useAppDispatch();
  const { cartId } = useAppSelector((state) => state.cart);
  const [order, setOrder] = useState<ShopifyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/detail?id=${encodeURIComponent(orderId)}`);
        const data = await response.json();
        if (response.ok) {
          setOrder(data.order);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isAuthenticated]);

  const handleReorder = async () => {
    if (!order) return;

    setReordering(true);
    try {
      // Ensure cart is initialized
      let currentCartId = cartId;
      if (!currentCartId) {
        const result = await dispatch(initCart()).unwrap();
        currentCartId = result.id;
      }

      // Add all items from order to cart
      const addPromises = order.lineItems.edges.map(async ({ node: item }) => {
        if (item.variant?.id) {
          return dispatch(
            addToCart({
              cartId: currentCartId,
              variantId: item.variant.id,
              quantity: item.quantity,
            })
          ).unwrap();
        }
      });

      await Promise.all(addPromises);
      toast.success('Items added to cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reorder');
    } finally {
      setReordering(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <Link href="/account" className="text-brand hover:underline">
            Back to Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/account" className="text-brand hover:underline mb-4 inline-block">
          ← Back to Account
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order {formatOrderNumber(order.orderNumber)}
            </h1>
            <p className="text-gray-600 mt-1">{formatDateTime(order.processedAt)}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleReorder}
              disabled={reordering}
              className="bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50"
            >
              {reordering ? 'Adding to Cart...' : 'Reorder'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Order Status</h3>
            <div className="space-y-1">
              {order.financialStatus && (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                  {order.financialStatus}
                </span>
              )}
              {order.fulfillmentStatus && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm ml-2">
                  {order.fulfillmentStatus}
                </span>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Total</h3>
            <p className="text-2xl font-bold text-brand">
              {formatPrice(order.totalPriceV2.amount, order.totalPriceV2.currencyCode)}
            </p>
          </div>

          {order.shippingAddress && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Shipping Address</h3>
              <p className="text-sm text-gray-600">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p className="text-sm text-gray-600">{order.shippingAddress.address1}</p>
              {order.shippingAddress.address2 && (
                <p className="text-sm text-gray-600">{order.shippingAddress.address2}</p>
              )}
              <p className="text-sm text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.province}{' '}
                {order.shippingAddress.zip}
              </p>
              <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.lineItems.edges.map(({ node: item }, idx) => {
            const imageUrl = item.variant?.image?.url;
            return (
              <div key={idx} className="flex gap-4 border-b pb-4 last:border-b-0">
                <div className="relative w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover rounded"
                      sizes="80px"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.variant && item.variant.title !== 'Default Title' && (
                    <p className="text-sm text-gray-600">{item.variant.title}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                  {item.variant && (
                    <p className="text-brand font-semibold mt-2">
                      {formatPrice(item.variant.priceV2.amount, item.variant.priceV2.currencyCode)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
