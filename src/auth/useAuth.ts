import { useAppDispatch, useAppSelector } from '@/utils/storeHooks';
import { setAuth, clearAuth } from './authSlice';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, customer } = useAppSelector((state) => state.auth);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      dispatch(setAuth({ customer: data.customer }));
      toast.success('Logged in successfully!');
      router.push('/account');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      dispatch(setAuth({ customer: data.customer }));
      toast.success('Account created successfully!');
      router.push('/account');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      dispatch(clearAuth());
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      dispatch(clearAuth());
      router.push('/');
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/account/profile');
      if (response.ok) {
        const data = await response.json();
        dispatch(setAuth({ customer: data.customer }));
      } else {
        dispatch(clearAuth());
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch(clearAuth());
    }
  };

  return {
    isAuthenticated,
    customer,
    login,
    signup,
    logout,
    checkAuth,
  };
}
