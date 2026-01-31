"use client";

import { ReactNode } from 'react';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-[1400px] aspect-[16/10] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-white/10">
        <div className="flex-1 relative overflow-hidden bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
}
