"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
import { categories, projects, type Level } from "@/lib/sample-data";

const icons: Record<string, string> = { "All projects": "▦", Energy: "☼", Robotics: "⚙", Agriculture: "❧", Electronics: "▣", Software: "⌘", "Computer Science": "⌘", Mechanical: "⚙", Civil: "△", Biomedical: "♡", "Data & AI": "▥" };

export default function ProjectsPage() {
  return <Suspense fallback={<main className="explore-page"><section className="explore-hero"><div className="container explore-hero-inner"><h1>Explore projects</h1></div></section></main>}><ProjectsContent /></Suspense>;
}

function ProjectsContent() {
  const searchParams = useSearchParams();
  const [level, setLevel] = useState<Level | "All">("All");
  const [category, setCategory] = useState("All projects");
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [format, setFormat] = useState("All formats");
  const filtered = useMemo(() => projects.filter(project => {
    const matchesCategory = category === "All projects" || (category === "Energy" ? /solar|energy/i.test(`${project.title} ${project.category}`) : category === "Electronics" ? /electric|electronic|circuit|sensor/i.test(`${project.title} ${project.category} ${project.description}`) : project.category.includes(category));
    return (level === "All" || project.level === level) && matchesCategory && (format === "All formats" || project.type === format) && `${project.title} ${project.description} ${project.category}`.toLowerCase().includes(query.trim().toLowerCase());
  }), [level, category, format, query]);
  return <main className="explore-page"><section className="explore-hero"><div className="container explore-hero-inner"><span className="eyebrow">EXPLORE PROJECTS</span><h1>Find a project<br />worth building.</h1><p>Real projects. Practical skills. A brighter Africa.</p><div className="explore-levels" role="group" aria-label="Education level">{(["JHS", "SHS", "University"] as const).map(item => <button key={item} type="button" aria-pressed={level === item} onClick={() => setLevel(level === item ? "All" : item)}>{item}<small>{item === "JHS" ? "Ages 11–15" : item === "SHS" ? "Ages 15–18" : "Tertiary & beyond"}</small></button>)}</div><form onSubmit={event => event.preventDefault()} className="explore-search"><label className="sr-only" htmlFor="project-search">Search projects</label><span aria-hidden="true">⌕</span><input id="project-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search projects (e.g. solar, water, robot, IoT...)"/><button type="submit">Search</button></form></div></section><div className="container explore-content"><div className="explore-categories" role="group" aria-label="Project categories">{categories.map(item => <button key={item} type="button" className={category === item ? "active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}><span aria-hidden="true">{icons[item]}</span>{item}</button>)}</div><div className="explore-results-head"><span>{filtered.length} project{filtered.length === 1 ? "" : "s"} to explore</span><label>Format <select value={format} onChange={event => setFormat(event.target.value)}><option>All formats</option><option>Digital</option><option>Physical</option><option>Hybrid</option></select></label></div><div className="explore-results"><div className="project-grid explore-grid">{filtered.map(project => <ProjectCard key={project.slug} project={project}/>)}</div>{category === "All projects" && !query && format === "All formats" && <aside className="explore-challenge"><span className="eyebrow">FEATURED CHALLENGE</span><h2>Design for your community.</h2><p>Use your skills to solve a real problem in your school or neighborhood. Clean energy, clean water, better cities — real impact starts here.</p><Link className="button" href="/studio/new">Start your idea →</Link><div className="challenge-shape" aria-hidden="true">✳</div></aside>}</div>{filtered.length === 0 && <div className="empty-state">No projects match those filters. Try a different level, category or search.</div>}</div></main>;
}
