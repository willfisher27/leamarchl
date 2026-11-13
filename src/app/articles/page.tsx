import type { Metadata } from "next";
import ArticleList from "@/components/ArticleList";
import { requireViewer } from "@/lib/access";
import { getArticles, groupBySection } from "@/lib/data";

export const metadata: Metadata = { title: "Work" };

export default async function ArticlesPage() {
  await requireViewer();
  const articles = await getArticles();
  const groups = groupBySection(articles);
  const hasSections = groups.some((g) => g.name);

  return (
    <div>
      <h1 className="font-serif text-4xl tracking-tight">Work</h1>

      {!hasSections ? (
        <div className="mt-10">
          <ArticleList articles={articles} />
        </div>
      ) : (
        <>
          <nav aria-label="Sections" className="mt-6 flex flex-wrap gap-2">
            {groups.map((g) => (
              <a
                key={g.slug}
                href={`#${g.slug}`}
                className="rounded-full border border-rule bg-surface/60 px-3 py-1 text-xs transition hover:border-foreground"
              >
                {g.name ?? "Other"} <span className="text-muted">{g.articles.length}</span>
              </a>
            ))}
          </nav>
          <div className="mt-12 space-y-16">
            {groups.map((g) => (
              <section key={g.slug} id={g.slug} className="scroll-mt-8">
                <h2 className="mb-6 border-b border-rule pb-2 font-serif text-2xl">{g.name ?? "Other"}</h2>
                <ArticleList articles={g.articles} />
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
