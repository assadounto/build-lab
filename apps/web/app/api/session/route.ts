import { cookies } from "next/headers";
import { callApi, sameOrigin, sessionCookie } from "@/lib/server-api";

export const runtime = "nodejs";

export async function GET() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return Response.json({ error: "Sign in required" }, { status: 401 });
  const upstream = await callApi("me", { headers: { Authorization: `Bearer ${token}` } });
  return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  let input: unknown;
  try { input = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!input || typeof input !== "object") return Response.json({ error: "Invalid sign-in details" }, { status: 400 });
  const { email, password } = input as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string" || email.length > 254 || password.length > 1024) return Response.json({ error: "Invalid sign-in details" }, { status: 400 });
  const upstream = await callApi("session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  const result = await upstream.json();
  if (!upstream.ok) return Response.json({ error: result.error || "Sign in failed" }, { status: upstream.status });
  (await cookies()).set(sessionCookie, result.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: new Date(result.expires_at) });
  return Response.json({ user: result.user }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (token) await callApi("session", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  jar.delete(sessionCookie);
  return new Response(null, { status: 204 });
}
