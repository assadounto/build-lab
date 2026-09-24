import { cookies } from "next/headers";
import { callApi, sameOrigin, sessionCookie } from "@/lib/server-api";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return Response.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "Invalid project ID" }, { status: 400 });
  let input: unknown;
  try { input = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const body = input && typeof input === "object" ? (input as { body?: unknown }).body : null;
  if (typeof body !== "string" || body.trim().length < 3 || body.length > 2000) return Response.json({ error: "Note must be 3 to 2000 characters" }, { status: 422 });
  const upstream = await callApi(`projects/${id}/log_entries`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ log_entry: { body } }) });
  return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
