"use client";

import { ReactNode } from 'react';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 md:flex md:items-center md:justify-center p-0 md:p-8 font-sans">
      <div className="w-full md:max-w-[1400px] min-h-screen md:min-h-0 md:aspect-[16/10] bg-white md:rounded-xl md:shadow-2xl overflow-hidden flex flex-col relative md:ring-1 md:ring-white/10">
        <div className="flex-1 relative overflow-hidden bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
}
