import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MumStartupArena — Mumbai's startup map",
  description: "Discover verified technology companies and live opportunities across Mumbai, Navi Mumbai, Thane and MMR.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
