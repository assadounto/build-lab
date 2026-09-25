import { cookies } from "next/headers";
import { callApi, sameOrigin, sessionCookie } from "@/lib/server-api";
export const runtime = "nodejs";
export async function PATCH(request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  if (!["categories", "projects", "courses"].includes(resource) || !/^\d+$/.test(id)) return Response.json({ error: "Resource not found" }, { status: 404 });
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return Response.json({ error: "Sign in required" }, { status: 401 });
  if (Number(request.headers.get("content-length") || 0) > 30000) return Response.json({ error: "Request too large" }, { status: 413 });
  const body = await request.text();
  if (body.length > 30000) return Response.json({ error: "Request too large" }, { status: 413 });
  const upstream = await callApi(`admin/${resource}/${id}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body });
  return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
