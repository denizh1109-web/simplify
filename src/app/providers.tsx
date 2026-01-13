'use client';

import { useEffect, ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Check for system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    
    const html = document.documentElement;
    
    if (savedTheme) {
      if (savedTheme !== 'system') {
        html.setAttribute('data-theme', savedTheme);
      } else {
        html.removeAttribute('data-theme');
      }
    } else if (prefersDark) {
      html.removeAttribute('data-theme');
    }
  }, []);

  return <>{children}</>;
}
