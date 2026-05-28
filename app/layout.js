import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import { I18nProvider } from "@/components/I18nProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";
import SocketProvider from "@/components/providers/SocketProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Nakshtra.ai Astrologer",
  description: "Nakshtra.ai Astrologer App",
  icons: {
    icon: "/assets/img/logo.png",
    shortcut: "/assets/img/logo.png",
    apple: "/assets/img/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="h-dvh overflow-hidden">
        <ReduxProvider>
          <SocketProvider>
            <I18nProvider>
              {children}
              <ToastProvider />
            </I18nProvider>
          </SocketProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

