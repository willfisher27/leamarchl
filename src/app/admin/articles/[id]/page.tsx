import { notFound } from "next/navigation";
import { requireEditorPage } from "@/lib/access";
import type { Article } from "@/lib/data";
import ArticleForm from "../../ArticleForm";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireEditorPage();
  const { data } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl">Edit article</h1>
      <ArticleForm article={data as Article} />
    </div>
  );
}
