"use client";

import { useRef, useState, useTransition } from "react";
import { setPassword } from "./actions";

export default function PasswordForm({ email }: { email: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const res = await setPassword(fd);
          if (res.error) return setMessage({ ok: false, text: res.error });
          formRef.current?.reset();
          setMessage({ ok: true, text: "Password saved. Use it next time you sign in." });
        });
      }}
      className="space-y-5"
    >
      <p className="text-sm text-muted">
        Set or change the password for <span className="text-foreground">{email}</span>.
      </p>
      {/* Lets password managers associate the new password with the right account. */}
      <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="new-password">New password (12+ characters)</label>
          <input id="new-password" name="password" type="password" minLength={12} required autoComplete="new-password" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="confirm-password">Confirm</label>
          <input id="confirm-password" name="confirm" type="password" minLength={12} required autoComplete="new-password" className="field" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="btn" disabled={pending}>{pending ? "Saving…" : "Save password"}</button>
        {message && <span className={`text-sm ${message.ok ? "text-muted" : "text-accent"}`}>{message.text}</span>}
      </div>
    </form>
  );
}
