'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/utils/storeHooks';
import { initCart } from '@/cart/cartSlice';
import { useAuth } from '@/auth/useAuth';
import { shopifyRequest } from '@/api/shopifyClient';
import { GET_PRODUCTS } from '@/api/queries';
import ProductGrid from '@/components/ProductGrid';
import { ProductGridSkeleton } from '@/components/Skeleton';
import type { ShopifyProduct } from '@/types/shopify';
import { registerServiceWorker } from '@/pwa/registerSW';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { checkAuth } = useAuth();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize app
    const initApp = async () => {
      // Register service worker
      registerServiceWorker();

      // Check auth status
      checkAuth();

      // Initialize cart
      dispatch(initCart());

      // Fetch products
      try {
        const response: any = await shopifyRequest(GET_PRODUCTS, { first: 20 });
        const productList = response.products.edges.map((edge: any) => edge.node);
        setProducts(productList);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, [dispatch, checkAuth]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Our Store</h1>
        <p className="text-gray-600">Discover our latest products</p>
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
