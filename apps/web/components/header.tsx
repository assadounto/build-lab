import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Header() {
  return <header className="site-header"><div className="container header-inner"><Link className="logo" href="/" aria-label="BuildLab home"><span className="logo-mark" aria-hidden="true">▥</span><span className="logo-word">BuildLab</span></Link><nav aria-label="Main navigation"><Link href="/projects">Projects</Link><Link href="/courses">Courses</Link><Link href="/community">Community</Link><Link href="/schools">For schools</Link></nav><div className="header-actions"><Link className="header-login" href="/login">Log in</Link><Link className="button button-small" href="/studio">Open studio <ArrowUpRight size={16} aria-hidden="true"/></Link></div></div></header>;
}
