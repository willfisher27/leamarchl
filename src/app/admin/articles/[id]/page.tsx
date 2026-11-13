import { notFound } from "next/navigation";
import { requireEditorPage } from "@/lib/access";
import { getArticles, sectionNames } from "@/lib/data";
import ArticleForm from "../../ArticleForm";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireEditorPage();
  const articles = await getArticles();
  const article = articles.find((a) => a.id === id);
  if (!article) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl">Edit article</h1>
      <ArticleForm article={article} sections={sectionNames(articles)} />
    </div>
  );
}
