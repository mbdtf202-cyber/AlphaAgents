import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlphaAgents",
  description: "Agent-native transaction, delivery, evidence, acceptance, and finance control plane."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
