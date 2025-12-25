// Shopify Storefront API Types

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  images: { edges: Array<{ node: { url: string; altText?: string } }> };
  variants: { edges: Array<{ node: ShopifyProductVariant }> };
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  availableForSale: boolean;
  tags: string[];
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  priceV2: { amount: string; currencyCode: string };
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
  quantityAvailable?: number;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: { edges: Array<{ node: ShopifyCartLine }> };
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    subtotalAmount: { amount: string; currencyCode: string };
  };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      handle: string;
      images: { edges: Array<{ node: { url: string } }> };
    };
    priceV2: { amount: string; currencyCode: string };
  };
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  defaultAddress?: ShopifyAddress;
  addresses: { edges: Array<{ node: ShopifyAddress }> };
  orders: { edges: Array<{ node: ShopifyOrder }> };
}

export interface ShopifyAddress {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
}

export interface ShopifyOrder {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
  totalPriceV2: { amount: string; currencyCode: string };
  lineItems: { edges: Array<{ node: ShopifyOrderLineItem }> };
  shippingAddress?: ShopifyAddress;
}

export interface ShopifyOrderLineItem {
  title: string;
  quantity: number;
  variant?: {
    id: string;
    title: string;
    image?: { url: string };
    priceV2: { amount: string; currencyCode: string };
  };
}

export interface ShopifyCustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

export interface ShopifyCustomerUserError {
  field?: string[];
  message: string;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
  extensions?: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}
