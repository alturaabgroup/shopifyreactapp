import { storefrontClient } from '../lib/storefrontClient';

/**
 * Get all collections
 */
export async function getCollections(first: number = 10) {
  const query = `
    query GetCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            handle
            title
            description
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;

  const data = await storefrontClient.query<any>(query, { first });
  return data.collections.edges.map((edge: any) => edge.node);
}

/**
 * Get a single collection by handle
 */
export async function getCollectionByHandle(handle: string, productsFirst: number = 24) {
  const query = `
    query GetCollection($handle: String!, $productsFirst: Int!) {
      collection(handle: $handle) {
        id
        handle
        title
        description
        image {
          url
          altText
        }
        products(first: $productsFirst) {
          edges {
            node {
              id
              handle
              title
              description
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              featuredImage {
                url
                altText
              }
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              availableForSale
            }
          }
        }
      }
    }
  `;

  const data = await storefrontClient.query<any>(query, { handle, productsFirst });
  if (!data.collection) return null;

  return {
    ...data.collection,
    products: data.collection.products.edges.map((edge: any) => edge.node),
  };
}

/**
 * Get featured collections (first N collections)
 */
export async function getFeaturedCollections(first: number = 6) {
  return getCollections(first);
}
