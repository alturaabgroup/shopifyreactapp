import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/utils/storeHooks';

export function useAuthGuard() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return isAuthenticated;
}
