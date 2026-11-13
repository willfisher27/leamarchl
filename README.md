# leamarchl

Portfolio site for Lea Marchl. Built with Next.js, Supabase (database, login, file storage) and Vercel (hosting).

## Who can see what

| Visitor | Can see | Can edit |
|---|---|---|
| Public | About page, public articles | — |
| Reader (entered the shared password at `/access`) | Everything above **plus private articles and PDFs** | — |
| Editor (Lea or Will, logged in at `/login`) | Everything | Profile, photo, articles |

Private articles are invisible to anyone without the password. They aren't listed, and their PDF links return "Not found".
All PDFs are stored in a private bucket. Visitors only ever get a 5-minute signed link, after the site checks their access.

## One-time setup

### 1. Supabase (free)
1. Create a project at https://supabase.com.
2. **SQL Editor → New query**: paste `supabase/schema.sql` and run it.
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
- **Editing:** go to `/login`, enter your email and click the link you receive. That opens `/admin`, where you can add, edit or delete articles and edit the profile.
- **Sharing private materials:** give people the reader password and point them to `/access`.
  To revoke access for everyone, change `READER_PASSWORD` in Vercel and redeploy. This signs out all readers.
