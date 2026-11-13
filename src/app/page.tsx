import Link from "next/link";
import ArticleList from "@/components/ArticleList";
import { requireViewer } from "@/lib/access";
import { getArticles, getProfile, mediaUrl } from "@/lib/data";

export default async function Home() {
  await requireViewer();
  const [profile, articles] = await Promise.all([getProfile(), getArticles()]);
  const recent = articles.slice(0, 3);
  const experience = profile.experience.split("\n").map((l) => l.trim()).filter(Boolean);
  const links = [
    profile.email && { label: "Email", href: `mailto:${profile.email}` },
    profile.linkedin_url && { label: "LinkedIn", href: profile.linkedin_url },
    profile.bluesky_url && { label: "Bluesky", href: profile.bluesky_url },
    profile.x_url && { label: "X", href: profile.x_url },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="space-y-16">
      <section className="grid gap-8 sm:grid-cols-[200px_1fr] sm:gap-12">
        <div>
          {profile.photo_path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl(profile.photo_path)}
              alt={`Portrait of ${profile.name}`}
              className="aspect-[4/5] w-40 rounded-sm object-cover sm:w-full"
            />
          ) : (
            <div className="flex aspect-[4/5] w-40 items-center justify-center rounded-sm bg-rule font-serif text-4xl text-muted sm:w-full">
              LM
            </div>
          )}
          {profile.short_bio.trim() && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">{profile.short_bio.trim()}</p>
          )}
        </div>
        <div>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">{profile.name}</h1>
          <p className="mt-2 text-sm uppercase tracking-wider text-muted">{profile.title}</p>
          <div className="mt-6 space-y-4 font-serif text-lg leading-relaxed">
            {profile.bio
              .split(/\n\s*\n/)
              .filter(Boolean)
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
          {links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-foreground/30 hover:border-accent hover:text-accent"
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {experience.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Experience</h2>
          <ul className="space-y-2 font-serif text-lg">
            {experience.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Recent work</h2>
          <Link href="/articles" className="text-sm hover:text-accent">
            All work →
          </Link>
        </div>
        <ArticleList articles={recent} />
      </section>
    </div>
  );
}
