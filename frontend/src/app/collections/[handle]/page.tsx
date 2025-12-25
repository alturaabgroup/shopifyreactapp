import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { CollectionGridSkeleton } from '@/components/Skeleton';
import { getCollectionByHandle } from '@/graphql/collections';

interface CollectionPageProps {
  params: {
    handle: string;
  };
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const collection = await getCollectionByHandle(params.handle);
  
  if (!collection) {
    return {
      title: 'Collection Not Found',
    };
  }

  return {
    title: `${collection.title} - Collections`,
    description: collection.description || `Shop ${collection.title}`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const collection = await getCollectionByHandle(params.handle);

  if (!collection) {
    notFound();
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Collection Header */}
        <div className="mb-8">
          {collection.image && (
            <div className="aspect-video max-h-96 bg-gray-200 rounded-lg overflow-hidden mb-6">
              <img
                src={collection.image.url}
                alt={collection.image.altText || collection.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {collection.title}
          </h1>
          
          {collection.description && (
            <p className="text-lg text-gray-600 max-w-3xl">
              {collection.description}
            </p>
          )}
        </div>

        {/* Products Grid */}
        <Suspense fallback={<CollectionGridSkeleton />}>
          <ProductsGrid products={collection.products} />
        </Suspense>
      </div>
    </Layout>
  );
}

function ProductsGrid({ products }: { products: any[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">
          No products in this collection yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
