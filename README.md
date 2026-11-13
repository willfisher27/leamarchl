# leamarchl

Portfolio site for Lea Marchl. Built with Next.js, Supabase (database, login, file storage) and Vercel (hosting).

## Who can see what

The whole site is private. Every page starts at a sign-in screen with two options:

| Sign in as | How | Can do |
|---|---|---|
| **Viewer** | Shared password (`READER_PASSWORD` in Vercel) | Browse About, Work, Resume, Photography |
| **Editor** (Lea or Will) | Email + password | Everything above, plus edit everything under Admin |

Nothing can be read with the public Supabase key. Pages, PDFs, and images are fetched on the server only after the login is checked,
and files are handed out as short-lived signed links.

## One-time setup

### 1. Supabase (free)
1. Create a project at https://supabase.com.
2. **SQL Editor → New query**: run `supabase/schema.sql`, then each file in `supabase/migrations/` in order.
3. Add the editors. In the SQL editor, run:
   ```sql
   insert into public.editors (email) values ('lea@…'), ('will@…');
   ```
4. **Authentication → Users → Add user → Create new user** for each editor email (tick "Auto confirm").
5. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up".
6. **Authentication → URL Configuration**: set Site URL to your site (e.g. `https://leamarchl.vercel.app`) and add
   `https://leamarchl.vercel.app/auth/callback` and `http://localhost:3000/auth/callback` to the Redirect URLs.
7. **Project Settings → API**: copy the **publishable** key and the **secret** key (not the Legacy tab). Copy the Project URL from **Project Settings → Data API**.

### 2. Local development
```bash
cp .env.example .env.local   # fill in the values
npm install
npm run dev                  # http://localhost:3000
```

### 3. Vercel (free Hobby plan)
1. Import this GitHub repo at https://vercel.com/new.
2. Add every variable from `.env.example` under **Settings → Environment Variables**. Set `NEXT_PUBLIC_SITE_URL` to the Vercel URL.
3. Deploy. The daily cron in `vercel.json` pings the database so the free Supabase project never pauses.

## Everyday use
- **Editing:** sign in as Editor. Admin has tabs for Articles, Photography, Resume, Profile, and Account (your password).
- **First-time editor password:** use "Email me a sign-in link", or run `./scripts/set-password.sh` on a machine with `.env.local`.
- **Viewers:** give people the viewer password. To revoke everyone's access, change `READER_PASSWORD` in Vercel and redeploy.
