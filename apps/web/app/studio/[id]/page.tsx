"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest, ApiError, type ApiProject } from "@/lib/api";

export default function Workspace(){
  const {id}=useParams<{id:string}>();
  const router=useRouter();
  const [project,setProject]=useState<ApiProject|null>(null);
  const [loaded,setLoaded]=useState(false);
  const [note,setNote]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  useEffect(()=>{apiRequest<{project:ApiProject}>(`/api/projects/${id}`).then(result=>setProject(result.project)).catch(err=>{if(err instanceof ApiError&&err.status===401)router.replace(`/login?next=/studio/${id}`);else setError(err instanceof Error?err.message:"Could not load project")}).finally(()=>setLoaded(true))},[id,router]);
  async function toggle(step:{id:number;done:boolean}){
    if(!project)return;
    setBusy(true);setError("");
    try{const result=await apiRequest<{milestone:{id:number;done:boolean}}>(`/api/projects/${id}/milestones/${step.id}`,{method:"PATCH",body:JSON.stringify({done:!step.done})});setProject({...project,milestones:project.milestones?.map(item=>item.id===step.id?{...item,done:result.milestone.done}:item)})}catch(err){setError(err instanceof Error?err.message:"Could not update milestone")}finally{setBusy(false)}
  }
  async function addNote(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(!project||note.trim().length<3)return;
    setBusy(true);setError("");
    try{const result=await apiRequest<{log_entry:{id:number;body:string;created_at:string}}>(`/api/projects/${id}/log_entries`,{method:"POST",body:JSON.stringify({body:note.trim()})});setProject({...project,log_entries:[result.log_entry,...(project.log_entries||[])]});setNote("")}catch(err){setError(err instanceof Error?err.message:"Could not save note")}finally{setBusy(false)}
  }
  if(!loaded)return <main className="container workspace">Loading your project…</main>;
  if(!project)return <main className="container workspace"><h1>Project unavailable.</h1><p>{error||"This project could not be found in your account."}</p><Link className="button" href="/studio">Back to studio</Link></main>;
  const steps=project.milestones||[];
  const completed=steps.filter(step=>step.done).length;
  const percent=steps.length?Math.round(completed/steps.length*100):0;
  return <main className="container workspace"><Link className="back-link" href="/studio">← Your studio</Link><div className="workspace-head"><div><span className="eyebrow">{project.category.toUpperCase()} · {project.level}</span><h1>{project.title}<span className="orange-dot">.</span></h1><p>{project.description}</p></div><div className="workspace-progress"><strong>{percent}%</strong><span>Project progress</span></div></div><div className="progress-track"><span style={{width:`${percent}%`}}/></div>{error&&<p role="alert" className="form-error">{error}</p>}<div className="workspace-grid"><section className="panel"><span className="eyebrow">PROJECT MILESTONES</span><h2>Make it real, one step at a time.</h2><div className="workspace-steps">{steps.map((step,index)=><label key={step.id} className={step.done?"checked":""}><input type="checkbox" disabled={busy} checked={step.done} onChange={()=>toggle(step)}/><span className="step-number">{String(index+1).padStart(2,"0")}</span><span>{step.title}</span></label>)}</div></section><section className="panel"><span className="eyebrow">BUILD LOG</span><h2>Capture what you learned.</h2><form onSubmit={addNote}><label className="sr-only" htmlFor="build-note">Project note</label><textarea id="build-note" rows={4} value={note} onChange={event=>setNote(event.target.value)} placeholder="What did you try? What worked? What will you change?" maxLength={2000}/><button className="button button-small" type="submit" disabled={busy||note.trim().length<3}>{busy?"Saving…":"Add a note →"}</button></form><div className="notes">{project.log_entries?.length?project.log_entries.map(item=><article key={item.id}><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString()}</time><p>{item.body}</p></article>):<p className="quiet">Your notes will appear here as you build.</p>}</div></section></div><p className="demo-note">Team sharing, file uploads and mentor reviews are coming in a future milestone.</p></main>
}
