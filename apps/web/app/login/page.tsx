"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

function SignIn(){
  const router=useRouter();
  const next=useSearchParams().get("next") || "/studio";
  const destination=next.startsWith("/") && !next.startsWith("//") ? next : "/studio";
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");try{await apiRequest("/api/session",{method:"POST",body:JSON.stringify({email,password})});router.replace(destination);router.refresh()}catch(err){setError(err instanceof Error?err.message:"Could not sign in")}finally{setBusy(false)}}
  return <main className="container auth-page"><div className="auth-intro"><span className="eyebrow">WELCOME BACK</span><h1>Good ideas grow when you keep building<span className="orange-dot">.</span></h1><p>Sign in to pick up your project, record your progress and keep every milestone together.</p><Link className="text-link" href="/projects">Explore projects first →</Link></div><form className="panel auth-form" onSubmit={submit}><h2>Sign in to BuildLab</h2><p>Use your school or invited learner account.</p><label>Email address<input type="email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} required/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={event=>setPassword(event.target.value)} required/></label>{error&&<p className="form-error" role="alert">{error}</p>}<button type="submit" className="button" disabled={busy}>{busy?"Signing in…":"Sign in →"}</button><small>School account setup and self-service registration are coming later.</small></form></main>
}

export default function LoginPage(){return <Suspense fallback={<main className="container auth-page">Loading sign in…</main>}><SignIn/></Suspense>}
