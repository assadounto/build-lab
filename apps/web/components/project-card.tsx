import type { Project } from "@/lib/sample-data";
import Link from "next/link";

export function ProjectCard({ project }: { project: Project }) {
  return <Link className="project-card" href={`/projects/${project.slug}`} aria-label={`View ${project.title}`}><div className="project-image" style={{backgroundImage: `url('${project.image}')`}}><span className="image-pill">{project.type} project</span></div><div className="project-body"><div className="project-tags"><span className={`tag ${project.accent}`}>{project.category}</span><span className="tag neutral">{project.level}</span></div><h3>{project.title}</h3><p>{project.description}</p><div className="project-meta"><span>◷ &nbsp;{project.duration}</span><span>View project ↗</span></div></div></Link>;
}
