"use client";

import { useTransition } from "react";
import { renameSection } from "./actions";

export default function RenameSectionButton({ name }: { name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="text-xs text-muted underline hover:text-foreground"
      onClick={() => {
        const next = prompt(`Rename the “${name}” section to:`, name)?.trim();
        if (!next || next === name) return;
        start(async () => {
          const res = await renameSection(name, next);
          if (res.error) alert(res.error);
        });
      }}
    >
      {pending ? "Renaming…" : "Rename section"}
    </button>
  );
}
