import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShivShakti Gaming",
  description: "ShivShakti Gaming — premium black and gold platform."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
