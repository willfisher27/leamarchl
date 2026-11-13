import { requireEditorPage } from "@/lib/access";
import ArticleForm from "../../ArticleForm";

export default async function NewArticlePage() {
  await requireEditorPage();
  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl">Add article</h1>
      <ArticleForm />
    </div>
  );
}
