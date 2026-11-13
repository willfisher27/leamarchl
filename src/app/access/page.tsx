import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkReaderPassword, createReaderToken, READER_COOKIE, READER_MAX_AGE } from "@/lib/reader";

export const metadata: Metadata = { title: "Private access", robots: { index: false } };

async function enter(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  // Small fixed delay to slow down guessing.
  await new Promise((r) => setTimeout(r, 600));
  if (!(await checkReaderPassword(password))) redirect("/access?error=1");

  (await cookies()).set(READER_COOKIE, await createReaderToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: READER_MAX_AGE,
  });
  redirect("/articles");
}

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-serif text-3xl">Private access</h1>
      <p className="mt-2 text-sm text-muted">Enter the password you were given.</p>
      <form action={enter} className="mt-8 space-y-4">
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input id="password" name="password" type="password" required autoFocus className="field" />
        </div>
        {error && <p className="text-sm text-accent">That password didn’t work.</p>}
        <button className="btn w-full">Continue</button>
      </form>
    </div>
  );
}
