import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/access";

export const metadata: Metadata = { title: "Sign in" };

/** Only allow redirects to paths on this site. */
function safeNext(value: unknown, fallback = "/") {
  const v = String(value ?? "");
  return v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}

async function editorSignIn(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"), "/admin");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(`[login] password sign-in failed: ${error.message}`);
    redirect(`/login?as=editor&error=password&next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}

async function sendLink(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || (await headers()).get("origin") || "";
    const supabase = await createClient();
    // shouldCreateUser: false — only accounts you created in Supabase can sign in.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${origin}/auth/callback?next=/admin` },
    });
    // Logged on the server only (Terminal locally, Vercel → Logs in production), never shown to visitors.
    if (error) console.error(`[login] sign-in link not sent: ${error.message}`);
  }
  // Same message either way, so the form doesn't reveal which emails are editors.
  redirect("/login?as=editor&sent=1");
}

type Search = { as?: string; mode?: string; sent?: string; error?: string; next?: string };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { as, mode, sent, error, next: nextParam } = await searchParams;
  const next = safeNext(nextParam);
  const asEditor = as === "editor";

  // Already signed in? Skip the form.
  const { isSignedIn, isEditor } = await getViewer();
  if (asEditor ? isEditor : isSignedIn) redirect(asEditor && next === "/" ? "/admin" : next);

  const tab = (active: boolean) =>
    `flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition ${
      active ? "bg-surface shadow-sm" : "text-muted hover:text-foreground"
    }`;
  const nextQS = next !== "/" ? `&next=${encodeURIComponent(next)}` : "";

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-center font-serif text-3xl">Welcome</h1>
      <p className="mt-2 text-center text-sm text-muted">This site is private. Please sign in.</p>

      <div className="mt-8 flex gap-1 rounded-lg border border-rule bg-background p-1" role="tablist">
        <Link href={`/login?as=viewer${nextQS}`} className={tab(!asEditor)} role="tab" aria-selected={!asEditor}>
          Viewer
        </Link>
        <Link href={`/login?as=editor${nextQS}`} className={tab(asEditor)} role="tab" aria-selected={asEditor}>
          Editor
        </Link>
      </div>

      <div className="mt-6">
        {!asEditor ? (
          <form action="/auth/viewer" method="post" className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" name="password" type="password" required autoFocus autoComplete="current-password" className="field" />
            </div>
            {error === "viewer" && <p className="text-sm text-accent">That password didn’t work.</p>}
            <button className="btn w-full">View site</button>
          </form>
        ) : sent ? (
          <p className="text-sm text-muted">
            If that email belongs to an editor, a sign-in link is on its way. Open it in this browser.
          </p>
        ) : mode === "link" ? (
          <>
            <p className="mb-4 text-sm text-muted">
              Use this if you haven’t set a password yet or forgot it. You can set a new one under Admin → Account.
            </p>
            <form action={sendLink} className="space-y-4">
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input id="email" name="email" type="email" required autoFocus className="field" />
              </div>
              <button className="btn w-full">Send link</button>
            </form>
            <Link href={`/login?as=editor${nextQS}`} className="mt-6 block text-center text-sm text-muted hover:text-foreground">
              ← Sign in with password
            </Link>
          </>
        ) : (
          <>
            <form action={editorSignIn} className="space-y-4">
              <input type="hidden" name="next" value={next === "/" ? "/admin" : next} />
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input id="email" name="email" type="email" required autoFocus autoComplete="username" className="field" />
              </div>
              <div>
                <label htmlFor="password" className="label">Password</label>
                <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
              </div>
              {error === "password" && <p className="text-sm text-accent">Email or password is incorrect.</p>}
              {error === "1" && <p className="text-sm text-accent">That link expired or was invalid. Try again.</p>}
              <button className="btn w-full">Sign in as editor</button>
            </form>
            <Link href={`/login?as=editor&mode=link${nextQS}`} className="mt-6 block text-center text-sm text-muted hover:text-foreground">
              No password yet, or forgot it? Email me a sign-in link
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
