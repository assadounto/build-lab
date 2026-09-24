import { cookies } from "next/headers";
import { callApi, sameOrigin, sessionCookie } from "@/lib/server-api";

export const runtime = "nodejs";

async function proxy(method: "GET" | "POST", request: Request) {
  if (method !== "GET" && !sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return Response.json({ error: "Sign in required" }, { status: 401 });
  let body: string | undefined;
  if (method === "POST") {
    if (Number(request.headers.get("content-length") || "0") > 10_000) return Response.json({ error: "Request too large" }, { status: 413 });
    body = await request.text();
    if (body.length > 10_000) return Response.json({ error: "Request too large" }, { status: 413 });
  }
  const upstream = await callApi("projects", { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) }, body });
  return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

export async function GET(request: Request) { return proxy("GET", request); }
export async function POST(request: Request) { return proxy("POST", request); }
