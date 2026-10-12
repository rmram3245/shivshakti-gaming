 "use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function LoginPage() {
  const supabase = createClient();
  const [email,setEmail] = useState(""); const [password,setPassword] = useState(""); const [message,setMessage] = useState(""); const [busy,setBusy] = useState(false);
  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setMessage(""); const {error}=await supabase.auth.signInWithPassword({email,password}); setBusy(false); if(error){setMessage(error.message);return;} window.location.href="/dashboard"; }
  return <><header className="topbar"><div className="nav"><Link className="brand" href="/">SHIV<span>SHAKTI</span> GAMING</Link><Link href="/" className="btn secondary">Home</Link></div></header><main className="wrap"><section className="panel form-wrap"><div className="eyebrow">Member access</div><h2 style={{margin:"10px 0 20px"}}>Log in</h2><form className="form" onSubmit={submit}><div><label>Email address</label><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div><div><label>Password</label><input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></div>{message&&<p className="error">{message}</p>}<button className="btn" disabled={busy}>{busy?"Signing in…":"Log in"}</button></form><p className="small">New here? <Link href="/register" style={{color:"#ffdf88"}}>Create an account</Link></p></section></main></>;
}
