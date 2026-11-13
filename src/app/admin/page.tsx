import Link from "next/link";
import { requireEditorPage } from "@/lib/access";
import { getArticles, formatDate, articleHref } from "@/lib/data";
import DeleteArticleButton from "./DeleteArticleButton";

export default async function AdminArticlesPage() {
  // Layouts and pages render in parallel, so check here too before fetching.
  await requireEditorPage();
  const articles = await getArticles();

  return (
    <section>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="font-serif text-3xl">Articles</h1>
        <Link href="/admin/articles/new" className="btn">
          + Add article
        </Link>
      </div>
      {articles.length === 0 ? (
        <p className="text-sm text-muted">Nothing yet. Add the first article.</p>
      ) : (
        <ul className="divide-y divide-rule rounded-md border border-rule bg-surface">
          {articles.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <a href={articleHref(a)} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-accent">
                  {a.title}
                </a>
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
                  {a.outlet && <span>{a.outlet}</span>}
                  {a.published_on && <span>{formatDate(a.published_on)}</span>}
                  <span>{a.kind === "pdf" ? "PDF" : "Link"}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/articles/${a.id}`} className="btn-ghost px-3 py-1 text-xs">
                  Edit
                </Link>
                <DeleteArticleButton id={a.id} title={a.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
