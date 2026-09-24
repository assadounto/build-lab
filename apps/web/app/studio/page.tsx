"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readProjects, type StudentProject } from "@/lib/studio";

export default function StudioPage(){
  const [items,setItems]=useState<StudentProject[]>([]);
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{setItems(readProjects());setLoaded(true)},[]);
  return <main className="container studio"><div className="studio-title"><div><span className="eyebrow">YOUR PROJECT STUDIO</span><h1>Your ideas live here<span className="orange-dot">.</span></h1><p>Plan your work, track each milestone and keep a record of what you learn.</p></div><Link className="button" href="/studio/new">+ Create a project</Link></div>{loaded&&items.length>0?<><div className="studio-projects">{items.map(item=>{const done=item.steps.filter(step=>step.done).length;return <Link className="studio-project-card" href={`/studio/${item.id}`} key={item.id}><span className="eyebrow">{item.category.toUpperCase()} · {item.level}</span><h2>{item.title}</h2><p>{item.description}</p><div className="progress-label"><strong>{done} of {item.steps.length} milestones</strong><strong>{Math.round(done/item.steps.length*100)}%</strong></div><div className="progress-track"><span style={{width:`${done/item.steps.length*100}%`}}/></div><strong className="card-action">Open workspace →</strong></Link>})}</div><div className="studio-more"><Link className="text-link" href="/projects">Discover another challenge ↗</Link></div></>:loaded?<div className="studio-empty"><div className="empty-icon">✳</div><span className="eyebrow">A SPACE FOR EVERY IDEA</span><h2>What will you build first?</h2><p>Start with one of our challenges or create your own project in software, engineering, design or science.</p><div className="actions"><Link className="button" href="/projects">Explore projects →</Link><Link className="text-link" href="/studio/new">Start from your idea ↗</Link></div></div>:<div className="studio-empty">Loading your studio…</div>}<p className="demo-note">Projects are stored only in this browser during the initial release. They will not appear on another device.</p></main>
}
