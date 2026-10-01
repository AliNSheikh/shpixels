import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import type { ClientLogo } from '../../types/content';

function balanceLogoRows(logos: ClientLogo[]): ClientLogo[][] {
  if (logos.length <= 7) return [logos];

  const firstRow: ClientLogo[] = [];
  const secondRow: ClientLogo[] = [];

  logos.forEach((logo, index) => {
    (index % 2 === 0 ? firstRow : secondRow).push(logo);
  });

  return [firstRow, secondRow];
}

function buildLoopRow(logos: ClientLogo[]): ClientLogo[] {
  if (logos.length === 0) return [];

  const cycleLength = Math.max(7, logos.length);
  const cycle = Array.from({ length: cycleLength }, (_, index) => logos[index % logos.length]);

  return [...cycle, ...cycle];
}

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
  const rows = balanceLogoRows(logos);

  return (
    <section id="brands" className="relative py-10 sm:py-14 bg-[#141414] overflow-hidden border-y border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
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

      <div
        className="relative w-full overflow-hidden space-y-1 sm:space-y-1.5"
        aria-label={isAr ? 'شعارات العلامات التجارية' : 'Brand logos'}
      >
        {rows.map((row, rowIndex) => {
          const loopLogos = buildLoopRow(row);
          const cycleLength = loopLogos.length / 2;

          return (
            <div
              key={`brand-row-${rowIndex}`}
              className={rowIndex === 0 ? 'animate-marquee flex items-center whitespace-nowrap py-1' : 'animate-marquee-reverse flex items-center whitespace-nowrap py-1'}
            >
              {loopLogos.map((brand, index) => {
                const logoSrc = String(brand.logoUrl || brand.logo || '').trim();
                const website = String(brand.websiteUrl || brand.website || '').trim();
                const name = String(brand.name || 'Brand');
                const isDuplicateCycle = index >= cycleLength;

                const logo = (
                  <div className="flex h-20 sm:h-24 lg:h-28 w-[36vw] sm:w-[22vw] lg:w-[14.285vw] max-w-[240px] min-w-[112px] items-center justify-center px-1 sm:px-1.5 lg:px-2">
                    <img
                      src={logoSrc}
                      alt={isDuplicateCycle ? '' : name}
                      aria-hidden={isDuplicateCycle ? true : undefined}
                      className="max-h-14 sm:max-h-[4.5rem] lg:max-h-20 max-w-[96%] w-auto object-contain opacity-95 hover:opacity-100 hover:scale-[1.04] transition-all duration-300"
                      loading="lazy"
                    />
                  </div>
                );

                return website && !isDuplicateCycle ? (
                  <a
                    key={`${brand.id}-${rowIndex}-${index}`}
                    href={/^https?:\/\//i.test(website) ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="shrink-0"
                  >
                    {logo}
                  </a>
                ) : (
                  <div
                    key={`${brand.id}-${rowIndex}-${index}`}
                    className="shrink-0"
                    aria-hidden={isDuplicateCycle ? true : undefined}
                  >
                    {logo}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
