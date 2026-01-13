'use client';

import { useEffect, ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Force light mode
    const html = document.documentElement;
    html.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  }, []);

  return <>{children}</>;
}
