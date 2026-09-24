import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/sample-data";

export function generateStaticParams() { return projects.map(project => ({ slug: project.slug })); }

export default async function ProjectDetail({params}: {params: Promise<{slug:string}>}) {
  const {slug}=await params;
  const project=projects.find(item=>item.slug===slug);
  if(!project) notFound();
  return <main className="container detail"><Link className="back-link" href="/projects">← All projects</Link><div className="detail-grid"><div><span className="eyebrow">{project.category.toUpperCase()} · {project.level.toUpperCase()}</span><h1>{project.title}<span className="orange-dot">.</span></h1><p className="lead">{project.description}</p><div className="detail-facts"><span>{project.type} project</span><span>{project.duration}</span><span>{project.level} pathway</span></div><Link className="button" href={`/studio/new?template=${project.slug}`}>Start this project →</Link></div><div className="detail-image" style={{backgroundImage:`url('${project.image}')`}} role="img" aria-label={project.title}/></div><div className="detail-lower"><section className="panel"><span className="eyebrow">THE PATHWAY</span><h2>Learn it. Build it. Share it.</h2><ol className="detail-steps"><li>Understand the problem</li><li>Research and plan</li><li>Design your solution</li><li>Build the first version</li><li>Test and improve</li><li>Present your project</li></ol></section><section className="panel"><span className="eyebrow">YOUR OWN VERSION</span><h2>Make the project yours.</h2><p>Start with this challenge, then adapt the materials, features and outcome to a problem you care about. Your notes and progress live in your studio.</p><p className="demo-note">Project lessons, materials and mentor support will be added as the catalogue grows.</p></section></div></main>;
}
