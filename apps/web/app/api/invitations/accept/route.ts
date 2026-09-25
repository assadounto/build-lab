import { callApi, sameOrigin } from "@/lib/server-api";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 5000) return Response.json({ error: "Request too large" }, { status: 413 });
  const body = await request.text();
  if (body.length > 5000) return Response.json({ error: "Request too large" }, { status: 413 });
  const upstream = await callApi("invitations/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body });
  return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
