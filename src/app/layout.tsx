import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe-AVS",
  description: "Validate your ideas, designs, and code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* 'main' tag will have the fade-in animation from globals.css */}
        <main>{children}</main>
      </body>
    </html>
  );
}