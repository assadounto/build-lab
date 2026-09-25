"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";

export function SiteHeader() {
  const pathname = usePathname();
  return pathname === "/admin" || pathname.startsWith("/admin/") ? null : <Header />;
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <footer className="footer"><div className="container footer-main"><div className="footer-about"><Link className="logo" href="/"><span className="logo-mark" aria-hidden="true">▥</span><span className="logo-word">BuildLab</span></Link><p>A space to learn engineering and computer science by making things that matter.</p><span>Ideas become real here.</span></div><div><h2>Explore</h2><Link href="/projects">Projects</Link><Link href="/courses">Course previews</Link><Link href="/community">Community</Link></div><div><h2>Build</h2><Link href="/studio">Your studio</Link><Link href="/studio/new">Start a project</Link></div><div><h2>For you</h2><Link href="/schools">Schools & educators</Link><Link href="/#for-professionals">Professionals</Link><Link href="/schools/dashboard">Teacher dashboard</Link></div></div><div className="container footer-bottom"><span>© 2026 BuildLab</span><span>Built for curious minds across Africa.</span></div></footer>;
}
