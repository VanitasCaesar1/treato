import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthKitProvider } from '@workos-inc/authkit-nextjs/components';

export const metadata: Metadata = {
  title: "Treato",
  description: "Healthcare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <AuthKitProvider>{children}</AuthKitProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
