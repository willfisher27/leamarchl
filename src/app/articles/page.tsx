import type { Metadata } from "next";
import Link from "next/link";
import ArticleList from "@/components/ArticleList";
import { requireViewer } from "@/lib/access";
import { getArticles } from "@/lib/data";

export const metadata: Metadata = { title: "Work" };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ outlet?: string }> }) {
  await requireViewer();
  const { outlet } = await searchParams;
  const articles = await getArticles();
  const outlets = [...new Set(articles.map((a) => a.outlet).filter(Boolean))] as string[];
  const shown = outlet ? articles.filter((a) => a.outlet === outlet) : articles;

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs transition ${
      active ? "border-foreground bg-foreground text-background" : "border-rule hover:border-foreground"
    }`;

  return (
    <div>
      <h1 className="font-serif text-4xl tracking-tight">Work</h1>
      {outlets.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/articles" className={chip(!outlet)}>
            All
          </Link>
          {outlets.map((o) => (
            <Link key={o} href={`/articles?outlet=${encodeURIComponent(o)}`} className={chip(o === outlet)}>
              {o}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-10">
        <ArticleList articles={shown} />
      </div>
    </div>
  );
}
