import { useEffect, useState } from 'react';
import { Play, ArrowRight, Sparkles, X } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type { ClientLogo } from '../../types/content';

export function Hero() {
  const { content } = useContent();
  const { language, t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const isAr = language === 'ar';
  const [showreelModalOpen, setShowreelModalOpen] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);

  const hero = content.hero;
  const typingStrings = (Array.isArray(hero.typingStrings) ? hero.typingStrings : [])
    .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
  const brandLogos = (Array.isArray(content.clientLogos) ? content.clientLogos : [])
    .filter((brand): brand is ClientLogo => Boolean(brand && typeof brand === 'object'))
    .filter((brand) => brand.visible !== false && Boolean(String(brand.logoUrl || brand.logo || '').trim()))
    .sort((a, b) => (Number.isFinite(a.order) ? a.order! : 999) - (Number.isFinite(b.order) ? b.order! : 999));

  useEffect(() => {
    if (typingStrings.length <= 1) return;
    const timer = window.setInterval(() => {
      setTypingIndex((index) => (index + 1) % typingStrings.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [typingStrings.length]);

  return (
    <section id="hero" className="relative min-h-[90vh] lg:min-h-screen flex flex-col justify-between pt-24 sm:pt-28 pb-10 overflow-hidden bg-[#171717]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {hero.backgroundType === 'video' && hero.backgroundVideoUrl ? (
          <video src={hero.backgroundVideoUrl} autoPlay muted loop playsInline poster={hero.bgImageUrl} className="w-full h-full object-cover object-center opacity-20 scale-105" />
        ) : (
          <img src={hero.bgImageUrl} alt="Cinematography backdrop" className="w-full h-full object-cover object-center opacity-20 scale-105 filter blur-[1px]" />
        )}
        <div className={`absolute inset-0 bg-gradient-to-b ${theme === 'light' ? 'from-[#f7f8f5]/75 via-[#f7f8f5]/85 to-[#f7f8f5]' : 'from-[#171717]/80 via-[#171717]/85 to-[#171717]'}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.16)_0%,transparent_70%)]" />
        <div className={`absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-20 ${theme === 'light' ? 'bg-[linear-gradient(to_right,#dfe3db_1px,transparent_1px),linear-gradient(to_bottom,#dfe3db_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#232323_1px,transparent_1px),linear-gradient(to_bottom,#232323_1px,transparent_1px)]'}`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto w-full text-center">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#1d1d1d]/90 border border-[#2b2b2b] shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--site-accent)] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#a8a6a1] font-mono">
              {hero.badgeText || (isAr ? 'شريف عبس • مخرج سينمائي ومصور محترف' : 'SHARIF ABS • CINEMATOGRAPHER & DIRECTOR')}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
          </div>

          <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[#f1f2ed] uppercase font-quicksand leading-[1.08]">
            {hero.title || (isAr ? 'سرد بصري استثنائي برؤية سينمائية' : 'VISUAL STORYTELLING THROUGH CINEMATIC MOTION')}
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-[#a8a6a1] max-w-2xl mx-auto font-normal leading-relaxed">
            {hero.subtitle || (isAr ? 'شريف عبس — إخراج وتصوير الإعلانات التجارية الفاخرة، الأفلام الوثائقية، والأعمال السينمائية بدقة 4K.' : 'Sharif Abs crafting high-impact commercial ads, emotionally resonant wedding films, luxury visuals, and cutting-edge cinematography.')}
          </p>

          {typingStrings.length > 0 && (
            <div className="h-7 flex items-center justify-center">
              <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.18em] text-[#38bdf8] transition-all">
                {typingStrings[Math.min(typingIndex, typingStrings.length - 1)]}
              </span>
            </div>
          )}

          <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
            <a id="hero-primary-cta" href={hero.primaryCtaLink || '#portfolio'} className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-8 py-3 sm:py-4 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase text-white bg-[var(--site-accent)] hover:bg-[#3b82f6] transition-all duration-300 shadow-xl hover:shadow-[var(--site-accent)]/30 border border-[#3b82f6]/50 group cursor-pointer">
              <span>{hero.primaryCtaText || t('hero.explore', 'Explore Portfolio')}</span>
              <ArrowRight className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
            </a>

            <button id="hero-watch-showreel-btn" onClick={() => { if (hero.secondaryCtaLink && hero.secondaryCtaLink !== '#showreel' && /^(https?:\/\/|#|\/(?!\/))/.test(hero.secondaryCtaLink)) window.location.assign(hero.secondaryCtaLink); else setShowreelModalOpen(true); }} className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-7 py-3 sm:py-4 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#f1f2ed] hover:text-white bg-[#1d1d1d] hover:bg-[#232323] transition-all duration-200 border border-[#2b2b2b] shadow-md group cursor-pointer">
              <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-[var(--site-accent)] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Play className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-current translate-x-0.5" />
              </div>
              <span>{hero.secondaryCtaText || t('hero.showreel', '2026 Showreel')}</span>
            </button>
          </div>
        </div>
      </div>

      {brandLogos.length > 0 && (
        <div className="relative z-10 w-full overflow-hidden border-y border-[#2b2b2b] bg-[#111111]/70 backdrop-blur-sm py-3 sm:py-4 mt-8">
          <div className="flex items-center whitespace-nowrap animate-marquee">
            {[...brandLogos, ...brandLogos, ...brandLogos, ...brandLogos].map((brand, idx) => {
              const logoSrc = String(brand.logoUrl || brand.logo || '');
              const website = String(brand.websiteUrl || brand.website || '');
              const name = String(brand.name || 'Brand');
              const inner = (
                <div className="brand-marquee-logo-wrap mx-3 sm:mx-5 h-12 sm:h-14 min-w-[120px] sm:min-w-[150px] px-5 rounded-xl border border-[#2b2b2b] bg-[#1d1d1d] flex items-center justify-center transition-all duration-200 hover:border-[var(--site-accent)]/60 hover:-translate-y-0.5">
                  <img src={logoSrc} alt={name} className="max-h-7 sm:max-h-8 max-w-[110px] sm:max-w-[140px] w-auto object-contain [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.18))]" loading="lazy" />
                </div>
              );

              return website ? (
                <a key={`${brand.id}-${idx}`} href={website} target="_blank" rel="noopener noreferrer" aria-label={name}>{inner}</a>
              ) : (
                <div key={`${brand.id}-${idx}`} aria-label={name}>{inner}</div>
              );
            })}
          </div>
        </div>
      )}

      {showreelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden bg-[#171717] border border-[#2b2b2b] shadow-2xl space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b2b2b]">
              <div>
                <h3 className="text-lg font-bold text-[#f1f2ed] uppercase font-quicksand">{isAr ? 'العرض السينمائي الترويجي المجمع' : 'Official Director Showreel'}</h3>
                <p className="text-xs text-[#a8a6a1] font-mono">{content.branding.siteName}</p>
              </div>
              <button onClick={() => setShowreelModalOpen(false)} className="p-2 rounded-full text-[#a8a6a1] hover:text-white hover:bg-[#232323] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-[#2b2b2b]">
              <YouTubeEmbed videoId={hero.featuredVideoId || 'ScMzIvxBSi4'} title={`${content.branding.siteName} Showreel`} autoplay />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
