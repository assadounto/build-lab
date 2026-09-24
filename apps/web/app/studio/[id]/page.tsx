"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { readProjects, writeProjects, type StudentProject } from "@/lib/studio";

export default function Workspace(){
  const {id}=useParams<{id:string}>();
  const [project,setProject]=useState<StudentProject|null>(null);
  const [loaded,setLoaded]=useState(false);
  const [note,setNote]=useState("");
  const [error,setError]=useState("");
  useEffect(()=>{setProject(readProjects().find(item=>item.id===id)||null);setLoaded(true)},[id]);
  function update(change: StudentProject): boolean {
    try{writeProjects(readProjects().map(item=>item.id===change.id?change:item));setProject(change);setError("");return true}catch{setError("Could not save this change. Check browser storage and try again.");return false}
  }
  if(!loaded)return <main className="container workspace">Loading your project…</main>;
  if(!project)return <main className="container workspace"><h1>Project not found.</h1><p>This project may have been saved in another browser or its local data was cleared.</p><Link className="button" href="/studio">Back to studio</Link></main>;
  const completed=project.steps.filter(step=>step.done).length;
  return <main className="container workspace"><Link className="back-link" href="/studio">← Your studio</Link><div className="workspace-head"><div><span className="eyebrow">{project.category.toUpperCase()} · {project.level}</span><h1>{project.title}<span className="orange-dot">.</span></h1><p>{project.description}</p></div><div className="workspace-progress"><strong>{Math.round(completed/project.steps.length*100)}%</strong><span>Project progress</span></div></div><div className="progress-track"><span style={{width:`${completed/project.steps.length*100}%`}}/></div>{error&&<p role="alert" className="form-error">{error}</p>}<div className="workspace-grid"><section className="panel"><span className="eyebrow">PROJECT MILESTONES</span><h2>Make it real, one step at a time.</h2><div className="workspace-steps">{project.steps.map((step,index)=><label key={step.id} className={step.done?"checked":""}><input type="checkbox" checked={step.done} onChange={()=>update({...project,steps:project.steps.map(item=>item.id===step.id?{...item,done:!item.done}:item)})}/><span className="step-number">{String(index+1).padStart(2,"0")}</span><span>{step.title}</span></label>)}</div></section><section className="panel"><span className="eyebrow">BUILD LOG</span><h2>Capture what you learned.</h2><form onSubmit={event=>{event.preventDefault();if(note.trim().length<3)return;if(update({...project,notes:[{id:crypto.randomUUID(),body:note.trim(),createdAt:new Date().toISOString()},...project.notes]}))setNote("")}}><label className="sr-only" htmlFor="build-note">Project note</label><textarea id="build-note" rows={4} value={note} onChange={event=>setNote(event.target.value)} placeholder="What did you try? What worked? What will you change?" maxLength={2000}/><button className="button button-small" type="submit" disabled={note.trim().length<3}>Add a note →</button></form><div className="notes">{project.notes.length?project.notes.map(item=><article key={item.id}><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString()}</time><p>{item.body}</p></article>):<p className="quiet">Your notes will appear here as you build.</p>}</div></section></div><p className="demo-note">Saved on this device only. Team sharing, file uploads and mentor reviews are coming in the connected release.</p></main>
}
