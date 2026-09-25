"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Compass, LayoutGrid, LogOut, Plus, School, Users } from "lucide-react";
import { apiRequest } from "@/lib/api";

const items = [
  { label: "Studio", href: "/studio", icon: LayoutGrid },
  { label: "Explore projects", href: "/projects", icon: Compass },
  { label: "Community", href: "/community", icon: Users },
  { label: "For schools", href: "/schools/dashboard", icon: School },
];

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [name, setName] = useState("");
  useEffect(() => { apiRequest<{ display_name: string }>("/api/session").then(user => setName(user.display_name)).catch(() => undefined); }, []);
  async function signOut() { await apiRequest("/api/session", { method: "DELETE" }).catch(() => undefined); window.location.assign("/login"); }
  return <div className="studio-shell"><aside className="studio-sidebar"><Link className="studio-brand" href="/"><span className="studio-brand-mark">▥</span><span>BuildLab<small>Learn. Build. Solve.</small></span></Link><nav aria-label="Studio navigation">{items.map(item => <Link key={item.href} href={item.href} className={pathname === item.href || (item.href === "/studio" && /^\/studio\/(?:\d+|new)$/.test(pathname)) || (item.href === "/schools/dashboard" && pathname.startsWith("/schools/")) ? "active" : ""}><span aria-hidden="true" className="studio-nav-icon"><item.icon size={17}/></span>{item.label}</Link>)}<Link href="/studio/new"><span aria-hidden="true" className="studio-nav-icon"><Plus size={17}/></span>New project</Link></nav><div className="studio-sidebar-bottom"><span className="studio-avatar">{name ? name.charAt(0).toUpperCase() : "B"}</span><div><strong>{name || "BuildLab builder"}</strong><small>My workspace</small></div><button type="button" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={17}/></button></div></aside><div className="studio-content">{children}</div></div>;
}
