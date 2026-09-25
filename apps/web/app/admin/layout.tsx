import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { callApi, sessionCookie } from "@/lib/server-api";
import "./admin.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) redirect("/login?next=/admin");
  const response = await callApi("me", { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 401) redirect("/login?next=/admin");
  if (!response.ok) return <main className="container admin-unavailable"><h1>Admin unavailable</h1><p>The platform server could not be reached. Try again shortly.</p></main>;
  const user = await response.json() as { role: string; display_name: string };
  if (user.role !== "platform_admin") return <main className="container admin-unavailable"><h1>Access restricted</h1><p>This workspace is for BuildLab platform administrators.</p><Link className="button" href="/">Go to BuildLab</Link></main>;
  return <div className="admin-shell"><aside className="admin-side"><Link className="admin-brand" href="/admin"><span>▥</span> BuildLab <small>ADMIN</small></Link><div className="admin-side-caption">WORKSPACE</div><a href="/admin#overview">Overview</a><a href="/admin#taxonomy">Categories</a><a href="/admin#projects">Projects</a><a href="/admin#courses">Courses</a><div className="admin-side-bottom"><span className="admin-avatar">{user.display_name.slice(0, 1).toUpperCase()}</span><div><strong>{user.display_name}</strong><small>Platform administrator</small></div></div></aside><div className="admin-main"><div className="admin-topline"><span>BUILDLAB / PLATFORM ADMIN</span><Link href="/">View site ↗</Link></div>{children}</div></div>;
}
