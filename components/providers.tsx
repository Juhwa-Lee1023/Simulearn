"use client";

import { ReactNode } from 'react';
import { SimulationProvider } from '@/lib/simulation-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SimulationProvider>
      {children}
    </SimulationProvider>
  );
}
