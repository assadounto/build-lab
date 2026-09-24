import Link from "next/link";

export function Header() {
  return <header className="site-header"><div className="container header-inner"><Link className="logo" href="/" aria-label="BuildLab home"><span className="logo-mark">◆</span> Build<span>Lab</span></Link><nav aria-label="Main navigation"><Link href="/projects">Explore</Link><Link href="/projects#courses">Courses</Link><Link href="/studio">Studio</Link><Link href="/schools">For schools</Link></nav><Link className="button button-small" href="/studio">Enter your studio <span aria-hidden="true">↗</span></Link></div></header>;
}
