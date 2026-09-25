"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import type { Project, ProjectLevel } from "@/lib/sample-data";
import { projectFromCatalog, type CatalogProject } from "@/lib/catalog";
import { apiRequest, ApiError, type ApiProject } from "@/lib/api";

function Form() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateSlug = searchParams.get("template") || undefined;
  const professional = searchParams.get("audience") === "professional";
  const [template, setTemplate] = useState<Project | null>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<ProjectLevel>(professional ? "Professional" : "SHS");
  const [category, setCategory] = useState("");
  useEffect(() => {
    let active = true;
    apiRequest<{ categories: { name: string }[] }>("/api/catalog/categories").then(data => { if (active) { const names = data.categories.map(item => item.name); setFields(names); setCategory(previous => previous || names[0] || ""); } }).catch(() => {});
    if (templateSlug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(templateSlug)) apiRequest<{ project: CatalogProject }>(`/api/catalog/projects/${templateSlug}`).then(data => { if (active) { const item = projectFromCatalog(data.project); setTemplate(item); setTitle(previous => previous || item.title); setDescription(previous => previous || item.description); setLevel(professional ? "Professional" : item.level); setCategory(item.category); } }).catch(() => {});
    return () => { active = false; };
  }, [templateSlug, professional]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length < 4 || description.trim().length < 15) { setError("Add a project name and describe the problem in at least 15 characters."); return; }
    setBusy(true); setError("");
    try { const result = await apiRequest<{ project: ApiProject }>("/api/projects", { method: "POST", body: JSON.stringify({ project: { title: title.trim(), description: description.trim(), level, category, template_slug: template?.slug } }) }); router.push(`/studio/${result.project.id}`); }
    catch (err) { if (err instanceof ApiError && err.status === 401) router.push(`/login?next=${encodeURIComponent(`/studio/new${searchParams.toString() ? `?${searchParams.toString()}` : ""}`)}`); else setError(err instanceof Error ? err.message : "Could not save the project"); }
    finally { setBusy(false); }
  }
  return <main className="container create new-project-page"><Link className="back-link" href={"/studio"}>← {"My projects"}</Link><span className="eyebrow">{professional ? "PROFESSIONAL PROJECT" : "CREATE PROJECT"}</span><h1>Start something brilliant<span className="orange-dot">.</span></h1><p className="lead">Turn your idea into a real project. Plan, document and improve it as you build.</p><div className="create-stage-row" aria-label="Project stages"><div className="active"><span>1</span><strong>Idea</strong><small>Define your project</small></div><div><span>2</span><strong>Plan</strong><small>Set tasks and resources</small></div><div><span>3</span><strong>Build</strong><small>Track progress</small></div><div><span>4</span><strong>Share</strong><small>Reflect on your work</small></div></div><div className="create-grid"><form onSubmit={submit} className="panel form-panel"><h2>Project details</h2><label>Project name<input required maxLength={100} value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Low-cost flood warning system"/></label><div className="form-row"><label>Project level<select value={level} onChange={event => setLevel(event.target.value as ProjectLevel)}><option>JHS</option><option>SHS</option><option>University</option><option>Professional</option></select></label><label>Field<select required value={category} onChange={event => setCategory(event.target.value)}><option value="">Choose a field</option>{fields.map(item => <option key={item}>{item}</option>)}</select></label></div><label>Problem statement<textarea required maxLength={1500} rows={7} value={description} onChange={event => setDescription(event.target.value)} placeholder="What problem are you solving? Who does it affect? What would a useful solution look like?"/><small>{description.length}/1500 characters</small></label>{error && <p role="alert" className="form-error">{error}</p>}<div className="create-form-actions"><Link href={"/studio"} className="text-link">Back</Link><button className="button" type="submit" disabled={busy}>{busy ? "Creating…" : "Save project →"}</button></div></form><aside className="create-aside"><section className="panel"><div className="studio-panel-title"><h3>Project checklist</h3><span>{[title.trim().length >= 4, description.trim().length >= 15, !!level, !!category].filter(Boolean).length}/4 ready</span></div><ul className="create-checklist"><li className={title.trim().length >= 4 ? "done" : ""}>Name your project</li><li className={description.trim().length >= 15 ? "done" : ""}>Define the problem and goal</li><li className={level ? "done" : ""}>Choose your project level</li><li className={category ? "done" : ""}>Choose an engineering field</li></ul></section><section className="panel"><span className="eyebrow">WHAT COMES NEXT</span><h3>Build your plan.</h3><p>Once saved, your studio creates six milestones. Record your trials and mark each step as you make progress.</p><ol className="create-mini-steps"><li>Research and design</li><li>Build and test</li><li>Improve and present</li></ol></section>{template && <section className="panel"><span className="eyebrow">STARTING FROM A PROJECT</span><h3>{template.title}</h3><p>You can adapt this challenge to solve a problem in your community.</p></section>}</aside></div></main>;
}

export default function NewProjectPage() { return <Suspense fallback={<main className="container create">Loading project form…</main>}><Form/></Suspense>; }
