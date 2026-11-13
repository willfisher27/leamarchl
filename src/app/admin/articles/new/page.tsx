import { requireEditorPage } from "@/lib/access";
import { getArticles, sectionNames } from "@/lib/data";
import ArticleForm from "../../ArticleForm";

export default async function NewArticlePage() {
  await requireEditorPage();
  const sections = sectionNames(await getArticles());
  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl">Add article</h1>
      <ArticleForm sections={sections} />
    </div>
  );
}
