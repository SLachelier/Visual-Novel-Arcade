"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <header className='z-[999] relative flex justify-end flex-direction-column items-center w-full h-12 bg-purple-900/20 p-10'>
      <nav className='display-flex top-[0.15rem] h-9 py-2 sm:top-[0.5rem] sm:h-[initial] sm:py-0'>
        <ul className='flex w-[22rem] flex-wrap items-center justify-center gap-y-1 text-[1.7rem] font-medium sm:w-[initial] sm:flex-nowrap sm:gap-5'>
          {isHomePage ? (
            <>
              <li>
                <Link
                  className={'flex w-full items-center justify-center px-3 py-3 transition nav-link'}
                  href="/about"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  className={'flex w-full items-center justify-center px-3 py-3 transition nav-link'}
                  href="/contribute"
                >
                  Contribute
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link
                className={'flex w-full items-center justify-center px-3 py-3 nav-link'}
                href="/"
              >
                Home
              </Link>
            </li>
            
          )}
        </ul>
      </nav>
    </header>
  );
}