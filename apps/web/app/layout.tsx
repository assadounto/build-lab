import type { Metadata } from "next";
import { Header } from "@/components/header";
import "./globals.css";
import "./workspace.css";

export const metadata: Metadata = { title: "BuildLab — Learn by building", description: "Real engineering and computer science projects for curious minds, from JHS to university." };

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><Header />{children}<footer className="footer"><div className="container footer-inner"><strong>BuildLab<span className="blue-dot">.</span></strong><span>Ideas become real here.</span><span>Built for curious minds across Africa.</span></div></footer></body></html>;
}
