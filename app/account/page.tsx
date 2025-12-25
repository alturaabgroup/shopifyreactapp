'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAppSelector } from '@/utils/storeHooks';
import AddressForm from '@/components/AddressForm';
import OrderList from '@/components/OrderList';
import type { ShopifyAddress, ShopifyOrder } from '@/types/shopify';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const isAuthenticated = useAuthGuard();
  const customer = useAppSelector((state) => state.auth.customer);
  const [addresses, setAddresses] = useState<ShopifyAddress[]>([]);
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShopifyAddress | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      if (activeTab === 'addresses') {
        fetchAddresses();
      } else if (activeTab === 'orders') {
        fetchOrders();
      }
    };

    fetchData();
  }, [activeTab, isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/account/addresses/list');
      const data = await response.json();
      if (response.ok) {
        setAddresses(data.addresses);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/list');
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleAddAddress = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/account/addresses/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Address added successfully');
        setShowAddressForm(false);
        fetchAddresses();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add address');
      }
    } catch (error) {
      toast.error('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (data: any) => {
    if (!editingAddress) return;

    setLoading(true);
    try {
      const response = await fetch('/api/account/addresses/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingAddress.id, address: data }),
      });

      if (response.ok) {
        toast.success('Address updated successfully');
        setEditingAddress(null);
        fetchAddresses();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update address');
      }
    } catch (error) {
      toast.error('Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch('/api/account/addresses/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        toast.success('Address deleted successfully');
        fetchAddresses();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete address');
      }
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  if (!isAuthenticated) {
    return null; // Auth guard will redirect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'addresses'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Addresses
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Orders
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <p className="font-medium">
                {customer?.firstName} {customer?.lastName}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium">{customer?.email}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div>
          {!showAddressForm && !editingAddress && (
            <button
              onClick={() => setShowAddressForm(true)}
              className="mb-6 bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700"
            >
              Add New Address
            </button>
          )}

          {showAddressForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Add New Address</h2>
              <AddressForm
                onSubmit={handleAddAddress}
                onCancel={() => setShowAddressForm(false)}
                isLoading={loading}
              />
            </div>
          )}

          {editingAddress && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Edit Address</h2>
              <AddressForm
                initialData={editingAddress}
                onSubmit={handleUpdateAddress}
                onCancel={() => setEditingAddress(null)}
                isLoading={loading}
              />
            </div>
          )}

          {!showAddressForm && !editingAddress && (
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                  No addresses saved yet
                </div>
              ) : (
                addresses.map((address) => (
                  <div key={address.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {address.firstName} {address.lastName}
                        </p>
                        {address.company && <p className="text-gray-600">{address.company}</p>}
                        <p className="text-gray-600">{address.address1}</p>
                        {address.address2 && <p className="text-gray-600">{address.address2}</p>}
                        <p className="text-gray-600">
                          {address.city}, {address.province} {address.zip}
                        </p>
                        <p className="text-gray-600">{address.country}</p>
                        {address.phone && <p className="text-gray-600">{address.phone}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingAddress(address)}
                          className="text-brand hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && <OrderList orders={orders} />}
    </div>
  );
}
