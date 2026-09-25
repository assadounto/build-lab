import { proxyApi } from "@/lib/proxy-api";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "Invalid post" }, { status: 400 });
  return proxyApi(request, `community_posts/${id}`, "GET");
}
