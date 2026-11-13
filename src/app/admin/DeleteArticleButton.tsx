"use client";

import { useTransition } from "react";
import { deleteArticle } from "./actions";

export default function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="btn-ghost px-3 py-1 text-xs hover:border-accent hover:text-accent"
      onClick={() => {
        if (!confirm(`Delete “${title}”? This can’t be undone.`)) return;
        start(async () => {
          const res = await deleteArticle(id);
          if (res.error) alert(res.error);
        });
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
