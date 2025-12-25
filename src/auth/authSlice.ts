import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  customer: {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  customer: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ customer: AuthState['customer'] }>) => {
      state.isAuthenticated = true;
      state.customer = action.payload.customer;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.customer = null;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
