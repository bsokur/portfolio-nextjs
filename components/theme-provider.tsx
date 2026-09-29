'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { themeNames, themeStorageKey } from '@/lib/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme={themeNames.system}
      themes={[themeNames.light, themeNames.dark]}
      storageKey={themeStorageKey}
      enableSystem
    >
      {children}
    </NextThemeProvider>
  );
}
