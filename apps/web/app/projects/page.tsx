"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/project-card";
import { categories, projects, type Level } from "@/lib/sample-data";

export default function ProjectsPage() {
  const [level,setLevel]=useState<Level|"All">("All");
  const [category,setCategory]=useState("All projects");
  const [query,setQuery]=useState("");
  const filtered=useMemo(()=>projects.filter(p=>(level==="All"||p.level===level)&&(category==="All projects"||p.category.includes(category))&&`${p.title} ${p.description} ${p.category}`.toLowerCase().includes(query.toLowerCase())),[level,category,query]);
  return <main className="container listing"><div className="listing-top"><div><span className="eyebrow">EXPLORE PROJECTS</span><h1>Explore what you can build<span className="orange-dot">.</span></h1><p>From your first line of code to systems that power communities.</p></div><div className="segmented" aria-label="Education level">{(["All","JHS","SHS","University"] as const).map(item=><button key={item} type="button" aria-pressed={level===item} onClick={()=>setLevel(item)}>{item}</button>)}</div></div><div className="category-row" aria-label="Project categories">{categories.map(item=><button className={category===item?"active":""} aria-pressed={category===item} type="button" key={item} onClick={()=>setCategory(item)}>{item}</button>)}</div><label className="search-label"><span className="sr-only">Search projects</span><input type="search" placeholder="Search projects, skills or topics..." value={query} onChange={event=>setQuery(event.target.value)}/></label><div className="results-head"><strong>{filtered.length} projects</strong><span>Find something worth making.</span></div><div className="project-grid listing-grid">{filtered.map(project=><ProjectCard key={project.slug} project={project}/>)}</div>{filtered.length===0&&<div className="empty-state">No projects match those filters. Try another category or search.</div>}<section id="courses" className="course-note"><span className="eyebrow">COURSES COMING NEXT</span><h2>Learn the skills. Build the thing.</h2><p>Guided lessons and mentor-led pathways will connect directly to these projects.</p></section></main>;
}
