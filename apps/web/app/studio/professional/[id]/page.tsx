"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ClipboardList, Clock3, FileText, Plus } from "lucide-react";
import { apiRequest, ApiError, type ApiProject } from "@/lib/api";
import { projects as catalogue } from "@/lib/sample-data";

export default function ProfessionalProjectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ApiProject | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busyStep, setBusyStep] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest<{ project: ApiProject }>(`/api/projects/${id}`)
      .then(result => setProject(result.project))
      .catch(err => { if (err instanceof ApiError && err.status === 401) router.replace(`/login?next=/studio/professional/${id}`); else setError(err instanceof Error ? err.message : "Could not load this project"); })
      .finally(() => setLoaded(true));
  }, [id, router]);

  async function toggleMilestone(step: { id: number; done: boolean }) {
    if (!project) return;
    setBusyStep(step.id); setError("");
    try {
      const result = await apiRequest<{ milestone: { done: boolean } }>(`/api/projects/${id}/milestones/${step.id}`, { method: "PATCH", body: JSON.stringify({ done: !step.done }) });
      setProject(current => current ? { ...current, milestones: current.milestones?.map(item => item.id === step.id ? { ...item, done: result.milestone.done } : item) } : current);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not update this milestone"); }
    finally { setBusyStep(null); }
  }

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!project || note.trim().length < 3) return;
    setSaving(true); setError("");
    try {
      const result = await apiRequest<{ log_entry: { id: number; body: string; created_at: string } }>(`/api/projects/${id}/log_entries`, { method: "POST", body: JSON.stringify({ body: note.trim() }) });
      setProject(current => current ? { ...current, log_entries: [result.log_entry, ...(current.log_entries || [])] } : current);
      setNote("");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save your note"); }
    finally { setSaving(false); }
  }

  if (!loaded) return <main className="pro-workspace"><div className="pro-status" role="status">Loading your project workspace…</div></main>;
  if (!project) return <main className="pro-workspace"><div className="pro-status"><h1>Project unavailable.</h1><p>{error || "This project is not available in your account."}</p><Link className="button" href="/studio/professional">Back to professional studio</Link></div></main>;

  const steps = project.milestones || [];
  const completed = steps.filter(step => step.done).length;
  const percent = steps.length ? Math.round(completed / steps.length * 100) : 0;
  const template = catalogue.find(item => item.slug === project.template_slug);

  return <main className="pro-workspace"><div className="pro-workspace-breadcrumb"><Link href="/studio/professional"><ArrowLeft size={16}/> Professional studio</Link><span>/</span><span>{project.title}</span></div>
    <header className="pro-workspace-hero"><div className="pro-workspace-intro"><span className="pro-overline"><ClipboardList size={17}/> PROJECT WORKSPACE / {project.category.toUpperCase()}</span><h1>{project.title}<span>.</span></h1><p>{project.description}</p><div className="pro-workspace-facts"><span>{project.level}</span><span>{project.category}</span><span>Started {new Date(project.created_at).toLocaleDateString()}</span></div><div className="pro-workspace-hero-actions"><a href="#milestones" className="button">Continue the build <ArrowRight size={16}/></a><a href="#project-log">Record a note <Plus size={16}/></a></div></div><div className="pro-workspace-visual" style={template ? { backgroundImage: `linear-gradient(0deg,#1d1b24a8,transparent 60%),url('${template.image}')` } : undefined}><span>IDEA → PROTOTYPE → RESULT</span><div><strong>{percent}%</strong><span>Project progress</span></div></div></header>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="pro-workspace-summary"><div><span className="pro-summary-icon"><Check size={18}/></span><span><strong>{completed} / {steps.length}</strong><small>Milestones completed</small></span></div><div><span className="pro-summary-icon"><FileText size={18}/></span><span><strong>{project.log_entries?.length || 0}</strong><small>Build notes</small></span></div><div><span className="pro-summary-icon"><Clock3 size={18}/></span><span><strong>{steps.find(step => !step.done)?.title || "Review your result"}</strong><small>Next step</small></span></div></div>
    <div className="pro-workspace-grid"><section id="milestones" className="pro-workspace-panel"><div className="pro-workspace-panel-head"><div><span className="pro-kicker">BUILD ROADMAP</span><h2>Move the work forward.</h2><p>Mark each milestone as you complete it. You can reopen a step whenever you need to revise the build.</p></div><strong>{percent}%</strong></div><div className="pro-progress" role="progressbar" aria-label="Project progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }}/></div><div className="pro-milestones">{steps.map((step, index) => <label key={step.id} className={step.done ? "done" : ""}><input type="checkbox" checked={step.done} disabled={busyStep !== null} onChange={() => toggleMilestone(step)}/><span className="pro-milestone-number">{step.done ? <Check size={17}/> : String(index + 1).padStart(2, "0")}</span><span><strong>{step.title}</strong><small>{step.done ? "Completed" : "Ready to work on"}</small></span></label>)}</div></section>
      <aside className="pro-workspace-aside"><section className="pro-workspace-panel"><span className="pro-kicker">THE PROJECT BRIEF</span><h2>What you&apos;re solving.</h2><p>{project.description}</p><dl><div><dt>Field</dt><dd>{project.category}</dd></div><div><dt>Level</dt><dd>{project.level}</dd></div><div><dt>Started</dt><dd>{new Date(project.created_at).toLocaleDateString()}</dd></div></dl>{template && <Link href={`/projects/${template.slug}`}>Read the original build brief <ArrowUpRight size={16}/></Link>}</section><section className="pro-workspace-panel pro-workspace-prompt"><span className="pro-kicker">WORKING NOTE</span><h3>Document the decisions.</h3><p>Record the tests, changes and lessons that explain how your solution took shape.</p><a href="#project-log">Add to the build log <ArrowRight size={15}/></a></section></aside></div>
    <section id="project-log" className="pro-workspace-panel pro-log"><div className="pro-workspace-panel-head"><div><span className="pro-kicker">BUILD LOG</span><h2>Keep the story of the work.</h2><p>Log what you tried, what happened and what you plan to improve.</p></div><FileText size={25} aria-hidden="true"/></div><form onSubmit={addNote}><label htmlFor="pro-build-note">New build note</label><textarea id="pro-build-note" value={note} onChange={event => setNote(event.target.value)} rows={4} maxLength={2000} placeholder="What did you test? What worked? What will you change next?"/><div><small>{note.length}/2000 characters</small><button className="button" type="submit" disabled={saving || note.trim().length < 3}>{saving ? "Saving…" : "Save note"} <ArrowRight size={16}/></button></div></form><div className="pro-log-entries">{project.log_entries?.length ? project.log_entries.map(entry => <article key={entry.id}><span className="pro-log-dot"/><div><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleDateString()}</time><p>{entry.body}</p></div></article>) : <p className="pro-log-empty">No notes yet. Your first test or design decision is a good place to start.</p>}</div></section>
  </main>;
}
