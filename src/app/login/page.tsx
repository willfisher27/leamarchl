import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Editor login", robots: { index: false } };

async function signInWithPassword(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(`[login] password sign-in failed: ${error.message}`);
    redirect("/login?error=password");
  }
  redirect("/admin");
}

async function sendLink(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || (await headers()).get("origin") || "";
    const supabase = await createClient();
    // shouldCreateUser: false — only accounts you created in Supabase can log in.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${origin}/auth/callback?next=/admin` },
    });
    // Logged on the server only (Terminal locally, Vercel → Logs in production), never shown to visitors.
    if (error) console.error(`[login] sign-in link not sent: ${error.message}`);
  }
  // Same message either way, so the form doesn't reveal which emails are editors.
  redirect("/login?sent=1");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string; mode?: string }>;
}) {
  const { sent, error, mode } = await searchParams;

  if (sent) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="font-serif text-3xl">Check your email</h1>
        <p className="mt-4 text-sm text-muted">
          If that email belongs to an editor, a sign-in link is on its way. Open it in this browser.
        </p>
      </div>
    );
  }

  if (mode === "link") {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="font-serif text-3xl">Email me a link</h1>
        <p className="mt-2 text-sm text-muted">
          Use this if you haven’t set a password yet or forgot it. You can set a new one on the Admin page.
        </p>
        <form action={sendLink} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" required autoFocus className="field" />
          </div>
          <button className="btn w-full">Send link</button>
        </form>
        <Link href="/login" className="mt-6 block text-center text-sm text-muted hover:text-foreground">
          ← Sign in with password
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-serif text-3xl">Editor login</h1>
      <form action={signInWithPassword} className="mt-8 space-y-4">
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
        <button className="btn w-full">Sign in</button>
      </form>
      <Link href="/login?mode=link" className="mt-6 block text-center text-sm text-muted hover:text-foreground">
        No password yet, or forgot it? Email me a sign-in link
      </Link>
    </div>
  );
}
