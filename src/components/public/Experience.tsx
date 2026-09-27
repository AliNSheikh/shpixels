import { BriefcaseBusiness, GraduationCap, MapPin } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export function Experience() {
  const { content } = useContent();
  const items = [
    ...(content.experience || []).map((item) => ({ ...item, type: 'experience' as const })),
    ...(content.education || []).map((item) => ({ ...item, type: 'education' as const }))
  ]
    .filter((item) => item.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (items.length === 0) return null;

  const header = content.sectionHeaders?.experience;

  return (
    <section id="experience" className="py-16 sm:py-24 bg-[#141414] border-t border-[#2b2b2b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--site-accent)]">
            {header?.badge || 'EXPERIENCE & EDUCATION'}
          </p>
          <h2 className="mt-2 text-3xl sm:text-5xl font-black text-[#f1f2ed] font-quicksand uppercase">
            {header?.title || 'Professional Timeline'}
          </h2>
          {header?.description && <p className="mt-3 max-w-2xl text-sm text-[#a8a6a1]">{header.description}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item) => {
            const Icon = item.type === 'education' ? GraduationCap : BriefcaseBusiness;
            return (
              <article key={item.id} className="rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--site-accent)]/15 text-[var(--site-accent)] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#706e6a]">
                      {item.startDate}{item.endDate || item.isCurrent ? ' — ' : ''}{item.isCurrent ? 'Present' : item.endDate || ''}
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-[#f1f2ed]">{item.title}</h3>
                    <p className="text-sm text-[#38bdf8]">{item.organization}</p>
                    {item.location && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#706e6a]">
                        <MapPin className="w-3 h-3" /> {item.location}
                      </p>
                    )}
                    {item.description && <p className="mt-3 text-sm leading-relaxed text-[#a8a6a1]">{item.description}</p>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
