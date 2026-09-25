import { notFound } from "next/navigation";
import { CatalogCourseDetail } from "@/components/catalog-detail";
import type { CatalogCourse } from "@/lib/catalog";
import { callApi } from "@/lib/server-api";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const response = await callApi(`catalog/courses/${encodeURIComponent(slug)}`);
  if (!response.ok) notFound();
  const data = await response.json() as { course: CatalogCourse };
  return <CatalogCourseDetail course={data.course}/>;
}
