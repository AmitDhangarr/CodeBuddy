'use client'
import "./globals.css";
import ThemesProvider from "@/components/themeprovider";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{colorScheme:"light"}}>
      <body>
        <ThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemesProvider>
      </body>
    </html>
  );
}
