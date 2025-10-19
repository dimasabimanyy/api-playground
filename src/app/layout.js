import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CollectionsProvider } from '@/contexts/CollectionsContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "API Playground - Modern API Testing Tool",
  description: "A lightweight, beautiful API playground for testing endpoints, organizing collections, and generating documentation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <CollectionsProvider>
              {children}
            </CollectionsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
