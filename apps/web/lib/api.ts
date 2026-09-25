export type ApiProject = {
  id: number;
  title: string;
  description: string;
  level: "JHS" | "SHS" | "University" | "Professional";
  category: string;
  template_slug: string | null;
  created_at: string;
  milestones?: { id: number; title: string; position: number; done: boolean }[];
  log_entries?: { id: number; body: string; created_at: string }[];
};

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { ...init, cache: "no-store", headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers } });
  } catch { throw new ApiError("Could not connect. Check your connection and try again.", 0); }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.error || "Something went wrong. Try again.", response.status);
  return data as T;
}
