import { Geist, Geist_Mono, Noto_Sans, EB_Garamond } from "next/font/google"
import { SWRProvider } from "@/providers/swr-provider"
import LoginModalHost from "@/components/LoginModalHost"

import "./globals.css"
import "react-toastify/dist/ReactToastify.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const ebGaramondHeading = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
})

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        notoSans.variable,
        ebGaramondHeading.variable
      )}
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <SWRProvider>
            {children}
            <LoginModalHost />
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
