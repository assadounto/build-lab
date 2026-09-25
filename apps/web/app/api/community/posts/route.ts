import { proxyApi } from "@/lib/proxy-api";
export const runtime = "nodejs";
export async function GET(request: Request) { return proxyApi(request, "community_posts", "GET"); }
export async function POST(request: Request) { return proxyApi(request, "community_posts", "POST"); }
