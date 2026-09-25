import "server-only";

export const sessionCookie = "buildlab_session";

export function apiUrl(path: string): string {
  const base = process.env.RAILS_API_URL || "http://localhost:3001";
  return new URL(`/api/v1/${path}`, base).toString();
}

export async function callApi(path: string, init: RequestInit = {}): Promise<Response> {
  try { return await fetch(apiUrl(path), { ...init, cache: "no-store" }); }
  catch { return Response.json({ error: "The project server is unavailable. Try again shortly." }, { status: 503 }); }
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  return !!origin && origin === new URL(request.url).origin && site !== "cross-site";
}
