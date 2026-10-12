import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{data:profile},{data:transactions},{data:balanceData}] = await Promise.all([
    supabase.from("profiles").select("display_name,role").eq("id",user.id).maybeSingle(),
    supabase.from("wallet_transactions").select("id,amount,kind,status,description,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(20),
    supabase.rpc("get_my_wallet_balance")
  ]);
  const balance = Number(balanceData ?? 0);
  return <><header className="topbar"><div className="nav"><Link className="brand" href="/">SHIV<span>SHAKTI</span> GAMING</Link><div className="links"><Link className="btn secondary" href="/admin">Admin</Link><form action="/auth/signout" method="post"><button className="btn">Sign out</button></form></div></div></header><main className="wrap"><div className="section-head"><div><div className="eyebrow">Member area</div><h2>Your dashboard</h2></div><span className="muted">{user.email}</span></div><section className="panel"><h3 style={{color:"#ffdf88"}}>Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}</h3><p className="muted">Account role: {profile?.role ?? "member"}</p><div className="stats"><div className="tile stat">Ledger total<strong>₹{balance.toFixed(2)}</strong></div><div className="tile stat">Bonus offer<strong>10%</strong></div><div className="tile stat">Recent entries<strong>{transactions?.length ?? 0}</strong></div></div><h3 style={{color:"#ffdf88"}}>Transaction history</h3>{!transactions?.length?<p className="muted">No transactions yet. Your account balance will change only through verified, authorized ledger operations.</p>:<div style={{overflowX:"auto"}}><table className="table"><thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Status</th><th>Amount</th></tr></thead><tbody>{transactions.map((t:any)=><tr key={t.id}><td>{new Date(t.created_at).toLocaleString()}</td><td>{t.description}</td><td>{t.kind}</td><td>{t.status}</td><td>₹{Number(t.amount).toFixed(2)}</td></tr>)}</tbody></table></div>}<div className="notice">Wallet is a ledger preview. No deposit or withdrawal flow is enabled in this starter. Do not treat the displayed total as redeemable funds.</div></section></main></>;
}
