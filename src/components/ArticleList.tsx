import { articleHref, formatDate, type Article } from "@/lib/data";

export default function ArticleList({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return <p className="text-muted">No articles yet.</p>;
  }
  return (
    <ul className="divide-y divide-rule">
      {articles.map((a) => (
        <li key={a.id} className="py-6 first:pt-0">
          <a href={articleHref(a)} target="_blank" rel="noopener noreferrer" className="group block">
            <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-wider text-muted">
              {a.outlet && <span className="font-semibold text-foreground">{a.outlet}</span>}
              {a.published_on && <span>{formatDate(a.published_on)}</span>}
              <span>{a.kind === "pdf" ? "PDF" : "Link ↗"}</span>
            </div>
            <h3 className="font-serif text-xl leading-snug group-hover:text-accent sm:text-2xl">{a.title}</h3>
            {a.summary && <p className="mt-2 text-sm leading-relaxed text-muted">{a.summary}</p>}
          </a>
        </li>
      ))}
    </ul>
  );
}
