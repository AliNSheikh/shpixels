import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import type { ClientLogo } from '../../types/content';

export function ClientLogos() {
  const { content } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const logos = (Array.isArray(content.clientLogos) ? content.clientLogos : [])
    .filter((item): item is ClientLogo => Boolean(item && typeof item === 'object'))
    .filter((item) => item.visible !== false && Boolean(String(item.logoUrl || item.logo || '').trim()))
    .sort((a, b) => (Number.isFinite(a.order) ? a.order! : 999) - (Number.isFinite(b.order) ? b.order! : 999));

  if (logos.length === 0) return null;

  const header = content.sectionHeaders?.brands || content.sectionHeaders?.clientlogos;
  const repeated = [...logos, ...logos];

  return (
    <section id="brands" className="relative py-14 sm:py-20 bg-[#141414] overflow-hidden border-y border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[var(--site-accent)] mb-2">
              {header?.badge || (isAr ? 'عملاء وشركاء' : 'CLIENTS & PARTNERS')}
            </p>
            <h2 className="text-3xl sm:text-5xl font-black text-[#f1f2ed] uppercase font-quicksand">
              {header?.title || (isAr ? 'العلامات التجارية' : 'BRANDS')}
            </h2>
          </div>
          {header?.description && (
            <p className="max-w-xl text-xs sm:text-sm text-[#a8a6a1] leading-relaxed">
              {header.description}
            </p>
          )}
        </div>
      </div>

      <div className="relative w-full overflow-hidden" aria-label={isAr ? 'شعارات العلامات التجارية' : 'Brand logos'}>
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-28 bg-gradient-to-r from-[#141414] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-28 bg-gradient-to-l from-[#141414] to-transparent" />

        <div className="animate-marquee flex items-center whitespace-nowrap py-2">
          {repeated.map((brand, index) => {
            const logoSrc = String(brand.logoUrl || brand.logo || '').trim();
            const website = String(brand.websiteUrl || brand.website || '').trim();
            const name = String(brand.name || 'Brand');
            const logo = (
              <div className="mx-7 sm:mx-12 flex h-14 sm:h-20 min-w-[120px] sm:min-w-[160px] items-center justify-center">
                <img
                  src={logoSrc}
                  alt={index >= logos.length ? '' : name}
                  aria-hidden={index >= logos.length ? true : undefined}
                  className="max-h-9 sm:max-h-12 max-w-[130px] sm:max-w-[180px] w-auto object-contain opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300"
                  loading="lazy"
                />
              </div>
            );

            return website && index < logos.length ? (
              <a
                key={`${brand.id}-${index}`}
                href={/^https?:\/\//i.test(website) ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
              >
                {logo}
              </a>
            ) : (
              <div key={`${brand.id}-${index}`} aria-hidden={index >= logos.length ? true : undefined}>
                {logo}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
