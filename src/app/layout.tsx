import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Schedaddle",
  description: "Schedaddle schedoodle, your schedule is now a doddle!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "max-h-screen h-screen dark:bg-background bg-primary/[4%] font-sans antialiased flex flex-col",
          inter.variable
        )}
      >
        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID || ""}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Analytics />
            <Toaster
              richColors
              toastOptions={{
                classNames: {
                  title: "font-sans",
                  description: "font-sans",
                },
              }}
            />
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
