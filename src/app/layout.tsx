import type { Metadata } from "next";
import localFont from "next/font/local";
import SettingsButton from './components/settings-button'
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Binghamton University Poker Club",
  description: "Rankings and Infomation for BUPC",
  icons:[{rel:'icon', url: '/icon.svg'}]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SettingsButton />
      </body>
    </html>
  )
}
