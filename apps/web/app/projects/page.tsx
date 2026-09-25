"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ArrowUpRight, BookOpen, Compass, Search, SlidersHorizontal, Wrench } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import type { Project, Level } from "@/lib/sample-data";
import { apiRequest } from "@/lib/api";
import { projectFromCatalog, type CatalogProject } from "@/lib/catalog";
import "./catalogue.css";

type Pathway = Level | "All" | "Professionals";

const professionalPicks = new Set(["solar-rover", "air-quality", "solar-charger", "flood-warning", "crop-ai", "footbridge", "secure-chat", "health-monitor"]);
const pathways: { label: string; value: Pathway }[] = [
  { label: "All projects", value: "All" },
  { label: "JHS", value: "JHS" },
  { label: "SHS", value: "SHS" },
  { label: "University", value: "University" },
  { label: "Professional picks", value: "Professionals" },
];

export default function ProjectsPage() {
  return <Suspense fallback={<main className="explore-page"><section className="explore-hero"><div className="container explore-hero-layout"><h1>Explore projects</h1></div></section></main>}><ProjectsContent /></Suspense>;
}

function ProjectsContent() {
  const searchParams = useSearchParams();
  const [pathway, setPathway] = useState<Pathway>(() => {
    if (searchParams.get("audience") === "professionals") return "Professionals";
    const level = searchParams.get("level");
    return level === "JHS" || level === "SHS" || level === "University" ? level : "All";
  });
  const [category, setCategory] = useState("All projects");
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [format, setFormat] = useState("All formats");
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([apiRequest<{ projects: CatalogProject[] }>("/api/catalog/projects"), apiRequest<{ categories: { name: string }[] }>("/api/catalog/categories")])
      .then(([data, categoryData]) => { if (active) { setAllProjects(data.projects.map(projectFromCatalog)); setAllCategories(categoryData.categories.map(item => item.name)); } })
      .catch(() => { if (active) setCatalogError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const featured = allProjects.find(project => project.slug === "solar-rover") || allProjects[0];

  const filtered = useMemo(() => allProjects.filter(project => {
    const searchable = `${project.title} ${project.description} ${project.category}`;
    const matchesPathway = pathway === "All" || (pathway === "Professionals" ? project.level === "Professional" || professionalPicks.has(project.slug) : project.level === pathway);
    const matchesCategory = category === "All projects" || project.category === category;
    return matchesPathway && matchesCategory && (format === "All formats" || project.type === format) && searchable.toLowerCase().includes(query.trim().toLowerCase());
  }), [allProjects, pathway, category, format, query]);

  const clearFilters = () => { setPathway("All"); setCategory("All projects"); setQuery(""); setFormat("All formats"); };

  return <main className="explore-page">
    <section className="explore-hero"><div className="container explore-hero-layout"><div className="explore-hero-copy">
      <span className="explore-overline"><Compass size={17} aria-hidden="true"/> THE BUILDLAB PROJECT LIBRARY</span>
      <h1>Find something<br/><em>worth building.</em></h1>
      <p>Discover hands-on engineering and computer science projects shaped around real problems. Choose a challenge, learn the skills and make it your own.</p>
      <div className="explore-hero-audiences"><span>For students</span><span>For engineers</span><span>For technicians & makers</span></div>
    </div>{featured && <Link className="explore-featured" href={`/projects/${featured.slug}`} aria-label={`Explore featured project: ${featured.title}`}><div className="explore-featured-photo" style={{ backgroundImage: `url('${featured.image}')` }}/><span className="explore-featured-label">FEATURED BUILD / {featured.category.toUpperCase()}</span><span className="explore-featured-caption"><span><small>{featured.level} · {featured.duration} · {featured.type}</small><strong>{featured.title}</strong></span><ArrowUpRight size={20} aria-hidden="true"/></span></Link>}</div></section>

    <section className="container explore-content" aria-labelledby="explore-list-heading"><div className="explore-heading"><div><span className="eyebrow">MAKE SOMETHING REAL</span><h2 id="explore-list-heading">Explore the projects<span>.</span></h2><p>Find your starting point and follow the build wherever it takes you.</p></div><span className="explore-total">{allProjects.length} projects to discover</span></div>
      <div className="explore-controls"><form className="explore-search" role="search" onSubmit={event => event.preventDefault()}><Search size={19} aria-hidden="true"/><label className="sr-only" htmlFor="project-search">Search projects</label><input id="project-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search solar, robotics, software, AI..."/><button type="submit">Search</button></form><div className="explore-levels" role="group" aria-label="Learning pathway">{pathways.map(item => <button key={item.value} type="button" aria-pressed={pathway === item.value} onClick={() => setPathway(item.value)}>{item.label}</button>)}</div></div>
      <div className="explore-category-bar"><div className="explore-categories" role="group" aria-label="Project categories">{["All projects", ...allCategories].map(item => <button key={item} type="button" className={category === item ? "active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
      <div className="explore-results-head"><div aria-live="polite"><strong>{filtered.length} project{filtered.length === 1 ? "" : "s"}</strong><span>{pathway === "Professionals" ? "Practical builds for working professionals" : "Ready to explore"}</span></div><label className="explore-format"><SlidersHorizontal size={16} aria-hidden="true"/><span>Format</span><select value={format} onChange={event => setFormat(event.target.value)}><option>All formats</option><option>Digital</option><option>Physical</option><option>Hybrid</option></select></label></div>
      {loading ? <div className="explore-empty">Loading projects…</div> : catalogError ? <div className="explore-empty" role="alert"><h3>Projects are unavailable right now.</h3><p>Please try again shortly.</p></div> : filtered.length > 0 ? <div className="project-grid explore-grid">{filtered.map(project => <ProjectCard key={project.slug} project={project}/>)}</div> : <div className="explore-empty"><Search size={29} aria-hidden="true"/><h3>No projects found yet.</h3><p>Try another search term or clear the filters to see every build.</p><button type="button" className="button" onClick={clearFilters}>Clear filters <ArrowRight size={16}/></button></div>}
      <div className="explore-create-banner"><div className="explore-create-icon"><Wrench size={26}/></div><div><span className="eyebrow">YOUR IDEA BELONGS HERE</span><h2>Have a project of your own?</h2><p>Open your studio to plan the build, capture what you try and keep moving forward.</p></div><Link className="button" href="/studio/new">Start your project <ArrowUpRight size={17}/></Link></div>
      <div className="explore-learning-link"><BookOpen size={19} aria-hidden="true"/><span>Need the fundamentals first?</span><Link href="/courses">Explore course previews <ArrowRight size={16}/></Link></div>
    </section>
  </main>;
}
