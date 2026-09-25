import { cookies } from "next/headers";
import { callApi, sameOrigin, sessionCookie } from "@/lib/server-api";
export const runtime = "nodejs";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; commentId: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const { id, commentId } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(commentId)) return Response.json({ error: "Invalid ID" }, { status: 400 });
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return Response.json({ error: "Sign in required" }, { status: 401 });
  const upstream = await callApi(`community_posts/${id}/community_comments/${commentId}/approve`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
  return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
