"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

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
        type: typeof window === "undefined" ? "text/javascript" : "text/plain",
      }}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
