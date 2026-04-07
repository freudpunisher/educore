import type React from "react"
import type { Metadata } from "next"
import { DM_Sans, DM_Serif_Display, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/lib/theme-provider"
import "./globals.css"
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "School Management System",
  description: "School Management System Application",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <Providers>

          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                },
                success: {
                  icon: "✔️",
                  style: { borderColor: "hsl(var(--success))" },
                },
                error: {
                  icon: "❌",
                  style: { borderColor: "hsl(var(--destructive))" },
                },
              }}
            />
          </ThemeProvider>
        </Providers>

        <Analytics />
      </body>
    </html>
  )
}
