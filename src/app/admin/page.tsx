import Link from "next/link";
import { requireEditorPage } from "@/lib/access";
import { getArticles, groupBySection, formatDate, articleHref } from "@/lib/data";
import DeleteArticleButton from "./DeleteArticleButton";
import RenameSectionButton from "./RenameSectionButton";

export default async function AdminArticlesPage() {
  // Layouts and pages render in parallel, so check here too before fetching.
  await requireEditorPage();
  const articles = await getArticles();
  const groups = groupBySection(articles);

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
        <div className="space-y-10">
          {groups.map((g) => (
            <div key={g.slug}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-xl">
                  {g.name ?? "No section"} <span className="text-sm text-muted">({g.articles.length})</span>
                </h2>
                {g.name && <RenameSectionButton name={g.name} />}
              </div>
              <ul className="divide-y divide-rule rounded-md border border-rule bg-surface">
                {g.articles.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <a href={articleHref(a)} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-accent">
                        {a.title}
                      </a>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
                        {a.outlet && <span>{a.outlet}</span>}
                        {a.published_on && <span>{formatDate(a.published_on)}</span>}
                        <span>{[a.url && "Link", a.file_path && "PDF"].filter(Boolean).join(" + ")}</span>
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
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
