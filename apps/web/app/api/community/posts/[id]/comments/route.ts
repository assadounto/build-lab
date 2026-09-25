import { proxyApi } from "@/lib/proxy-api";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
async function forward(request: Request, context: Context, method: "GET" | "POST") {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "Invalid post" }, { status: 400 });
  return proxyApi(request, `community_posts/${id}/community_comments`, method);
}
export async function GET(request: Request, context: Context) { return forward(request, context, "GET"); }
export async function POST(request: Request, context: Context) { return forward(request, context, "POST"); }
