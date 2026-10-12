# ShivShakti Gaming — Next.js + Supabase starter

This project is a deployable full-stack starter for Vercel. It includes:
- Responsive black/gold landing page and 10% promotion banner
- Supabase email/password registration and login with cookie-based session refresh
- Member dashboard with profile and ledger-history reads
- Admin dashboard protected by a server-side role check
- Supabase SQL schema, row-level security (RLS), and sample promotion
- No payment gateway or real-money wallet funding is enabled

## 1. Prerequisites
- Node.js 20.9+ (use the current LTS)
- A GitHub account
- A Vercel account
- A Supabase account

## 2. Create the Supabase backend
1. Open https://database.new and create a project.
2. Open **SQL Editor** in Supabase.
3. Open `supabase/schema.sql` from this project, paste it into the SQL Editor, and run it.
4. Go to **Project Settings → API** (or the project's Connect dialog) and copy the Project URL and publishable key.
5. In **Authentication → URL Configuration**, set Site URL to your eventual Vercel domain (you can update it after deployment). Add redirect URL `https://YOUR-VERCEL-DOMAIN/auth/callback` and for local testing `http://localhost:3000/auth/callback`.
6. Keep email confirmation enabled for production. Configure SMTP/custom email provider before public launch if needed.

## 3. Run locally
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase project URL and publishable key
npm install
npm run dev
```
Open http://localhost:3000. Test registration, confirm the email, then log in.

## 4. Deploy to Vercel
### Git-based method (recommended)
1. Create a new GitHub repository.
2. Upload/push all files from this folder to the repository root (include `app/`, `lib/`, `supabase/`, `package.json`, etc.).
3. In Vercel, choose **Add New → Project**, import that GitHub repository.
4. Framework should be detected as **Next.js**. Root Directory should be `./`.
5. In Vercel **Project → Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = your Supabase publishable key
   Select Production, Preview and Development as appropriate.
6. Deploy. If you add/change environment variables later, redeploy; they do not change existing deployments.
7. Open the generated `*.vercel.app` URL and test registration/login.
8. In Supabase **Authentication → URL Configuration**, set Site URL to the deployed Vercel URL and add its `/auth/callback` redirect URL.
9. Add your custom domain in Vercel **Project → Settings → Domains**, follow the DNS instructions from Vercel, then update Supabase Site URL/redirect URLs to the final HTTPS domain.

### CLI alternative
```bash
npm i -g vercel
vercel login
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
vercel deploy
# After verifying the preview:
vercel deploy --prod
```
For the CLI environment prompts, add the two values for the relevant environments. The Git-based flow is simpler for ongoing updates.

## 5. Create your admin account
1. Register your own account from the deployed site and confirm the email.
2. In Supabase, open **Authentication → Users** and copy that account's UUID.
3. In SQL Editor, run this statement after replacing the placeholder:
```sql
update public.profiles
set role = 'admin'
where id = 'YOUR_AUTH_USER_UUID';
```
4. Sign out and sign back in, then open `/admin`. Do not expose admin role assignment through the public site.

## 6. Production checklist
- Add column-level grants or a dedicated safe profile-update RPC so members can change display name but never role.
- Add rate limits, abuse protection, CAPTCHA where appropriate, monitoring, backups and audit logs.
- Configure custom SMTP, password recovery, privacy policy and terms.
- Review RLS policies with a security professional before storing personal or financial information.
- Do not implement wallet funding by trusting browser input. For a real payment provider, verify signed webhooks server-side, make webhook processing idempotent, and write ledger entries atomically.
- Payment integration, withdrawals, identity/age checks and real-money gaming operations are intentionally omitted. Obtain legal/licensing advice for each jurisdiction and use only approved providers before any real-money launch.

## Architecture
- **Frontend/server routes:** Next.js App Router on Vercel
- **Authentication and database:** Supabase Auth + PostgreSQL
- **Authorization:** server-side role check plus database RLS
- **Wallet view:** read-only transaction ledger view; no live money movement
