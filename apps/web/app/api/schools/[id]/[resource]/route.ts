import { proxyApi } from "@/lib/proxy-api";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string; resource: string }> };
async function forward(request: Request, context: Context, method: "GET" | "POST") {
  const { id, resource } = await context.params;
  if (!/^\d+$/.test(id) || !["classrooms", "invitations"].includes(resource) || (resource === "invitations" && method === "GET")) return Response.json({ error: "Not found" }, { status: 404 });
  return proxyApi(request, `schools/${id}/${resource}`, method);
}
export async function GET(request: Request, context: Context) { return forward(request, context, "GET"); }
export async function POST(request: Request, context: Context) { return forward(request, context, "POST"); }
