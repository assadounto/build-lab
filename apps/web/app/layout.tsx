import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import "./globals.css";
import "./workspace.css";
import "./studio-design.css";
import "./discovery-design.css";
import "./community-design.css";
import "./professional-theme.css";

export const metadata: Metadata = { title: "BuildLab — Learn by building", description: "Real engineering and computer science projects for students, engineers, technicians and makers." };

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><SiteHeader />{children}<SiteFooter /></body></html>;
}
