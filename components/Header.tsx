"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '../app/utils/supabase/client';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';
  const isLoginPage = pathname === '/login';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleVNMakerClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push('/login?message=Please log in or create an account to access the Visual Novel Studio.');
    }
  };

  return (
    <header className='z-[999] relative flex justify-end flex-direction-column items-center w-full h-12 bg-transparent p-10'>
      <nav className='display-flex top-[0.15rem] h-9 py-2 sm:top-[0.5rem] sm:h-[initial] xs:top-[0.5rem] xs:h-[initial] '>
        <ul className='flex w-[22rem] flex-wrap justify-evenly gap-y-1 text-[1.7rem] font-medium sm:w-[initial] sm:flex-nowrap sm:gap-5 xs:gap-5'>
          {/* Always show Home when not on home page */}
          {!isHomePage && (
            <li>
              <Link
                className={'flex w-full px-3 py-3 transition nav-link'}
                href="/">
                Home
              </Link>
            </li>
          )}
          
          {/* Always show About */}
          <li>
            <Link
              className={'flex w-full px-3 py-3 transition nav-link'}
              href="/about">
              About
            </Link>
          </li>

          {/* Show different links based on authentication state */}
          {isAuthenticated ? (
            <>
              <li>
                <Link
                  className={'flex w-full px-3 py-3 transition nav-link'}
                  href="/vn-maker">
                  VN Maker
                </Link>
              </li>
              <li>
                <Link
                  className={'flex w-full px-3 py-3 transition nav-link'}
                  href="/dashboard">
                  Dashboard
                </Link>
              </li>
              {/* Only show logout link when not on login page */}
              {!isLoginPage && (
                <li>
                  <img src="/globe.svg" alt="user image" className="w-[24px] h-[24px] mr-[4px]"/>
                  <Link
                    className={'flex w-full px-3 py-3 transition nav-link'}
                    href="/auth/signout">
                    Logout
                  </Link>
                </li>
              )}
            </>
          ) : (
            <>
              <li>
                <Link
                  className={'flex w-full px-3 py-3 transition nav-link'}
                  href="/vn-maker"
                  onClick={handleVNMakerClick}>
                  Make Your Own
                </Link>
              </li>
              {/* Only show login link when not on login page */}
              {!isLoginPage && (
                <li>
                  <Link
                    className={'flex w-full px-3 py-3 transition nav-link'}
                    href="/login">
                    Login
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}