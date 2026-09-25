"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, BriefcaseBusiness, CheckCircle2, ClipboardList, Plus, Wrench } from "lucide-react";
import { apiRequest, ApiError, type ApiProject } from "@/lib/api";
import type { CatalogProject } from "@/lib/catalog";
import { readProjects, writeProjects, type StudentProject } from "@/lib/studio";

type Account = { display_name: string };

export function StudioDashboard() {
  const rootHref = "/studio";
  const newHref = "/studio/new";
  const browseHref = "/projects";
  const detailHref = (id: number) => `${rootHref}/${id}`;
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [featured, setFeatured] = useState<ApiProject | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [filter, setFilter] = useState<"all" | "professional">("all");
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState("");
  const [legacy, setLegacy] = useState<StudentProject[]>([]);
  const [importing, setImporting] = useState(false);
  const [catalogue, setCatalogue] = useState<CatalogProject[]>([]);

  useEffect(() => {
    setLegacy(readProjects());
    apiRequest<{ projects: CatalogProject[] }>("/api/catalog/projects").then(data => setCatalogue(data.projects)).catch(() => {});
    Promise.all([apiRequest<Account>("/api/session"), apiRequest<{ projects: ApiProject[] }>("/api/projects")])
      .then(async ([user, listing]) => {
        setAccount(user);
        const ordered = listing.projects;
        setProjects(ordered);
        const highlight = ordered[0];
        if (highlight) {
          try { const result = await apiRequest<{ project: ApiProject }>(`/api/projects/${highlight.id}`); setFeatured(result.project); }
          catch (err) { setError(err instanceof Error ? err.message : "Could not load project progress"); }
        }
      })
      .catch(err => { if (err instanceof ApiError && err.status === 401) setNeedsLogin(true); else setError(err instanceof Error ? err.message : "Could not load your workspace"); })
      .finally(() => setLoading(false));
  }, []);

  async function importProjects() {
    setImporting(true); setError("");
    try {
      for (const old of legacy) {
        const created = await apiRequest<{ project: ApiProject }>("/api/projects", { method: "POST", body: JSON.stringify({ project: { title: old.title, description: old.description, level: old.level, category: old.category, template_slug: old.templateSlug } }) });
        const steps = created.project.milestones || [];
        for (let i = 0; i < old.steps.length; i++) if (old.steps[i].done && steps[i]) await apiRequest(`/api/projects/${created.project.id}/milestones/${steps[i].id}`, { method: "PATCH", body: JSON.stringify({ done: true }) });
        for (const note of [...old.notes].reverse()) await apiRequest(`/api/projects/${created.project.id}/log_entries`, { method: "POST", body: JSON.stringify({ body: note.body }) });
        const remaining = readProjects().filter(item => item.id !== old.id);
        writeProjects(remaining); setLegacy(remaining);
      }
      const listing = await apiRequest<{ projects: ApiProject[] }>("/api/projects");
      setProjects(listing.projects);
      const highlight = listing.projects[0];
      if (highlight) {
        const result = await apiRequest<{ project: ApiProject }>(`/api/projects/${highlight.id}`);
        setFeatured(result.project);
      }
    } catch (err) { setError("Import stopped. Check your projects before retrying. " + (err instanceof Error ? err.message : "")); }
    finally { setImporting(false); }
  }

  const visible = filter === "professional" ? projects.filter(project => project.level === "Professional") : projects;
  const completed = featured?.milestones?.filter(step => step.done).length ?? 0;
  const total = featured?.milestones?.length ?? 0;
  const percent = total ? Math.round(completed / total * 100) : 0;
  const next = featured?.milestones?.find(step => !step.done);
  const image = catalogue.find(project => project.slug === featured?.template_slug)?.image_url;
  const fields = new Set(projects.map(project => project.category)).size;

  return <main className="pro-studio"><div className="pro-studio-top"><div><span className="pro-overline"><BriefcaseBusiness size={17}/> YOUR PROJECT STUDIO</span><h1>Every great build starts here<span>.</span></h1><p>Your space to plan projects, track milestones and document everything you learn along the way.</p></div><Link className="button" href={newHref}><Plus size={17}/> Create a project</Link></div>
    {loading ? <div className="pro-status" role="status">Loading your studio…</div> : needsLogin ? <div className="pro-status"><BriefcaseBusiness size={32}/><h2>Your workspace is waiting.</h2><p>Sign in to open your projects, progress and build notes.</p><Link className="button" href={`/login?next=${encodeURIComponent(rootHref)}`}>Sign in <ArrowRight size={16}/></Link></div> : <>
      {error && <p className="form-error" role="alert">{error}</p>}
      {legacy.length > 0 && <div className="pro-import"><div><strong>Bring your earlier projects into the studio.</strong><p>{legacy.length} project{legacy.length === 1 ? "" : "s"} saved on this browser can be added to your account.</p></div><button className="button" type="button" disabled={importing} onClick={importProjects}>{importing ? "Importing…" : "Import projects"}</button></div>}
      <div className="pro-welcome"><div><span>WELCOME BACK{account?.display_name ? `, ${account.display_name.trim().split(/\s+/)[0].toUpperCase()}` : ""}</span><strong>Your ideas deserve a place to become real.</strong></div><Link href={browseHref}>Explore projects <ArrowUpRight size={17}/></Link></div>
      <div className="pro-stats"><article><span className="pro-stat-icon"><BriefcaseBusiness size={21}/></span><div><strong>{projects.length}</strong><span>Total projects</span></div></article><article><span className="pro-stat-icon"><Wrench size={21}/></span><div><strong>{projects.filter(project => project.level === "Professional").length}</strong><span>Professional builds</span></div></article><article><span className="pro-stat-icon"><ClipboardList size={21}/></span><div><strong>{fields}</strong><span>Fields explored</span></div></article></div>
      {featured ? <div className="pro-focus"><div className="pro-focus-copy"><span className="pro-kicker">CONTINUE YOUR BUILD / {featured.category.toUpperCase()}</span><h2>{featured.title}</h2><p>{featured.description}</p><div className="pro-progress-label"><strong>{percent}% complete</strong><span>{completed} of {total} milestones</span></div><div className="pro-progress" role="progressbar" aria-label="Featured project progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }}/></div><div className="pro-next"><CheckCircle2 size={19}/><div><small>{next ? "UP NEXT" : "MILESTONES COMPLETE"}</small><strong>{next?.title || "Review and document the result"}</strong></div></div><Link className="button" href={detailHref(featured.id)}>Open workspace <ArrowRight size={17}/></Link></div><div className="pro-focus-visual" style={image ? { backgroundImage: `linear-gradient(0deg,#19192269,transparent 60%),url('${image}')` } : undefined}><span>{featured.level} · {featured.category}</span></div></div> : <div className="pro-first"><div><span className="pro-kicker">YOUR WORK STARTS HERE</span><h2>What problem will you solve next?</h2><p>Start a project of your own or explore a build brief and make it yours.</p><div><Link className="button" href={newHref}>Start a project <ArrowRight size={17}/></Link><Link href={browseHref}>Explore project ideas <ArrowUpRight size={17}/></Link></div></div><div className="pro-first-art" aria-hidden="true">✳</div></div>}
      <div className="pro-studio-columns"><section className="pro-projects" aria-labelledby="pro-projects-heading"><div className="pro-section-head"><div><span className="pro-kicker">YOUR PORTFOLIO</span><h2 id="pro-projects-heading">Projects in motion</h2></div><div className="pro-toggle" role="group" aria-label="Filter your projects"><button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All</button><button type="button" aria-pressed={filter === "professional"} onClick={() => setFilter("professional")}>Professional</button></div></div>{visible.length ? <div className="pro-project-grid">{visible.map(project => <Link href={detailHref(project.id)} className="pro-project-card" key={project.id}><span className="pro-project-category">{project.category}<ArrowUpRight size={17}/></span><strong>{project.title}</strong><p>{project.description}</p><span className="pro-project-footer"><span>{project.level} project</span><span>Open workspace <ArrowRight size={14}/></span></span></Link>)}</div> : <div className="pro-list-empty"><h3>Your portfolio starts here.</h3><p>Create a project or explore a build brief to get started.</p><Link href={newHref}>Create a project <ArrowRight size={16}/></Link></div>}</section><aside className="pro-side"><section className="pro-side-panel"><span className="pro-kicker">BUILD NOTES</span><h3>Latest from this project</h3>{featured?.log_entries?.length ? <div className="pro-note-list">{featured.log_entries.slice(0,3).map(entry => <article key={entry.id}><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleDateString()}</time><p>{entry.body}</p></article>)}</div> : <p>No notes yet. Record a test, decision or lesson inside your workspace.</p>}{featured && <Link href={`${detailHref(featured.id)}#project-log`}>Open build log <ArrowRight size={15}/></Link>}</section><section className="pro-side-panel pro-side-learning"><BookOpen size={25}/><h3>Learning powers the work.</h3><p>Explore course previews in electronics, energy, robotics and design.</p><Link href="/courses">Explore course previews <ArrowRight size={15}/></Link></section></aside></div>
    </>}
  </main>;
}
