"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { courses } from "@/lib/courses";
import type { Course } from "@/lib/courses";
import { apiRequest } from "@/lib/api";
import { courseFromCatalog, type CatalogCourse } from "@/lib/catalog";

const filters = ["All courses", "Electronics", "Energy", "Programming", "Design (CAD)", "Robotics"];

export default function CoursesPage() {
  const [filter, setFilter] = useState("All courses");
  const [query, setQuery] = useState("");
  const [adminCourses, setAdminCourses] = useState<Course[]>([]);
  useEffect(() => { let active = true; apiRequest<{ courses: CatalogCourse[] }>("/api/catalog/courses").then(data => { if (active) setAdminCourses(data.courses.map(courseFromCatalog)); }).catch(() => {}); return () => { active = false; }; }, []);
  const allCourses = useMemo(() => [...adminCourses, ...courses.filter(item => !adminCourses.some(admin => admin.slug === item.slug))], [adminCourses]);
  const filtered = useMemo(() => allCourses.filter(course => (filter === "All courses" || course.field === filter || (filter === "Programming" && course.title.toLowerCase().includes("arduino"))) && `${course.title} ${course.description} ${course.field}`.toLowerCase().includes(query.toLowerCase())), [allCourses, filter, query]);
  return <main className="courses-page"><section className="courses-hero"><div className="container courses-hero-inner"><span className="eyebrow">COURSES</span><h1>Learn the skills.<br />Build the thing.</h1><p>Preview practical course topics built around real projects.</p><form onSubmit={event => event.preventDefault()} className="explore-search"><label className="sr-only" htmlFor="course-search">Search courses</label><span aria-hidden="true">⌕</span><input id="course-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search courses (e.g. Arduino, solar, CAD...)"/><button type="submit">Search</button></form></div></section><div className="container courses-content"><div className="explore-categories course-filters" role="group" aria-label="Course categories">{Array.from(new Set([...filters, ...adminCourses.map(item => item.field)])).map(item => <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="course-grid">{filtered.map(course => <article className="course-card" key={course.slug}><Link href={`/courses/${course.slug}`} className="course-card-image" style={{ backgroundImage: `url('${course.image}')` }} aria-label={`View ${course.title}`}><span>Course preview</span></Link><div className="course-card-body"><span className="eyebrow">{course.field.toUpperCase()}</span><h2>{course.title}</h2><p>{course.description}</p><div className="course-card-meta"><span>{course.level}</span><span>{course.lessons.length} topics</span></div><div className="course-card-footer"><strong>Free preview</strong><Link className="button button-small" href={`/courses/${course.slug}`}>Explore topics →</Link></div></div></article>)}</div>{filtered.length === 0 && <div className="empty-state">No courses match your search. Try another topic.</div>}<section className="guided-pathway"><div><span className="eyebrow">GUIDED PATHWAY</span><h2>From skills to a real build.</h2><p>Explore a foundation, try it in your workspace, then document what you built.</p><Link className="button" href="/projects">Explore projects →</Link></div><ol><li>Explore a foundation</li><li>Choose a project</li><li>Build and iterate</li><li>Share your progress</li></ol></section></div></main>;
}
