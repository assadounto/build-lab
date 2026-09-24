"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, ApiError, type ApiProject } from "@/lib/api";
import { readProjects, writeProjects, type StudentProject } from "@/lib/studio";

export default function StudioPage(){
  const [items,setItems]=useState<ApiProject[]>([]);
  const [legacy,setLegacy]=useState<StudentProject[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [needsLogin,setNeedsLogin]=useState(false);
  const [importing,setImporting]=useState(false);
  async function signOut(){await apiRequest("/api/session",{method:"DELETE"}).catch(()=>undefined);window.location.assign("/login")}
  useEffect(()=>{setLegacy(readProjects());apiRequest<{projects:ApiProject[]}>("/api/projects").then(result=>setItems(result.projects)).catch(err=>{if(err instanceof ApiError&&err.status===401)setNeedsLogin(true);else setError(err instanceof Error?err.message:"Could not load projects")}).finally(()=>setLoading(false))},[]);
  async function importProjects(){
    setImporting(true);setError("");
    try{
      for(const old of legacy){
        const created=await apiRequest<{project:ApiProject}>("/api/projects",{method:"POST",body:JSON.stringify({project:{title:old.title,description:old.description,level:old.level,category:old.category,template_slug:old.templateSlug}})});
        const steps=created.project.milestones||[];
        for(let i=0;i<old.steps.length;i++)if(old.steps[i].done&&steps[i])await apiRequest(`/api/projects/${created.project.id}/milestones/${steps[i].id}`,{method:"PATCH",body:JSON.stringify({done:true})});
        for(const note of [...old.notes].reverse())await apiRequest(`/api/projects/${created.project.id}/log_entries`,{method:"POST",body:JSON.stringify({body:note.body})});
        const remaining=readProjects().filter(item=>item.id!==old.id);writeProjects(remaining);setLegacy(remaining);
      }
      const result=await apiRequest<{projects:ApiProject[]}>("/api/projects");setItems(result.projects);
    }catch(err){setError("Import stopped. Projects already copied may appear below; please check them before trying again. "+(err instanceof Error?err.message:""))}
    finally{setImporting(false)}
  }
  return <main className="container studio"><div className="studio-title"><div><span className="eyebrow">YOUR PROJECT STUDIO</span><h1>Your ideas live here<span className="orange-dot">.</span></h1><p>Plan your work, track each milestone and keep a record of what you learn.</p></div>{!needsLogin&&<div className="actions"><Link className="button" href="/studio/new">+ Create a project</Link><button className="text-button" type="button" onClick={signOut}>Sign out</button></div>}</div>{loading?<div className="studio-empty">Loading your studio…</div>:needsLogin?<div className="studio-empty"><div className="empty-icon">✳</div><h2>Sign in to your studio.</h2><p>Your projects are saved to your account so you can return to them on another device.</p><Link className="button" href="/login?next=/studio">Sign in →</Link></div>:<>{error&&<p className="form-error" role="alert">{error}</p>}{legacy.length>0&&<div className="legacy-banner"><div><strong>Projects saved in this browser</strong><p>Import {legacy.length} earlier project{legacy.length===1?"":"s"} into your account. Your browser copy will stay until the import finishes.</p></div><button className="button button-small" disabled={importing} onClick={importProjects}>{importing?"Importing…":"Import projects"}</button></div>}{items.length>0?<><div className="studio-projects">{items.map(item=><Link className="studio-project-card" href={`/studio/${item.id}`} key={item.id}><span className="eyebrow">{item.category.toUpperCase()} · {item.level}</span><h2>{item.title}</h2><p>{item.description}</p><strong className="card-action">Open workspace →</strong></Link>)}</div><div className="studio-more"><Link className="text-link" href="/projects">Discover another challenge ↗</Link></div></>:!error&&<div className="studio-empty"><div className="empty-icon">✳</div><span className="eyebrow">A SPACE FOR EVERY IDEA</span><h2>What will you build first?</h2><p>Start with one of our challenges or create your own project in software, engineering, design or science.</p><div className="actions"><Link className="button" href="/projects">Explore projects →</Link><Link className="text-link" href="/studio/new">Start from your idea ↗</Link></div></div>}</>}</main>
}
