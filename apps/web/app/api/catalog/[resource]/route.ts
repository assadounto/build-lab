import { callApi } from "@/lib/server-api";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!["categories", "projects", "courses"].includes(resource)) return Response.json({ error: "Resource not found" }, { status: 404 });
  const upstream = await callApi(`catalog/${resource}`);
  return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
