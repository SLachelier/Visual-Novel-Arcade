"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <header className='z-[999] relative flex justify-end flex-direction-column items-center w-full h-12 bg-transparent p-10'>
      <nav className='display-flex top-[0.15rem] h-9 py-2 sm:top-[0.5rem] sm:h-[initial] xs:top-[0.5rem] xs:h-[initial] '>
        <ul className='flex w-[22rem] flex-wrap justify-evenly gap-y-1 text-[1.7rem] font-medium sm:w-[initial] sm:flex-nowrap sm:gap-5 xs:gap-5'>
          {isHomePage ? (
            <>
              <li>
                <Link
                  className={'flex w-full px-3 py-3 transition nav-link'}
                  href="/about"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  className={'flex w-full px-3 py-3 transition nav-link'}
                  href="/vn-maker"
                >
                  Make Your Own
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link
                className={'flex w-full px-3 py-3 transition nav-link'}
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