'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCustomer, customerLogout } from '@/graphql/customer';

export default function AccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCustomer();
  }, []);

  const loadCustomer = async () => {
    try {
      const token = localStorage.getItem('customer_access_token');
      
      if (!token) {
        router.push('/account/login');
        return;
      }

      const customerData = await getCustomer(token);
      
      if (!customerData) {
        localStorage.removeItem('customer_access_token');
        localStorage.removeItem('customer_token_expires');
        router.push('/account/login');
        return;
      }

      setCustomer(customerData);
    } catch (err: any) {
      setError(err.message || 'Failed to load account information');
      localStorage.removeItem('customer_access_token');
      localStorage.removeItem('customer_token_expires');
      router.push('/account/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('customer_access_token');
      if (token) {
        await customerLogout(token);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('customer_access_token');
      localStorage.removeItem('customer_token_expires');
      router.push('/');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
          >
            Log Out
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Account Info */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Account Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-gray-900 font-medium">
                    {customer.displayName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900 font-medium">{customer.email}</p>
                </div>
                {customer.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900 font-medium">{customer.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order History
              </h2>
              
              {customer.orders && customer.orders.length > 0 ? (
                <div className="space-y-4">
                  {customer.orders.map((order: any) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            Order {order.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.processedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: order.totalPrice.currencyCode,
                            }).format(parseFloat(order.totalPrice.amount))}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.fulfillmentStatus || 'Pending'}
                          </p>
                        </div>
                      </div>
                      
                      {order.lineItems && order.lineItems.length > 0 && (
                        <div className="space-y-2 pt-3 border-t">
                          {order.lineItems.slice(0, 3).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3">
                              {item.variant?.image && (
                                <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.variant.image.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-grow">
                                <p className="text-sm text-gray-900">{item.title}</p>
                                <p className="text-xs text-gray-600">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.lineItems.length > 3 && (
                            <p className="text-sm text-gray-600">
                              +{order.lineItems.length - 3} more item(s)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No orders yet</p>
                  <a
                    href="/collections"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Start Shopping
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
