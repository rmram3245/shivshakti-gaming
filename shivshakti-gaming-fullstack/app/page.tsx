import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: promos } = await supabase.from("promotions").select("id,title,description,bonus_percent").eq("is_active", true).order("created_at", { ascending: false }).limit(3);
  return <>
    <header className="topbar"><div className="nav"><Link className="brand" href="/">SHIV<span>SHAKTI</span> <span style={{fontSize:11,color:"#c6a45d"}}>GAMING</span></Link><div className="links"><Link className="btn secondary" href="/login">Log in</Link><Link className="btn" href="/register">Create account</Link></div></div></header>
    <main className="wrap">
      <section className="hero"><div className="hero-content"><div className="eyebrow">A premium gaming-inspired experience</div><h1>PLAY WITH<br/>SHIVSHAKTI</h1><p>Step into a bold black-and-gold world, discover featured promotions, and manage your account from one simple dashboard.</p><div className="offer">🎉 10% DEPOSIT BONUS 🎉</div><div className="links"><Link className="btn" href="/register">GET STARTED ↗</Link><Link className="btn secondary" href="#offers">Explore offers</Link></div></div></section>
      <div className="section-head" id="offers"><div><div className="eyebrow">Featured</div><h2>Offers & platform features</h2></div><span className="muted">Mobile-ready experience</span></div>
      <section className="grid">
        {(promos?.length ? promos : [{id:"default",title:"10% Deposit Bonus",description:"Promotional offer preview. Publish full eligibility terms before launch.",bonus_percent:10}]).map((p:any)=><article className="tile" key={p.id}><div className="ico">🎁</div><h3>{p.title}</h3><p>{p.description}</p>{p.bonus_percent ? <p><strong>{p.bonus_percent}% bonus</strong></p> : null}</article>)}
        <article className="tile"><div className="ico">🔐</div><h3>Secure account access</h3><p>Account authentication is handled by Supabase Auth.</p></article>
        <article className="tile"><div className="ico">📊</div><h3>Member dashboard</h3><p>View your account profile and transaction history after signing in.</p></article>
      </section>
      <div className="notice"><strong>Launch checklist:</strong> This starter includes authentication, database schema, access policies and dashboard/admin route scaffolding. Payment processing is intentionally not connected. Before offering real-money gaming, verify local laws, licensing, age/identity checks, responsible-play requirements and an approved payment provider.</div>
    </main><footer className="footer">© 2026 ShivShakti Gaming · Terms · Privacy · Responsible play</footer>
  </>;
}
