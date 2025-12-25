import { Suspense } from 'react';
import Layout from '@/components/Layout';
import { CollectionGridSkeleton } from '@/components/Skeleton';
import { getCollections } from '@/graphql/collections';

export const metadata = {
  title: 'Collections - Shopify Store',
  description: 'Browse all our product collections',
};

export default async function CollectionsPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          All Collections
        </h1>
        
        <Suspense fallback={<CollectionGridSkeleton count={12} />}>
          <CollectionsList />
        </Suspense>
      </div>
    </Layout>
  );
}

async function CollectionsList() {
  try {
    const collections = await getCollections(50);
    
    if (!collections || collections.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No collections available at the moment.
          </p>
        </div>
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
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {collection.title}
              </h2>
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
    console.error('Error loading collections:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">
          Failed to load collections. Please try again later.
        </p>
      </div>
    );
  }
}
