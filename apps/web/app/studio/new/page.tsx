"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { projects, type Level } from "@/lib/sample-data";
import { newProject, readProjects, writeProjects } from "@/lib/studio";

function Form(){
  const router=useRouter();
  const templateSlug=useSearchParams().get("template") || undefined;
  const template=projects.find(item=>item.slug===templateSlug);
  const [title,setTitle]=useState(template?.title || "");
  const [description,setDescription]=useState(template?.description || "");
  const [level,setLevel]=useState<Level>(template?.level || "SHS");
  const [category,setCategory]=useState(template?.category || "Software");
  const [error,setError]=useState("");
  function submit(event: React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(title.trim().length<4 || description.trim().length<15){setError("Add a project name and describe the problem in at least 15 characters.");return;}
    try{const project=newProject({title:title.trim(),description:description.trim(),level,category},template?.slug);writeProjects([project,...readProjects()]);router.push(`/studio/${project.id}`);}catch{setError("Could not save the project on this device. Check that browser storage is available.");}
  }
  return <main className="container create"><Link className="back-link" href="/studio">← Your studio</Link><span className="eyebrow">CREATE A PROJECT</span><h1>Start something brilliant<span className="orange-dot">.</span></h1><p className="lead">Turn an idea into a real project. You can refine the plan as you build.</p><div className="create-grid"><form onSubmit={submit} className="panel form-panel"><label>Project name<input required maxLength={100} value={title} onChange={event=>setTitle(event.target.value)} placeholder="e.g. Low-cost flood warning system"/></label><label>What problem will you solve?<textarea required maxLength={1500} rows={6} value={description} onChange={event=>setDescription(event.target.value)} placeholder="Explain the problem, who it affects, and what you want to make."/></label><div className="form-row"><label>Education level<select value={level} onChange={event=>setLevel(event.target.value as Level)}><option>JHS</option><option>SHS</option><option>University</option></select></label><label>Field<select value={category} onChange={event=>setCategory(event.target.value)}>{[...new Set(["Software","Computer Science","Electrical","Mechanical","Civil","Robotics","Renewable Energy","Biomedical","Data & AI","Agriculture",category])].map(item=><option key={item}>{item}</option>)}</select></label></div>{error&&<p role="alert" className="form-error">{error}</p>}<button className="button" type="submit">Create project →</button></form><aside className="panel create-aside"><span className="eyebrow">WHAT HAPPENS NEXT</span><h2>Your studio takes shape.</h2><p>We will create six practical milestones for you. Mark steps complete and write a build log as your idea develops.</p><div className="create-preview"><span>01 / Define</span><span>02 / Plan</span><span>03 / Design</span><span>04 / Build</span><span>05 / Test</span><span>06 / Present</span></div><p className="demo-note">This early version saves projects only in this browser. Avoid entering sensitive information.</p></aside></div></main>;
}

export default function NewProjectPage(){return <Suspense fallback={<main className="container create">Loading project form…</main>}><Form/></Suspense>}
