import type { Metadata } from "next";
import SettingsButton from './components/settings-button'
import "./globals.css";

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
