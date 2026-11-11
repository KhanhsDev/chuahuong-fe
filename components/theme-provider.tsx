'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';

function ThemeProvider({
  children,
  scriptProps,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={{
        ...scriptProps,
        type: typeof window === 'undefined' ? 'text/javascript' : 'text/plain',
      }}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export { ThemeProvider };
