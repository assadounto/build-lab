import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import "./globals.css";
import "./workspace.css";
import "./studio-design.css";
import "./discovery-design.css";
import "./community-design.css";
import "./professional-theme.css";

export const metadata: Metadata = { title: "BuildLab — Learn by building", description: "Real engineering and computer science projects for curious minds, from JHS to university." };

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><Header />{children}<footer className="footer"><div className="container footer-main"><div className="footer-about"><Link className="logo" href="/"><span className="logo-mark" aria-hidden="true">▥</span><span className="logo-word">BuildLab</span></Link><p>A space to learn engineering and computer science by making things that matter.</p><span>Ideas become real here.</span></div><div><h2>Explore</h2><Link href="/projects">Projects</Link><Link href="/courses">Course previews</Link><Link href="/community">Community</Link></div><div><h2>Build</h2><Link href="/studio">Your studio</Link><Link href="/studio/new">Start a project</Link><Link href="/projects/solar-rover">Featured build</Link></div><div><h2>Schools</h2><Link href="/schools">For schools</Link><Link href="/schools/dashboard">Teacher dashboard</Link></div></div><div className="container footer-bottom"><span>© 2026 BuildLab</span><span>Built for curious minds across Africa.</span></div></footer></body></html>;
}
