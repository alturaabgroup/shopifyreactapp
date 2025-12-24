'use client';

import Link from 'next/link';
import { useAuth } from '@/auth/useAuth';
import { useAppSelector } from '@/utils/storeHooks';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const cart = useAppSelector((state) => state.cart.cart);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (cart?.lines.edges) {
      const count = cart.lines.edges.reduce((total, edge) => total + edge.node.quantity, 0);
      setCartItemCount(count);
    }
  }, [cart]);

  return (
    <nav className="bg-brand text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold hover:text-gray-200">
            ShopifyPWA
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-gray-200">
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/account" className="hover:text-gray-200">
                  Account
                </Link>
                <button onClick={logout} className="hover:text-gray-200">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-gray-200">
                  Login
                </Link>
                <Link href="/signup" className="hover:text-gray-200">
                  Sign Up
                </Link>
              </>
            )}
            <Link href="/cart" className="relative hover:text-gray-200">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <Link href="/" className="hover:text-gray-200" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/account" className="hover:text-gray-200" onClick={() => setIsMenuOpen(false)}>
                    Account
                  </Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-left hover:text-gray-200">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-gray-200" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/signup" className="hover:text-gray-200" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
              <Link href="/cart" className="flex items-center hover:text-gray-200" onClick={() => setIsMenuOpen(false)}>
                Cart {cartItemCount > 0 && `(${cartItemCount})`}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
