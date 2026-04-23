interface Case {
  videoId: string;
  quote: string;
  name: string;
  specialty: string;
  city: string;
  metrics: string[];
}

interface Props { cases: Case[]; }

export const WebinarMoreCases = ({ cases }: Props) => (
  <section className="bg-white text-webinar-ink">
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <h2 className="font-serif-display text-3xl sm:text-5xl font-medium tracking-tight mb-12">
        Não é só um caso.
      </h2>

      <div className="grid lg:grid-cols-2 gap-8">
        {cases.map((c) => (
          <article key={c.name} className="bg-webinar-cream border border-webinar rounded-md overflow-hidden">
            <div className="aspect-video bg-black/5">
              <iframe
                src={`https://www.youtube.com/embed/${c.videoId}`}
                title={c.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="p-6 sm:p-8">
              <blockquote className="font-serif-display text-xl sm:text-2xl leading-snug italic mb-5">
                "{c.quote}"
              </blockquote>
              <p className="text-[20px] text-webinar-muted mb-4">
                <span className="text-webinar-ink font-medium">{c.name}</span> · {c.specialty} · {c.city}
              </p>
              <ul className="text-[20px] text-webinar-muted space-y-1">
                {c.metrics.map((m) => <li key={m}>· {m}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
