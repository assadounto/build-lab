"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest, ApiError } from "@/lib/api";

type Student = { id:number;display_name:string;email:string };
type Member = Student & {role:string};
type Classroom = {id:number;name:string;level:string;school_id:number;teacher:{display_name:string}};
type Assignment = {id:number;title:string;due_on:string|null;students:{student_id:number;name:string;project_id:number;completed:number;total:number}[]};

export default function ClassroomPage(){
  const {id}=useParams<{id:string}>();
  const router=useRouter();
  const [room,setRoom]=useState<Classroom|null>(null);
  const [students,setStudents]=useState<Student[]>([]);
  const [members,setMembers]=useState<Member[]>([]);
  const [assignments,setAssignments]=useState<Assignment[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [studentId,setStudentId]=useState("");
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [category,setCategory]=useState("Engineering");
  const [due,setDue]=useState("");
  useEffect(()=>{apiRequest<{classroom:Classroom;students:Student[]}>(`/api/classrooms/${id}`).then(async result=>{setRoom(result.classroom);setStudents(result.students);const [people,progress]=await Promise.all([apiRequest<{members:Member[]}>(`/api/schools/${result.classroom.school_id}/members`),apiRequest<{assignments:Assignment[]}>(`/api/classrooms/${id}/progress`)]);setMembers(people.members);setAssignments(progress.assignments)}).catch(err=>{if(err instanceof ApiError&&err.status===401)router.replace(`/login?next=/schools/classrooms/${id}`);else setError(err instanceof Error?err.message:"Could not open classroom")}).finally(()=>setLoading(false))},[id,router]);
  async function addStudent(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");try{await apiRequest(`/api/classrooms/${id}/enrollments`,{method:"POST",body:JSON.stringify({student_id:Number(studentId)})});const [details,progress]=await Promise.all([apiRequest<{students:Student[]}>(`/api/classrooms/${id}`),apiRequest<{assignments:Assignment[]}>(`/api/classrooms/${id}/progress`)]);setStudents(details.students);setAssignments(progress.assignments);setStudentId("")}catch(err){setError(err instanceof Error?err.message:"Could not add learner")}finally{setBusy(false)}}
  async function assign(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");try{await apiRequest(`/api/classrooms/${id}/assignments`,{method:"POST",body:JSON.stringify({assignment:{title,description,category,due_on:due||null}})});const result=await apiRequest<{assignments:Assignment[]}>(`/api/classrooms/${id}/progress`);setAssignments(result.assignments);setTitle("");setDescription("");setDue("")}catch(err){setError(err instanceof Error?err.message:"Could not assign project")}finally{setBusy(false)}}
  if(loading)return <main className="container school-dashboard">Loading classroom…</main>;
  if(!room)return <main className="container school-dashboard"><h1>Classroom unavailable.</h1><p>{error}</p><Link className="button" href="/schools/dashboard">Back to schools</Link></main>;
  const available=members.filter(item=>item.role==="student"&&!students.some(learner=>learner.id===item.id));
  return <main className="container school-dashboard"><Link className="back-link" href="/schools/dashboard">← School dashboard</Link><span className="eyebrow">{room.level} · {room.teacher.display_name}</span><h1>{room.name}<span className="orange-dot">.</span></h1><p className="lead">{students.length} learners · {assignments.length} assignments</p>{error&&<p className="form-error" role="alert">{error}</p>}<div className="school-workspace-grid"><div><section className="panel"><span className="eyebrow">PROJECT PROGRESS</span><h2>Class assignments</h2>{assignments.length?assignments.map(item=><article className="assignment-block" key={item.id}><h3>{item.title}</h3>{item.due_on&&<small>Due {item.due_on}</small>}<div className="progress-students">{item.students.map(student=><div key={student.student_id}><span>{student.name}</span><strong>{student.completed}/{student.total} milestones</strong></div>)}</div>{item.students.length===0&&<p className="quiet">Add learners to assign this project.</p>}</article>):<p className="quiet">Create a project assignment to start tracking practical work.</p>}</section><section className="panel"><span className="eyebrow">LEARNERS</span><h2>Class roster</h2>{students.map(item=><p key={item.id} className="roster-row"><strong>{item.display_name}</strong><span>{item.email}</span></p>)}{students.length===0&&<p className="quiet">No learners enrolled yet.</p>}</section></div><aside className="school-sidebar"><form className="panel school-form" onSubmit={addStudent}><span className="eyebrow">CLASS ROSTER</span><h2>Add learner</h2><label>School member<select required value={studentId} onChange={event=>setStudentId(event.target.value)}><option value="">Select learner</option>{available.map(item=><option value={item.id} key={item.id}>{item.display_name} ({item.email})</option>)}</select></label><button className="button button-small" type="submit" disabled={busy||available.length===0}>Add to class →</button></form><form className="panel school-form" onSubmit={assign}><span className="eyebrow">PRACTICAL WORK</span><h2>Assign a project</h2><label>Project title<input required minLength={4} maxLength={100} value={title} onChange={event=>setTitle(event.target.value)} placeholder="Build a water level alarm"/></label><label>What will students build?<textarea required minLength={15} maxLength={1500} rows={4} value={description} onChange={event=>setDescription(event.target.value)}/></label><label>Field<input required maxLength={80} value={category} onChange={event=>setCategory(event.target.value)}/></label><label>Due date (optional)<input type="date" value={due} onChange={event=>setDue(event.target.value)}/></label><button className="button button-small" type="submit" disabled={busy}>Assign to class →</button></form></aside></div></main>
}
