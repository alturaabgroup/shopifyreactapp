'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/auth/useAuth';
import AuthForm from '@/components/AuthForm';

export default function SignupPage() {
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (data: any) => {
    setIsLoading(true);
    try {
      await signup(data.email, data.password, data.firstName, data.lastName);
    } catch (error) {
      // Error is handled in useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h1>
        <p className="text-gray-600 mb-6">Create your account to get started.</p>
        
        <AuthForm mode="signup" onSubmit={handleSignup} isLoading={isLoading} />
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-brand font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
