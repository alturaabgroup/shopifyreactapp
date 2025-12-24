'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ShopifyOrder } from '@/types/shopify';
import { formatPrice, formatDate, formatOrderNumber } from '@/utils/format';

interface OrderListProps {
  orders: ShopifyOrder[];
}

export default function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600 text-lg">No orders yet</p>
        <Link href="/" className="text-brand hover:underline mt-2 inline-block">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${encodeURIComponent(order.id)}`}
          className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                Order {formatOrderNumber(order.orderNumber)}
              </h3>
              <p className="text-sm text-gray-600">{formatDate(order.processedAt)}</p>
            </div>
            <div className="mt-2 md:mt-0 text-right">
              <p className="text-xl font-bold text-brand">
                {formatPrice(order.totalPriceV2.amount, order.totalPriceV2.currencyCode)}
              </p>
              <div className="flex gap-2 mt-1 justify-end">
                {order.financialStatus && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                    {order.financialStatus}
                  </span>
                )}
                {order.fulfillmentStatus && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {order.fulfillmentStatus}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {order.lineItems.edges.slice(0, 4).map(({ node: item }, idx) => {
              const imageUrl = item.variant?.image?.url;
              return (
                <div key={idx} className="relative w-16 h-16 bg-gray-200 rounded flex-shrink-0">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover rounded"
                      sizes="64px"
                    />
                  )}
                </div>
              );
            })}
            {order.lineItems.edges.length > 4 && (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-gray-600">
                  +{order.lineItems.edges.length - 4}
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
