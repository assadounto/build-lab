import { proxyApi } from "@/lib/proxy-api";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "Not found" }, { status: 404 });
  return proxyApi(request, `classrooms/${id}`, "GET");
}
