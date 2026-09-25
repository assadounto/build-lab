import { cookies } from "next/headers";
import { callApi, sessionCookie } from "@/lib/server-api";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return Response.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "Invalid project ID" }, { status: 400 });
  const upstream = await callApi(`projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
