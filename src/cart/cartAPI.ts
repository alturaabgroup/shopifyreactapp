import { shopifyRequest } from '@/api/shopifyClient';
import { CREATE_CART, ADD_CART_LINES, UPDATE_CART_LINES, REMOVE_CART_LINES } from '@/api/mutations';
import { GET_CART } from '@/api/queries';
import type { ShopifyCart } from '@/types/shopify';

const CART_ID_KEY = 'shopify_cart_id';

export async function initializeCart(): Promise<ShopifyCart> {
  // Try to load existing cart from localStorage
  if (typeof window !== 'undefined') {
    const savedCartId = localStorage.getItem(CART_ID_KEY);
    if (savedCartId) {
      try {
        const response: any = await shopifyRequest(GET_CART, { cartId: savedCartId });
        if (response.cart) {
          return response.cart;
        }
      } catch (error) {
        console.error('Failed to load saved cart:', error);
        localStorage.removeItem(CART_ID_KEY);
      }
    }
  }

  // Create new cart
  const response: any = await shopifyRequest(CREATE_CART, { input: { lines: [] } });
  const cart = response.cartCreate.cart;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_ID_KEY, cart.id);
  }
  
  return cart;
}

export async function addLineToCart(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<ShopifyCart> {
  const response: any = await shopifyRequest(ADD_CART_LINES, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });

  if (response.cartLinesAdd.userErrors?.length > 0) {
    throw new Error(response.cartLinesAdd.userErrors[0].message);
  }

  return response.cartLinesAdd.cart;
}

export async function updateLineInCart(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<ShopifyCart> {
  const response: any = await shopifyRequest(UPDATE_CART_LINES, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  if (response.cartLinesUpdate.userErrors?.length > 0) {
    throw new Error(response.cartLinesUpdate.userErrors[0].message);
  }

  return response.cartLinesUpdate.cart;
}

export async function removeLinesFromCart(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart> {
  const response: any = await shopifyRequest(REMOVE_CART_LINES, {
    cartId,
    lineIds,
  });

  if (response.cartLinesRemove.userErrors?.length > 0) {
    throw new Error(response.cartLinesRemove.userErrors[0].message);
  }

  return response.cartLinesRemove.cart;
}
