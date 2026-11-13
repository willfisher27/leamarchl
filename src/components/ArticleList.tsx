import { articleHref, formatDate, pdfHref, type Article } from "@/lib/data";

export default function ArticleList({ articles, showSection = false }: { articles: Article[]; showSection?: boolean }) {
  if (articles.length === 0) {
    return <p className="text-muted">No articles yet.</p>;
  }
  return (
    <ul className="divide-y divide-rule">
      {articles.map((a) => {
        const pdf = pdfHref(a);
        return (
          <li key={a.id} className="py-6 first:pt-0">
            <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-wider text-muted">
              {showSection && a.section && (
                <span className="rounded bg-surface px-1.5 py-0.5 text-foreground">{a.section}</span>
              )}
              {a.outlet && <span className="font-semibold text-foreground">{a.outlet}</span>}
              {a.published_on && <span>{formatDate(a.published_on)}</span>}
              {a.url && (
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  Link ↗
                </a>
              )}
              {pdf && (
                <a href={pdf} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  PDF
                </a>
              )}
            </div>
            <h3 className="font-serif text-xl leading-snug sm:text-2xl">
              <a href={articleHref(a)} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                {a.title}
              </a>
            </h3>
            {a.summary && <p className="mt-2 text-sm leading-relaxed text-muted">{a.summary}</p>}
          </li>
        );
      })}
    </ul>
  );
}
