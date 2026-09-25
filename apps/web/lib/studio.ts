export type StudentProject = {
  id: string;
  title: string;
  description: string;
  level: "JHS" | "SHS" | "University" | "Professional";
  category: string;
  templateSlug?: string;
  createdAt: string;
  steps: { id: string; title: string; done: boolean }[];
  notes: { id: string; body: string; createdAt: string }[];
};

export const storageKey = "buildlab.student-projects.v1";

export function readProjects(): StudentProject[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(value) ? value.filter(isProject) : [];
  } catch { return []; }
}

function isProject(value: unknown): value is StudentProject {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<StudentProject>;
  return typeof p.id === "string" && typeof p.title === "string" && Array.isArray(p.steps) && Array.isArray(p.notes);
}

export function writeProjects(value: StudentProject[]): void {
  localStorage.setItem(storageKey, JSON.stringify(value));
}

export function newProject(input: Pick<StudentProject, "title" | "description" | "level" | "category">, templateSlug?: string): StudentProject {
  const titles = templateSlug ? ["Understand the problem", "Research and plan", "Design your solution", "Build the first version", "Test and improve", "Present your project"] : ["Define the problem", "Research solutions", "Plan the design", "Build the prototype", "Test and improve", "Share what you learned"];
  return { ...input, id: crypto.randomUUID(), templateSlug, createdAt: new Date().toISOString(), steps: titles.map((title, index) => ({ id: String(index + 1), title, done: false })), notes: [] };
}
