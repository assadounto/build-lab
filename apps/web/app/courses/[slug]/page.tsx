import Link from "next/link";
import { notFound } from "next/navigation";
import { courses } from "@/lib/courses";

export function generateStaticParams() { return courses.map(course => ({ slug: course.slug })); }

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courses.find(item => item.slug === slug);
  if (!course) notFound();
  return <main className="container course-detail"><Link className="back-link" href="/courses">← All courses</Link><div className="course-detail-hero"><div><span className="eyebrow">{course.field.toUpperCase()} · {course.level.toUpperCase()}</span><h1>{course.title}<span className="orange-dot">.</span></h1><p>{course.description}</p><div className="detail-facts"><span>{course.lessons.length} introductory topics</span><span>Free preview</span></div><a className="button" href="#lessons">Explore the topics ↓</a></div><div role="img" aria-label={course.title} style={{ backgroundImage: `url('${course.image}')` }}/></div><section id="lessons" className="course-lessons"><div><span className="eyebrow">YOUR LEARNING PATH</span><h2>Learn it, then make it.</h2><p>Preview the course topics, then apply the ideas to a real project. Full guided lessons are coming next.</p><Link className="text-link" href={`/projects/${course.projectSlug}`}>See the related project →</Link></div><ol>{course.lessons.map((lesson, index) => <li key={lesson.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{lesson.title}</h3><p>{lesson.summary}</p></div></li>)}</ol></section></main>;
}
