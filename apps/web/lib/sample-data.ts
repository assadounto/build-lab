export type Level = "JHS" | "SHS" | "University";
export type ProjectLevel = Level | "Professional";

export type Project = {
  slug: string;
  title: string;
  category: string;
  level: ProjectLevel;
  duration: string;
  type: "Digital" | "Physical" | "Hybrid";
  description: string;
  image: string;
  accent: string;
};
