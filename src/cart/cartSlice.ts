import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ShopifyCart } from '@/types/shopify';
import { initializeCart, addLineToCart, updateLineInCart, removeLinesFromCart } from './cartAPI';

interface CartState {
  cart: ShopifyCart | null;
  cartId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  cartId: null,
  loading: false,
  error: null,
};

// Async thunks
export const initCart = createAsyncThunk('cart/initCart', async () => {
  return await initializeCart();
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ cartId, variantId, quantity }: { cartId: string; variantId: string; quantity: number }) => {
    return await addLineToCart(cartId, variantId, quantity);
  }
);

export const updateCartLine = createAsyncThunk(
  'cart/updateCartLine',
  async ({ cartId, lineId, quantity }: { cartId: string; lineId: string; quantity: number }) => {
    return await updateLineInCart(cartId, lineId, quantity);
  }
);

export const removeCartLines = createAsyncThunk(
  'cart/removeCartLines',
  async ({ cartId, lineIds }: { cartId: string; lineIds: string[] }) => {
    return await removeLinesFromCart(cartId, lineIds);
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartId: (state, action: PayloadAction<string>) => {
      state.cartId = action.payload;
    },
    clearCart: (state) => {
      state.cart = null;
      state.cartId = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('shopify_cart_id');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Init cart
      .addCase(initCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.cartId = action.payload.id;
      })
      .addCase(initCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to initialize cart';
      })
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add to cart';
      })
      // Update cart line
      .addCase(updateCartLine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartLine.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(updateCartLine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update cart';
      })
      // Remove cart lines
      .addCase(removeCartLines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCartLines.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(removeCartLines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove from cart';
      });
  },
});

export const { setCartId, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
