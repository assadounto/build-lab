import "server-only";
import { cookies } from "next/headers";
import { callApi, sameOrigin, sessionCookie } from "./server-api";

export async function proxyApi(request: Request, path: string, method: "GET" | "POST"): Promise<Response> {
  if (method === "POST" && !sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return Response.json({ error: "Sign in required" }, { status: 401 });
  let body: string | undefined;
  if (method === "POST") {
    if (Number(request.headers.get("content-length") || 0) > 10000) return Response.json({ error: "Request too large" }, { status: 413 });
    body = await request.text();
    if (body.length > 10000) return Response.json({ error: "Request too large" }, { status: 413 });
  }
  const upstream = await callApi(path, { method, body, headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) } });
  return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
