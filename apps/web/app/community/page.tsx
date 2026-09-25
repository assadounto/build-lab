"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, ApiError } from "@/lib/api";

type Post = { id: number; title: string; body: string; status: string; school_id: number; school: string; author: string; created_at: string };
type Comment = { id: number; body: string; author: string; created_at: string };
type School = { id: number; name: string; role: string };

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pending, setPending] = useState<Post[]>([]);
  const [review, setReview] = useState<Post[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selected, setSelected] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const load = useCallback(async () => {
    const [feed, membership] = await Promise.all([apiRequest<{ posts: Post[]; mine_pending: Post[]; review_queue: Post[] }>("/api/community/posts"), apiRequest<{ schools: School[] }>("/api/schools")]);
    setPosts(feed.posts); setPending(feed.mine_pending); setReview(feed.review_queue); setSchools(membership.schools); setSchoolId(current => current || String(membership.schools[0]?.id || ""));
  }, []);
  useEffect(() => { load().catch(err => { if (err instanceof ApiError && err.status === 401) setNeedsLogin(true); else setError(err instanceof Error ? err.message : "Could not load discussions"); }).finally(() => setLoading(false)); }, [load]);
  async function openPost(post: Post) {
    setError("");
    try { const result = await apiRequest<{ post: Post; comments: Comment[] }>(`/api/community/posts/${post.id}`); setSelected(result.post); setComments(result.comments); if (schools.some(item => item.id === post.school_id && item.role !== "student")) { const queue = await apiRequest<{ comments: Comment[] }>(`/api/community/posts/${post.id}/comments`); setPendingComments(queue.comments); } else setPendingComments([]); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not open discussion"); }
  }
  async function createPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try { const result = await apiRequest<{ post: Post }>("/api/community/posts", { method: "POST", body: JSON.stringify({ post: { school_id: Number(schoolId), title: title.trim(), body: body.trim() } }) }); setTitle(""); setBody(""); setNotice(result.post.status === "pending" ? "Your post is awaiting teacher review." : "Your discussion is live in your school community."); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not create discussion"); }
    finally { setBusy(false); }
  }
  async function sendReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return; setBusy(true); setError(""); setNotice("");
    try { const result = await apiRequest<{ comment: { status: string } }>(`/api/community/posts/${selected.id}/comments`, { method: "POST", body: JSON.stringify({ comment: { body: reply.trim() } }) }); setReply(""); setNotice(result.comment.status === "pending" ? "Your reply is awaiting teacher review." : "Reply posted."); await openPost(selected); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not reply"); }
    finally { setBusy(false); }
  }
  async function approve(post: Post) { setBusy(true); try { await apiRequest(`/api/community/posts/${post.id}/approve`, { method: "PATCH" }); await load(); setNotice("Post approved."); } catch (err) { setError(err instanceof Error ? err.message : "Could not approve post"); } finally { setBusy(false); } }
  async function approveComment(comment: Comment) { if (!selected) return; setBusy(true); try { await apiRequest(`/api/community/posts/${selected.id}/comments/${comment.id}/approve`, { method: "PATCH" }); await openPost(selected); setNotice("Reply approved."); } catch (err) { setError(err instanceof Error ? err.message : "Could not approve reply"); } finally { setBusy(false); } }
  return <main className="community-page"><div className="community-title"><div><span className="eyebrow">COMMUNITY</span><h1>Build better, together.</h1><p>Share ideas, ask questions and learn with people in your school.</p></div><Link className="button" href="/studio/new">Start a project →</Link></div><nav className="studio-tabs" aria-label="Community sections"><a href="#discover" className="active">Discover</a><a href="#discussions">Discussions</a><a href="#your-school">Your schools</a></nav>{error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="community-notice" role="status">{notice}</p>}{loading ? <div className="studio-dashboard-empty">Loading your community…</div> : needsLogin ? <div className="studio-dashboard-empty"><h2>Join the conversation.</h2><p>Sign in with your school account to see your school community.</p><Link className="button" href="/login?next=/community">Sign in →</Link></div> : schools.length === 0 ? <div className="studio-dashboard-empty"><h2>Find your school community.</h2><p>Ask your school administrator to invite you to BuildLab.</p><Link className="button" href="/projects">Explore projects →</Link></div> : <div className="community-grid" id="discover"><div className="community-main"><Link className="community-feature" href="/projects/smart-irrigation"><div className="community-feature-image" role="img" aria-label="Smart irrigation project"/><div><span className="eyebrow">PROJECT IDEA</span><h2>Solar-powered irrigation system</h2><p>Use sensors and sunlight to help conserve water in your community.</p><span className="text-link">See the project →</span></div></Link><section className="studio-panel" id="discussions"><div className="studio-panel-title"><h3>Latest discussions</h3><span>{posts.length} in your schools</span></div>{posts.length ? posts.map(post => <button key={post.id} type="button" className={`community-post-row ${selected?.id === post.id ? "active" : ""}`} onClick={() => openPost(post)}><span className="studio-small-avatar">{post.author.charAt(0)}</span><span><strong>{post.title}</strong><small>{post.author} · {post.school} · {new Date(post.created_at).toLocaleDateString()}</small><span className="community-excerpt">{post.body}</span></span><span aria-hidden="true">→</span></button>) : <div className="community-empty"><strong>Start the first discussion.</strong><p>Ask a question about a project or share what you’re building.</p></div>}{pending.length > 0 && <div className="community-pending"><strong>Your posts awaiting review</strong>{pending.map(post => <p key={post.id}>{post.title}</p>)}</div>}</section></div><div className="community-conversation">{selected ? <section className="studio-panel"><button type="button" className="community-back" onClick={() => setSelected(null)}>← Back to feed</button><span className="eyebrow">{selected.school.toUpperCase()}</span><h2>{selected.title}</h2><p>{selected.body}</p><small>By {selected.author} · {new Date(selected.created_at).toLocaleDateString()}</small><div className="community-comments"><h3>Replies</h3>{comments.length ? comments.map(item => <article key={item.id}><strong>{item.author}</strong><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString()}</time><p>{item.body}</p></article>) : <p>No replies yet.</p>}</div>{selected.status === "approved" && <form onSubmit={sendReply}><label className="sr-only" htmlFor="community-reply">Add a reply</label><textarea id="community-reply" required minLength={3} maxLength={1000} value={reply} onChange={event => setReply(event.target.value)} placeholder="Share a helpful suggestion…" rows={3}/><button className="button button-small" disabled={busy} type="submit">Reply →</button></form>}{pendingComments.length > 0 && <div className="community-review"><strong>Replies awaiting review</strong>{pendingComments.map(item => <div key={item.id}><p>{item.author}: {item.body}</p><button type="button" disabled={busy} onClick={() => approveComment(item)}>Approve reply</button></div>)}</div>}</section> : <section className="studio-panel community-prompt"><span className="eyebrow">PICK A DISCUSSION</span><h2>Ideas grow through questions.</h2><p>Select a post from your school to read the conversation and add a helpful reply.</p></section>}</div><aside className="community-side" id="your-school"><section className="studio-panel"><div className="studio-panel-title"><h3>Your school spaces</h3></div>{schools.map(item => <div className="community-school" key={item.id}><span>⌂</span><div><strong>{item.name}</strong><small>{item.role.replaceAll("_", " ")}</small></div></div>)}</section><form className="studio-panel community-form" onSubmit={createPost}><span className="eyebrow">START A CONVERSATION</span><h3>Ask your school community.</h3><label>School<select required value={schoolId} onChange={event => setSchoolId(event.target.value)}>{schools.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Topic<input required minLength={5} maxLength={140} value={title} onChange={event => setTitle(event.target.value)} placeholder="What are you building?"/></label><label>Your question or idea<textarea required minLength={20} maxLength={3000} rows={4} value={body} onChange={event => setBody(event.target.value)} placeholder="Describe your challenge and what you have tried."/></label><button className="button button-small" disabled={busy} type="submit">Post discussion →</button><small>Student posts are reviewed by a teacher before appearing.</small></form>{review.length > 0 && <section className="studio-panel community-review"><h3>Posts awaiting review</h3>{review.map(item => <div key={item.id}><strong>{item.title}</strong><p>{item.author} · {item.school}</p><button type="button" disabled={busy} onClick={() => approve(item)}>Approve</button></div>)}</section>}</aside></div>}</main>;
}
