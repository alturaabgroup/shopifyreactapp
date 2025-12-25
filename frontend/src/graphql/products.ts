import { storefrontClient } from '../lib/storefrontClient';

/**
 * Get a product by handle
 */
export async function getProductByHandle(handle: string) {
  const query = `
    query GetProduct($handle: String!) {
      product(handle: $handle) {
        id
        handle
        title
        description
        descriptionHtml
        vendor
        productType
        tags
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
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 50) {
          edges {
            node {
              id
              title
              availableForSale
              quantityAvailable
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              image {
                url
                altText
              }
            }
          }
        }
        options {
          name
          values
        }
        availableForSale
        seo {
          title
          description
        }
      }
    }
  `;

  const data = await storefrontClient.query<any>(query, { handle });
  if (!data.product) return null;

  return {
    ...data.product,
    images: data.product.images.edges.map((edge: any) => edge.node),
    variants: data.product.variants.edges.map((edge: any) => edge.node),
  };
}

/**
 * Get products for a collection
 */
export async function getProducts(first: number = 24, query?: string) {
  const gqlQuery = `
    query GetProducts($first: Int!, $query: String) {
      products(first: $first, query: $query) {
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
            availableForSale
          }
        }
      }
    }
  `;

  const data = await storefrontClient.query<any>(gqlQuery, { first, query });
  return data.products.edges.map((edge: any) => edge.node);
}

/**
 * Search products
 */
export async function searchProducts(searchQuery: string, first: number = 24) {
  return getProducts(first, searchQuery);
}

/**
 * Get product recommendations
 */
export async function getProductRecommendations(productId: string) {
  const query = `
    query GetProductRecommendations($productId: ID!) {
      productRecommendations(productId: $productId) {
        id
        handle
        title
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          url
          altText
        }
        availableForSale
      }
    }
  `;

  const data = await storefrontClient.query<any>(query, { productId });
  return data.productRecommendations || [];
}
