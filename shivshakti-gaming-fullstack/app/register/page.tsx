 "use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function RegisterPage() {
  const supabase = createClient();
  const [email,setEmail] = useState(""); const [password,setPassword] = useState(""); const [message,setMessage] = useState(""); const [busy,setBusy] = useState(false);
  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setMessage(""); const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+"/auth/callback"}}); setBusy(false); if(error){setMessage(error.message);return;} setMessage("Registration received. Check your email to confirm your account."); }
  return <><header className="topbar"><div className="nav"><Link className="brand" href="/">SHIV<span>SHAKTI</span> GAMING</Link><Link href="/" className="btn secondary">Home</Link></div></header><main className="wrap"><section className="panel form-wrap"><div className="eyebrow">Join the platform</div><h2 style={{margin:"10px 0 20px"}}>Create account</h2><form className="form" onSubmit={submit}><div><label>Email address</label><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div><div><label>Password (minimum 8 characters)</label><input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></div>{message&&<p className={message.startsWith("Registration")?"success":"error"}>{message}</p>}<button className="btn" disabled={busy}>{busy?"Creating…":"Create account"}</button></form><p className="small">Already registered? <Link href="/login" style={{color:"#ffdf88"}}>Log in</Link></p></section></main></>;
}
