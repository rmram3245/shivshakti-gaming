import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const {data:{user}} = await supabase.auth.getUser();
  if(!user) redirect("/login");
  const {data:profile} = await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();
  if(profile?.role!=="admin") redirect("/dashboard");
  const [{count:users},{data:promos},{data:latest}] = await Promise.all([
    supabase.from("profiles").select("*",{count:"exact",head:true}),
    supabase.from("promotions").select("id,title,bonus_percent,is_active,created_at").order("created_at",{ascending:false}),
    supabase.from("wallet_transactions").select("id,user_id,amount,kind,status,description,created_at").order("created_at",{ascending:false}).limit(20)
  ]);
  return <><header className="topbar"><div className="nav"><Link className="brand" href="/">SHIV<span>SHAKTI</span> GAMING</Link><div className="links"><Link className="btn secondary" href="/dashboard">Member dashboard</Link><form action="/auth/signout" method="post"><button className="btn">Sign out</button></form></div></div></header><main className="wrap"><div className="section-head"><div><div className="eyebrow">Restricted area</div><h2>Admin dashboard</h2></div><span className="muted">Authorized admin only</span></div><section className="panel"><div className="stats"><div className="tile stat">Registered profiles<strong>{users ?? 0}</strong></div><div className="tile stat">Promotions<strong>{promos?.length ?? 0}</strong></div><div className="tile stat">Ledger entries<strong>{latest?.length ?? 0}</strong></div></div><h3 style={{color:"#ffdf88"}}>Promotions</h3>{!promos?.length?<p className="muted">No promotions configured.</p>:<div style={{overflowX:"auto"}}><table className="table"><thead><tr><th>Title</th><th>Bonus</th><th>Active</th></tr></thead><tbody>{promos.map((p:any)=><tr key={p.id}><td>{p.title}</td><td>{p.bonus_percent ?? "—"}%</td><td>{p.is_active?"Yes":"No"}</td></tr>)}</tbody></table></div>}<h3 style={{color:"#ffdf88",marginTop:28}}>Recent ledger activity</h3>{!latest?.length?<p className="muted">No ledger entries yet.</p>:<div style={{overflowX:"auto"}}><table className="table"><thead><tr><th>Date</th><th>User ID</th><th>Kind</th><th>Status</th><th>Amount</th></tr></thead><tbody>{latest.map((t:any)=><tr key={t.id}><td>{new Date(t.created_at).toLocaleString()}</td><td>{t.user_id.slice(0,8)}…</td><td>{t.kind}</td><td>{t.status}</td><td>₹{Number(t.amount).toFixed(2)}</td></tr>)}</tbody></table></div>}<div className="notice">This admin page is read-only. Promote the first admin through the Supabase SQL Editor only after confirming that account's identity. Do not make admin role assignment available to public users.</div></section></main></>;
}
