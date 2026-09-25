"use client";

import { useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

export default function Activate(){
  const [code,setCode]=useState("");const [password,setPassword]=useState("");const [error,setError]=useState("");const [complete,setComplete]=useState(false);const [busy,setBusy]=useState(false);
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");try{await apiRequest("/api/invitations/accept",{method:"POST",body:JSON.stringify({invitation:{code:code.trim(),password}})});setComplete(true);setPassword("");setCode("")}catch(err){setError(err instanceof Error?err.message:"Could not activate account")}finally{setBusy(false)}}
  return <main className="container auth-page"><div className="auth-intro"><span className="eyebrow">JOIN YOUR SCHOOL</span><h1>Build something meaningful together<span className="orange-dot">.</span></h1><p>Enter the private activation code given to you by your school administrator. Codes expire after 72 hours.</p></div>{complete?<div className="panel auth-form"><h2>Account ready.</h2><p>You can now sign in and start building.</p><Link className="button" href="/login">Sign in →</Link></div>:<form className="panel auth-form" onSubmit={submit}><h2>Activate your account</h2><label>Activation code<input required autoComplete="off" value={code} onChange={event=>setCode(event.target.value)} /></label><label>Create password (12+ characters)<input required minLength={12} type="password" autoComplete="new-password" value={password} onChange={event=>setPassword(event.target.value)}/></label>{error&&<p className="form-error" role="alert">{error}</p>}<button className="button" disabled={busy} type="submit">{busy?"Activating…":"Activate account →"}</button></form>}</main>
}
