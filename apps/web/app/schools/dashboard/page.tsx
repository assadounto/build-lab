"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, ApiError } from "@/lib/api";

type School = { id:number; name:string; role:string };
type Member = { id:number; display_name:string; email:string; role:string };
type Classroom = { id:number; name:string; level:string; student_count:number; teacher:{id:number;display_name:string} };

export default function SchoolDashboard(){
  const [schools,setSchools]=useState<School[]>([]);
  const [selected,setSelected]=useState<number|null>(null);
  const [members,setMembers]=useState<Member[]>([]);
  const [classes,setClasses]=useState<Classroom[]>([]);
  const [loading,setLoading]=useState(true);
  const [auth,setAuth]=useState(true);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [code,setCode]=useState("");
  const [email,setEmail]=useState("");
  const [name,setName]=useState("");
  const [role,setRole]=useState<"student"|"teacher">("student");
  const [className,setClassName]=useState("");
  const [level,setLevel]=useState("SHS");
  const [teacher,setTeacher]=useState("");
  const school=schools.find(item=>item.id===selected);
  useEffect(()=>{apiRequest<{schools:School[]}>("/api/schools").then(result=>{setSchools(result.schools);setSelected(result.schools[0]?.id??null)}).catch(err=>{if(err instanceof ApiError&&err.status===401)setAuth(false);else setError(err instanceof Error?err.message:"Could not load schools")}).finally(()=>setLoading(false))},[]);
  useEffect(()=>{if(!selected||!schools.some(item=>item.id===selected&&["teacher","school_admin"].includes(item.role)))return;Promise.all([apiRequest<{classrooms:Classroom[]}>(`/api/schools/${selected}/classrooms`),apiRequest<{members:Member[]}>(`/api/schools/${selected}/members`)]).then(([rooms,people])=>{setClasses(rooms.classrooms);setMembers(people.members)}).catch(err=>setError(err instanceof Error?err.message:"Could not load school data"))},[selected,schools]);
  async function invite(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(!selected)return;setBusy(true);setError("");setCode("");try{const result=await apiRequest<{activation_code:string}>(`/api/schools/${selected}/invitations`,{method:"POST",body:JSON.stringify({invitation:{email,display_name:name,role}})});setCode(result.activation_code);setEmail("");setName("")}catch(err){setError(err instanceof Error?err.message:"Could not create invitation")}finally{setBusy(false)}}
  async function createClass(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(!selected)return;setBusy(true);setError("");try{const result=await apiRequest<{classroom:Classroom}>(`/api/schools/${selected}/classrooms`,{method:"POST",body:JSON.stringify({classroom:{name:className,level,teacher_id:Number(teacher)}})});setClasses([...classes,result.classroom]);setClassName("")}catch(err){setError(err instanceof Error?err.message:"Could not create class")}finally{setBusy(false)}}
  if(loading)return <main className="container school-dashboard">Loading school dashboard…</main>;
  if(!auth)return <main className="container school-dashboard"><h1>School workspace</h1><p>Sign in with a teacher or school administrator account.</p><Link className="button" href="/login?next=/schools/dashboard">Sign in →</Link></main>;
  return <main className="container school-dashboard"><span className="eyebrow">FOR EDUCATORS</span><h1>Your classroom is building<span className="orange-dot">.</span></h1><p className="lead">Give students practical challenges and follow their progress.</p>{error&&<p className="form-error" role="alert">{error}</p>}{schools.length===0?<div className="panel"><h2>No school linked to this account.</h2><p>Ask a school administrator for an invitation, or have a platform administrator set up your school.</p></div>:school?.role==="student"?<div className="panel"><h2>Your projects are in your studio.</h2><p>This dashboard is for teachers and school administrators.</p><Link className="button" href="/studio">Open your studio →</Link></div>:<><label className="school-picker">School <select value={selected??""} onChange={event=>{setSelected(Number(event.target.value));setClasses([]);setMembers([]);setCode("")}}>{schools.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select></label><div className="school-workspace-grid"><section className="panel"><span className="eyebrow">CLASSES</span><h2>Active classrooms</h2><div className="class-list">{classes.length?classes.map(room=><Link href={`/schools/classrooms/${room.id}`} key={room.id}><div><strong>{room.name}</strong><small>{room.level} · {room.student_count} students · {room.teacher.display_name}</small></div><span>Open →</span></Link>):<p className="quiet">No classes yet. A school administrator can create the first one.</p>}</div></section><aside className="school-sidebar">{school?.role==="school_admin"&&<><form className="panel school-form" onSubmit={createClass}><span className="eyebrow">SET UP A CLASS</span><h2>Create classroom</h2><label>Class name<input required maxLength={100} value={className} onChange={event=>setClassName(event.target.value)} placeholder="SHS 1 Science"/></label><label>Level<select value={level} onChange={event=>setLevel(event.target.value)}><option>JHS</option><option>SHS</option><option>University</option></select></label><label>Teacher<select required value={teacher} onChange={event=>setTeacher(event.target.value)}><option value="">Select a teacher</option>{members.filter(item=>item.role==="teacher").map(item=><option value={item.id} key={item.id}>{item.display_name}</option>)}</select></label><button className="button button-small" disabled={busy} type="submit">Create class →</button></form><form className="panel school-form" onSubmit={invite}><span className="eyebrow">INVITE A MEMBER</span><h2>Provision an account</h2><label>Full name<input required maxLength={100} value={name} onChange={event=>setName(event.target.value)}/></label><label>Email<input required type="email" value={email} onChange={event=>setEmail(event.target.value)}/></label><label>Role<select value={role} onChange={event=>setRole(event.target.value as "student"|"teacher")}><option value="student">Student</option><option value="teacher">Teacher</option></select></label><button className="button button-small" disabled={busy} type="submit">Create invitation →</button>{code&&<div className="invitation-code" role="status"><strong>Activation code — shown once</strong><code>{code}</code><p>Share the code privately. The recipient enters it at <Link href="/activate">/activate</Link> within 72 hours.</p></div>}</form></>}</aside></div></>}</main>
}
