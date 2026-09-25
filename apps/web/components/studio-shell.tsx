"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

const items = [
  { label: "Studio", href: "/studio", icon: "⌂" },
  { label: "Explore projects", href: "/projects", icon: "◇" },
  { label: "Community", href: "/community", icon: "♧" },
  { label: "For schools", href: "/schools/dashboard", icon: "▤" },
];

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [name, setName] = useState("");
  useEffect(() => { apiRequest<{ display_name: string }>("/api/session").then(user => setName(user.display_name)).catch(() => undefined); }, []);
  async function signOut() { await apiRequest("/api/session", { method: "DELETE" }).catch(() => undefined); window.location.assign("/login"); }
  return <div className="studio-shell"><aside className="studio-sidebar"><Link className="studio-brand" href="/"><span className="studio-brand-mark">▥</span><span>BuildLab<small>Learn. Build. Solve.</small></span></Link><nav aria-label="Studio navigation">{items.map(item => <Link key={item.href} href={item.href} className={pathname === item.href || (item.href === "/studio" && pathname.startsWith("/studio")) || (item.href === "/schools/dashboard" && pathname.startsWith("/schools/")) ? "active" : ""}><span aria-hidden="true" className="studio-nav-icon">{item.icon}</span>{item.label}</Link>)}<Link href="/studio/new"><span aria-hidden="true" className="studio-nav-icon">＋</span>New project</Link></nav><div className="studio-sidebar-bottom"><span className="studio-avatar">{name ? name.charAt(0).toUpperCase() : "B"}</span><div><strong>{name || "BuildLab learner"}</strong><small>My workspace</small></div><button type="button" onClick={signOut} aria-label="Sign out" title="Sign out">↗</button></div></aside><div className="studio-content">{children}</div></div>;
}
