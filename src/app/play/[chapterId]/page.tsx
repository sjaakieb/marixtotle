import { notFound } from "next/navigation";
import { getChapter, chapters } from "@/content/chapters";
import { PlayClient } from "@/components/PlayClient";

export function generateStaticParams() {
  return chapters.map((c) => ({ chapterId: c.id }));
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const chapter = getChapter(chapterId);
  if (!chapter) notFound();

  return (
    <div className="min-h-dvh bg-stone-50">
      <div className="mx-auto max-w-3xl px-5 py-6">
        <div className="mb-4">
          <h1 className="text-lg font-bold text-stone-900">{chapter.title}</h1>
          {chapter.description && (
            <p className="text-sm text-stone-600">{chapter.description}</p>
          )}
        </div>
        <PlayClient chapter={chapter} />
      </div>
    </div>
  );
}
