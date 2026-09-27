import { Quote, Star } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export function Testimonials() {
  const { content } = useContent();
  const testimonials = (content.testimonials || [])
    .filter((item) => item.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (testimonials.length === 0) return null;
  const header = content.sectionHeaders?.testimonials;

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-[#141414] border-t border-[#2b2b2b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--site-accent)]">
            {header?.badge || 'SOCIAL PROOF'}
          </p>
          <h2 className="mt-2 text-3xl sm:text-5xl font-black text-[#f1f2ed] font-quicksand uppercase">
            {header?.title || 'Client Testimonials'}
          </h2>
          {header?.description && <p className="mt-3 max-w-2xl text-sm text-[#a8a6a1]">{header.description}</p>}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((item) => (
            <article key={item.id} className="rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] p-5 sm:p-6">
              <Quote className="w-6 h-6 text-[var(--site-accent)]" />
              <p className="mt-4 text-sm leading-relaxed text-[#d7d6d2]">“{item.body}”</p>
              {item.rating && (
                <div className="flex items-center gap-1 mt-4">
                  {Array.from({ length: Math.max(0, Math.min(5, item.rating)) }).map((_, index) => (
                    <Star key={index} className="w-3.5 h-3.5 fill-current text-amber-400" />
                  ))}
                </div>
              )}
              <div className="mt-5 flex items-center gap-3">
                {item.avatar && <img src={item.avatar} alt={item.clientName} className="w-10 h-10 rounded-full object-cover" />}
                <div>
                  <div className="font-bold text-sm text-[#f1f2ed]">{item.clientName}</div>
                  <div className="text-xs text-[#706e6a]">
                    {[item.position, item.company].filter(Boolean).join(' • ')}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
