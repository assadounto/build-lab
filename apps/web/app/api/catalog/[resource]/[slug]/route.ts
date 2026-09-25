import { callApi } from "@/lib/server-api";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ resource: string; slug: string }> }) {
  const { resource, slug } = await params;
  if (!["projects", "courses"].includes(resource) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return Response.json({ error: "Resource not found" }, { status: 404 });
  const upstream = await callApi(`catalog/${resource}/${slug}`);
  return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
