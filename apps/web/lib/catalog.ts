import type { Project } from "@/lib/sample-data";
import type { Course } from "@/lib/courses";

export type CatalogCategory = { id: number; name: string; slug: string; parent_id: number | null };
export type CatalogProject = { id: number; slug: string; title: string; summary: string; description: string; level: Project["level"]; format: Project["type"]; duration: string; image_url: string | null; status: "draft" | "published"; category: CatalogCategory; created_at: string };
export type CatalogCourse = { id: number; slug: string; title: string; summary: string; description: string; level: string; hours: number; image_url: string | null; status: "draft" | "published"; category: CatalogCategory; lessons: { id: number; title: string; summary: string; position: number }[]; created_at: string };
export const projectFromCatalog = (p: CatalogProject): Project => ({ slug: p.slug, title: p.title, description: p.summary, category: p.category.name, level: p.level, duration: p.duration, type: p.format, image: p.image_url || "/images/explore-hero.webp", accent: "blue" });
export const courseFromCatalog = (c: CatalogCourse): Course => ({ slug: c.slug, title: c.title, description: c.summary, field: c.category.name, level: c.level, hours: c.hours, image: c.image_url || "/images/courses-hero.webp", lessons: c.lessons, projectSlug: "" });
