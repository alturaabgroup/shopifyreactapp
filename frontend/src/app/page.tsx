import { Suspense } from 'react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { CollectionGridSkeleton } from '@/components/Skeleton';
import { getFeaturedCollections } from '@/graphql/collections';
import { getProducts } from '@/graphql/products';

export const metadata = {
  title: 'Home - Shopify Store',
  description: 'Welcome to our store. Shop our featured collections and products.',
};

export default async function HomePage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-white text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Our Store
            </h1>
            <p className="text-xl mb-8">
              Discover amazing products at great prices
            </p>
            <a
              href="/collections"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </a>
          </div>
        </section>

        {/* Featured Collections */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Featured Collections
          </h2>
          <Suspense fallback={<CollectionGridSkeleton count={6} />}>
            <FeaturedCollections />
          </Suspense>
        </section>

        {/* Featured Products */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Featured Products
          </h2>
          <Suspense fallback={<CollectionGridSkeleton />}>
            <FeaturedProducts />
          </Suspense>
        </section>
      </div>
    </Layout>
  );
}

async function FeaturedCollections() {
  try {
    const collections = await getFeaturedCollections(6);
    
    if (!collections || collections.length === 0) {
      return (
        <p className="text-gray-600 text-center py-8">
          No collections available at the moment.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection: any) => (
          <a
            key={collection.id}
            href={`/collections/${collection.handle}`}
            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="aspect-video bg-gray-200 overflow-hidden">
              {collection.image ? (
                <img
                  src={collection.image.url}
                  alt={collection.image.altText || collection.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {collection.title}
              </h3>
              {collection.description && (
                <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                  {collection.description}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error loading featured collections:', error);
    return (
      <p className="text-red-600 text-center py-8">
        Failed to load collections. Please try again later.
      </p>
    );
  }
}

async function FeaturedProducts() {
  try {
    const products = await getProducts(8);
    
    if (!products || products.length === 0) {
      return (
        <p className="text-gray-600 text-center py-8">
          No products available at the moment.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error loading featured products:', error);
    return (
      <p className="text-red-600 text-center py-8">
        Failed to load products. Please try again later.
      </p>
    );
  }
}
