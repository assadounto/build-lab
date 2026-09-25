import { proxyApi } from "@/lib/proxy-api";
export const runtime = "nodejs";
export async function GET(request: Request) { return proxyApi(request, "schools", "GET"); }
