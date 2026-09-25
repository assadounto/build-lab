import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check, ChevronRight, Clock3, Compass, Layers3, Lightbulb, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { projectBriefs } from "@/lib/project-briefs";
import { projects } from "@/lib/sample-data";
import { CatalogProjectDetail } from "@/components/catalog-detail";
import type { CatalogProject } from "@/lib/catalog";
import { callApi } from "@/lib/server-api";
import "./project-detail.css";

export function generateStaticParams() { return projects.map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (project) return { title: `${project.title} | BuildLab Projects`, description: project.description };
  const response = await callApi(`catalog/projects/${encodeURIComponent(slug)}`);
  if (!response.ok) return {};
  const data = await response.json() as { project: CatalogProject };
  return { title: `${data.project.title} | BuildLab Projects`, description: data.project.summary };
}

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (!project) {
    const response = await callApi(`catalog/projects/${encodeURIComponent(slug)}`);
    if (!response.ok) notFound();
    const data = await response.json() as { project: CatalogProject };
    return <CatalogProjectDetail project={data.project}/>;
  }
  const brief = projectBriefs[slug];
  const related = projects.filter(item => item.slug !== slug && (item.category === project.category || item.level === project.level)).slice(0, 3);
  const startHref = `/studio/new?template=${encodeURIComponent(slug)}`;
  return <main className="project-detail-page">
    <div className="container project-breadcrumb"><Link href="/projects">Explore projects</Link><ChevronRight size={14}/><span>{project.category}</span><ChevronRight size={14}/><span aria-current="page">{project.title}</span></div>
    <section className="container project-detail-hero" aria-labelledby="project-heading"><div className="project-detail-copy">
      <div className="project-label"><Sparkles size={15}/> THE BUILD BRIEF <span>/ {String(projects.findIndex(item => item.slug === slug) + 1).padStart(2, "0")}</span></div>
      <div className="project-detail-tags"><span>{project.category}</span><span>{project.level}</span><span>{project.type} build</span></div>
      <h1 id="project-heading">{project.title}<span className="orange-dot">.</span></h1><p className="project-detail-intro">{project.description}</p>
      <div className="project-detail-actions"><Link className="button" href={startHref}>Start this project <ArrowRight size={17}/></Link><a href="#overview">Explore the brief <ArrowRight size={15}/></a></div>
      <div className="project-detail-hero-note"><span>✳</span> Build something useful. Document how you got there.</div>
    </div><div className="project-hero-visual"><div className="project-hero-photo" role="img" aria-label={`Visual inspiration for ${project.title}`} style={{ backgroundImage: `url('${project.image}')` }}/><div className="project-visual-caption"><span><Compass size={20}/></span><div><strong>Made for curious minds</strong><small>From idea to working prototype</small></div><b aria-hidden="true">✦</b></div></div></section>
    <div className="project-facts-wrap"><div className="container project-facts" aria-label="Project at a glance">{[
      { icon: Clock3, label: "ESTIMATED TIME", value: project.duration }, { icon: Layers3, label: "LEARNING LEVEL", value: project.level },
      { icon: Wrench, label: "PROJECT FORMAT", value: project.type }, { icon: Lightbulb, label: "FIELD OF STUDY", value: project.category },
    ].map(({ icon: Icon, label, value }) => <div key={label}><span className="fact-icon"><Icon size={19}/></span><span><small>{label}</small><strong>{value}</strong></span></div>)}</div></div>
    <nav className="project-section-nav" aria-label="On this page"><div className="container"><a href="#overview">Overview</a><a href="#approach">The approach</a><a href="#roadmap">Build roadmap</a><a href="#resources">What you need</a><a href="#outcome">The outcome</a></div></nav>
    <div className="container project-detail-body"><div className="project-content">
      <section id="overview" className="project-detail-section"><span className="project-section-kicker">01 / THE CHALLENGE</span><h2>Start with a real problem<span className="orange-dot">.</span></h2><p className="project-challenge">“{brief.challenge}”</p><p>{brief.concept}</p><div className="project-outcome-card"><span><Compass size={22}/></span><div><small>YOUR MISSION</small><strong>{brief.outcome}</strong></div></div></section>
      <section id="approach" className="project-detail-section"><span className="project-section-kicker">02 / WHAT YOU WILL LEARN</span><h2>Skills you&apos;ll put to work.</h2><p>Bring ideas from the classroom into a real design, then use evidence from your tests to improve it.</p><div className="project-skill-grid">{brief.skills.map((skill, i) => <div key={skill}><span>0{i + 1}</span><strong>{skill}</strong><ArrowUpRight size={17}/></div>)}</div></section>
      <section id="roadmap" className="project-detail-section"><span className="project-section-kicker">03 / THE BUILD ROADMAP</span><h2>From first thought to final test.</h2><p>A clear path to follow, with something tangible to show at every stage. Adapt the pace to your team and resources.</p><div className="project-roadmap">{brief.phases.map((phase, i) => <article key={phase.title} className="project-phase"><div className="phase-rail"><span>{String(i + 1).padStart(2, "0")}</span></div><div><small>PHASE {String(i + 1).padStart(2, "0")}</small><h3>{phase.title}</h3><p>{phase.detail}</p><div className="phase-evidence"><Check size={14}/> Show your work: {phase.evidence}</div></div></article>)}</div></section>
      <section id="resources" className="project-detail-section"><span className="project-section-kicker">04 / THE TOOLKIT</span><h2>What you&apos;ll need.</h2><p>Use locally available alternatives where practical. Your project plan can be adjusted to the equipment you have.</p><ul className="project-materials">{brief.materials.map(item => <li key={item}><span><Check size={14}/></span>{item}</li>)}</ul>{brief.note && <div className="project-safety"><ShieldCheck size={22}/><div><strong>Build responsibly</strong><p>{brief.note}</p></div></div>}</section>
      <section id="outcome" className="project-detail-section"><span className="project-section-kicker">05 / HOW TO KNOW IT WORKS</span><h2>Make your results count.</h2><p>A finished project tells the story of what you tested and what you learned, including what still needs work.</p><div className="project-criteria">{brief.criteria.map((item, i) => <div key={item}><span>{String(i + 1).padStart(2, "0")}</span><strong>{item}</strong></div>)}</div><div className="project-stretch"><span><Sparkles size={19}/> GO FURTHER</span><p>{brief.stretch}</p></div></section>
    </div><aside className="project-detail-aside"><div className="project-brief-card"><span className="eyebrow">YOUR NEXT BUILD STARTS HERE</span><h3>Ready to make it real?</h3><p>Create a personal version in your studio. Plan the milestones, record your experiments and follow your progress.</p><Link className="button" href={startHref}>Start this project <ArrowRight size={16}/></Link><small>Free to explore. A student account is needed to save progress.</small></div><div className="project-aside-quote"><span>“</span><p>The best way to understand an idea is to build it, test it and make it better.</p><strong>THE BUILDLAB WAY</strong></div></aside></div>
    <section className="project-final-cta"><div className="container"><div><span className="eyebrow">BUILD SOMETHING THAT MATTERS</span><h2>Your idea is the starting point.</h2><p>Make this project your own. Start small, learn from the results and keep building.</p></div><Link className="button button-light" href={startHref}>Open your studio <ArrowRight size={17}/></Link></div></section>
    {related.length > 0 && <section className="container project-related"><div className="project-related-heading"><div><span className="eyebrow">KEEP EXPLORING</span><h2>More ideas worth building.</h2></div><Link href="/projects" className="text-link">View all projects <ArrowRight size={15}/></Link></div><div className="project-related-grid">{related.map(item => <ProjectCard key={item.slug} project={item}/>)}</div></section>}
  </main>;
}
