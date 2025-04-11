import React from "react";

export default function Footer() {
  return (
    <footer className="p-8 text-center text-white/25">
      <small className="mb-2 block text-xs">
        &copy; 2025 Shauna Lachelier. All rights reserved.
      </small>
      <p className="text-xs">
        <span className="font-semibold">About this website:</span> built with
        React & Next.js (App Router & Server Actions), TypeScript, Tailwind CSS,
        Framer Motion, Vercel hosting.
      </p>
    </footer>
  );
}