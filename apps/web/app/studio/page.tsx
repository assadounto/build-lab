"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, ApiError, type ApiProject } from "@/lib/api";
import { projects as catalogue } from "@/lib/sample-data";
import { readProjects, writeProjects, type StudentProject } from "@/lib/studio";

type User = { display_name: string };

export default function StudioPage() {
  const [items, setItems] = useState<ApiProject[]>([]);
  const [selected, setSelected] = useState<ApiProject | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [legacy, setLegacy] = useState<StudentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLegacy(readProjects());
    Promise.all([apiRequest<User>("/api/session"), apiRequest<{ projects: ApiProject[] }>("/api/projects")])
      .then(async ([account, listing]) => { setUser(account); setItems(listing.projects); if (listing.projects[0]) { const detail = await apiRequest<{ project: ApiProject }>(`/api/projects/${listing.projects[0].id}`); setSelected(detail.project); } })
      .catch(err => { if (err instanceof ApiError && err.status === 401) setNeedsLogin(true); else setError(err instanceof Error ? err.message : "Could not load your studio"); })
      .finally(() => setLoading(false));
  }, []);

  async function selectProject(id: number) {
    setError("");
    try { const result = await apiRequest<{ project: ApiProject }>(`/api/projects/${id}`); setSelected(result.project); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not open project"); }
  }

  async function importProjects() {
    setImporting(true); setError("");
    try {
      for (const old of legacy) {
        const created = await apiRequest<{ project: ApiProject }>("/api/projects", { method: "POST", body: JSON.stringify({ project: { title: old.title, description: old.description, level: old.level, category: old.category, template_slug: old.templateSlug } }) });
        const steps = created.project.milestones || [];
        for (let i = 0; i < old.steps.length; i++) if (old.steps[i].done && steps[i]) await apiRequest(`/api/projects/${created.project.id}/milestones/${steps[i].id}`, { method: "PATCH", body: JSON.stringify({ done: true }) });
        for (const note of [...old.notes].reverse()) await apiRequest(`/api/projects/${created.project.id}/log_entries`, { method: "POST", body: JSON.stringify({ body: note.body }) });
        const remaining = readProjects().filter(item => item.id !== old.id); writeProjects(remaining); setLegacy(remaining);
      }
      const listing = await apiRequest<{ projects: ApiProject[] }>("/api/projects"); setItems(listing.projects);
      if (listing.projects[0]) await selectProject(listing.projects[0].id);
    } catch (err) { setError("Import stopped. Check your projects before retrying. " + (err instanceof Error ? err.message : "")); }
    finally { setImporting(false); }
  }

  const template = catalogue.find(item => item.slug === selected?.template_slug);
  const steps = selected?.milestones || [];
  const completed = steps.filter(step => step.done).length;
  const percent = steps.length ? Math.round(completed / steps.length * 100) : 0;
  const next = steps.find(step => !step.done);
  const firstName = user?.display_name?.trim().split(/\s+/)[0] || "builder";

  return <main className="studio-dashboard"><div className="studio-dashboard-top"><div className="studio-greeting"><span className="greeting-sun" aria-hidden="true">☼</span><div><h1>Good morning, {firstName}.</h1><p>Keep building. Real problems, brighter futures.</p></div></div><Link className="button studio-create-button" href="/studio/new"><span aria-hidden="true">＋</span><span>Create a project</span></Link></div>
    {loading ? <div className="studio-dashboard-empty">Loading your workspace…</div> : needsLogin ? <div className="studio-dashboard-empty"><span className="eyebrow">YOUR SPACE TO INVENT</span><h2>Pick up where you left off.</h2><p>Sign in to see your projects, milestones and build notes.</p><Link className="button" href="/login?next=/studio">Sign in →</Link></div> : <>
      {error && <p className="form-error" role="alert">{error}</p>}
      {legacy.length > 0 && <div className="legacy-banner"><div><strong>Bring your earlier projects along.</strong><p>{legacy.length} project{legacy.length === 1 ? "" : "s"} saved on this browser can be added to your account.</p></div><button className="button button-small" disabled={importing} onClick={importProjects}>{importing ? "Importing…" : "Import projects"}</button></div>}
      <div className="studio-dashboard-grid"><div className="studio-dashboard-main">
        {selected ? <><div className="studio-feature"><div className="studio-feature-copy"><span className="studio-kicker">MY PROJECT</span><h2>{selected.title}</h2><p>{selected.description}</p><div className="studio-feature-progress"><strong>{percent}% <span>complete</span></strong><span>{completed} of {steps.length} milestones</span></div><div className="studio-feature-track"><span style={{ width: `${percent}%` }} /></div><div className="studio-next"><span className="studio-target">◎</span><div><small>{next ? "Next milestone" : "All milestones complete"}</small><strong>{next?.title || "Your build is ready to share"}</strong><p>{next ? "Continue your build and record what you learn." : "Take a moment to reflect on the result."}</p><Link className="button button-small" href={`/studio/${selected.id}`}>Continue building →</Link></div></div></div><div className={`studio-feature-image ${template ? "has-image" : ""}`} style={template ? { backgroundImage: `url('${template.image}')` } : undefined} role="img" aria-label={template ? template.title : "Project visual"}>{!template && <div className="studio-project-glyph">{selected.category.toLowerCase().includes("software") ? "⌘" : "✳"}</div>}</div></div>
          <nav className="studio-tabs" aria-label="Project sections"><a href="#pathway" className="active">Overview</a><a href="#pathway">Learning path</a><a href="#build-log">Build log</a><Link href={`/studio/${selected.id}`}>Open project ↗</Link></nav>
          <div className="studio-overview-cards"><section id="pathway" className="studio-panel"><div className="studio-panel-title"><h3>Learning path</h3><Link href={`/studio/${selected.id}`}>View all →</Link></div><div className="studio-timeline">{steps.map((step, index) => <div key={step.id} className={`studio-timeline-step ${step.done ? "done" : index === completed ? "current" : ""}`}><span className="timeline-badge">{step.done ? "✓" : index + 1}</span><div><strong>{step.title}</strong><p>{step.done ? "Completed" : index === completed ? "Ready when you are" : "Coming up"}</p></div></div>)}</div></section><div className="studio-overview-stack"><section id="build-log" className="studio-panel"><div className="studio-panel-title"><h3>Build log</h3><Link href={`/studio/${selected.id}`}>View all →</Link></div>{selected.log_entries?.length ? <div className="studio-log-list">{selected.log_entries.slice(0,2).map(entry => <article key={entry.id}><div className="studio-small-avatar">{firstName[0]?.toUpperCase()}</div><div><strong>{user?.display_name || "You"}</strong><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleDateString()}</time><p>{entry.body}</p></div></article>)}</div> : <div className="studio-log-empty"><span>✎</span><p>Your build story starts with the first note.</p><Link href={`/studio/${selected.id}`}>Add to your log →</Link></div>}</section><section className="studio-panel studio-project-info"><div className="studio-panel-title"><h3>Project brief</h3><Link href={template ? `/projects/${template.slug}` : `/studio/${selected.id}`}>View details →</Link></div><div><span>Field</span><strong>{selected.category}</strong></div><div><span>Level</span><strong>{selected.level}</strong></div><div><span>Format</span><strong>{template?.type || "Your own project"}</strong></div></section></div></div>
        </> : <div className="studio-start-card"><div><span className="studio-kicker">YOUR FIRST PROJECT</span><h2>What will you build first?</h2><p>Find a challenge in engineering or computer science, or start with an idea of your own.</p><div className="actions"><Link className="button" href="/projects">Explore projects →</Link><Link className="text-link" href="/studio/new">Start from your idea ↗</Link></div></div><div className="studio-start-image" role="img" aria-label="Student building a solar rover" /></div>}
      </div><aside className="studio-dashboard-rail"><section className="studio-panel"><div className="studio-panel-title"><h3>My projects</h3><Link href="/studio/new">＋ New</Link></div>{items.length ? <div className="studio-project-list">{items.slice(0,5).map(item => <button key={item.id} className={selected?.id === item.id ? "selected" : ""} type="button" onClick={() => selectProject(item.id)}><span className="studio-project-list-icon">✳</span><span><strong>{item.title}</strong><small>{item.category} · {item.level}</small></span><span className="studio-project-arrow">→</span></button>)}</div> : <p className="rail-muted">Your projects will appear here.</p>}</section><section className="studio-panel studio-rail-focus"><span className="eyebrow">KEEP MOMENTUM</span><h3>{next ? "One step at a time." : "Make your first move."}</h3><p>{next ? `Your next step is “${next.title}”. Keep notes as you test and improve.` : "Every great project starts with a problem worth solving."}</p><Link href={selected ? `/studio/${selected.id}` : "/projects"}> {selected ? "Open your workspace" : "Find a project"} →</Link></section><section className="studio-panel"><div className="studio-panel-title"><h3>At a glance</h3></div><div className="studio-rail-stat"><strong>{items.length}</strong><span>Projects started</span></div><div className="studio-rail-stat"><strong>{selected?.log_entries?.length || 0}</strong><span>Notes on this build</span></div><div className="studio-rail-stat"><strong>{completed}</strong><span>Milestones completed</span></div></section></aside></div>
    </>}
  </main>;
}
