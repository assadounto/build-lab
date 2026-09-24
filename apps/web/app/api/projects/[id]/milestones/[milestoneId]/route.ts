import { cookies } from "next/headers";
import { callApi, sameOrigin, sessionCookie } from "@/lib/server-api";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; milestoneId: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return Response.json({ error: "Sign in required" }, { status: 401 });
  const { id, milestoneId } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(milestoneId)) return Response.json({ error: "Invalid ID" }, { status: 400 });
  let input: unknown;
  try { input = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!input || typeof input !== "object" || typeof (input as Record<string, unknown>).done !== "boolean") return Response.json({ error: "done must be a boolean" }, { status: 422 });
  const upstream = await callApi(`projects/${id}/milestones/${milestoneId}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ done: (input as { done: boolean }).done }) });
  return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
