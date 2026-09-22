import { useState } from 'react';
import { Play, ArrowRight, Sparkles, X, Image as ImageIcon } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import { useLanguage } from '../../context/LanguageContext';
import { EditableText } from '../live-editor/EditableText';
import { EditableImage } from '../live-editor/EditableImage';
import { SectionQuickActions } from '../live-editor/SectionQuickActions';

export function Hero() {
  const { content, updateHero, isLiveEditMode } = useContent();
  const { language, t, isRTL } = useLanguage();
  const isAr = language === 'ar';
  const [showreelModalOpen, setShowreelModalOpen] = useState(false);

  const hero = content.hero;
  const marqueeList = isAr
    ? ['إعلانات تجارية', 'ذكاء اصطناعي وموشن', 'أعراس وفعاليات فاخرة', 'تصوير جوي 4K درون', 'تلوين سينمائي']
    : (hero.marqueeItems && hero.marqueeItems.length > 0
        ? hero.marqueeItems
        : ['COMMERCIAL ADS', 'AI MOTION GRAPHICS', 'WEDDINGS & EVENTS', 'DRONE 4K', 'COLOR GRADING']);

  return (
    <section id="hero" className="relative min-h-[90vh] lg:min-h-screen flex flex-col justify-between pt-24 sm:pt-28 pb-10 overflow-hidden bg-[#171717]">
      {/* Quick Section Actions floating in live edit mode */}
      <SectionQuickActions
        sectionKey="hero"
        title="Hero Section"
        titleAr="قسم البداية (Hero)"
        badge={hero.badgeText}
        headerTitle={hero.title}
        headerDescription={hero.subtitle}
        onUpdateHeader={(badge, title, desc) => {
          updateHero({ badgeText: badge, title, subtitle: desc });
        }}
      />

      {/* Background Ambient Imagery & Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src={hero.bgImageUrl}
          alt="Cinematography backdrop"
          className="w-full h-full object-cover object-center opacity-20 scale-105 filter blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#171717]/80 via-[#171717]/85 to-[#171717]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(148,30,51,0.15)_0%,transparent_70%)]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#232323_1px,transparent_1px),linear-gradient(to_bottom,#232323_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      {/* Change Hero Background button in Live Edit Mode */}
      {isLiveEditMode && (
        <div className={`absolute top-20 ${isAr ? 'left-6' : 'right-6'} z-30`}>
          <EditableImage
            src={hero.bgImageUrl}
            onSave={(newUrl) => updateHero({ bgImageUrl: newUrl })}
            label={isAr ? 'صورة خلفية الهيرو' : 'Hero Background Image'}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181818]/90 hover:bg-[#252525] text-xs font-mono text-[#a8a6a1] hover:text-white border border-[#333] shadow-xl cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#941e33]" />
              <span>{isAr ? 'تغيير صورة الخلفية' : 'Change Background'}</span>
            </button>
          </EditableImage>
        </div>
      )}

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto w-full text-center">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#1d1d1d]/90 border border-[#2b2b2b] shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#941e33] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#a8a6a1] font-mono">
              <EditableText
                value={hero.badgeText || (isAr ? 'مخرج سينمائي ومصمم موشن جرافيكس' : 'VIDEOGRAPHER & CREATIVE DIRECTOR')}
                onSave={(val) => updateHero({ badgeText: val })}
                label={isAr ? 'شارة الهيرو' : 'Hero Badge'}
              />
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#b8283f]" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[#f1f2ed] uppercase font-quicksand leading-[1.08]">
            <EditableText
              value={hero.title || (isAr ? 'سرد بصري استثنائي برؤية سينمائية' : 'VISUAL STORYTELLING THROUGH CINEMATIC MOTION')}
              onSave={(val) => updateHero({ title: val })}
              multiline
              label={isAr ? 'العنوان الرئيسي' : 'Main Headline'}
            />
          </h1>

          {/* Subtitle */}
          <div className="text-sm sm:text-lg md:text-xl text-[#a8a6a1] max-w-2xl mx-auto font-normal leading-relaxed">
            <EditableText
              value={hero.subtitle || (isAr 
                ? 'أكثر من 7 سنوات في إخراج وتصوير الإعلانات التجارية الفاخرة، الأفلام الوثائقية، وأحدث تقنيات الذكاء الاصطناعي والموشن جرافيكس بدقة 4K.' 
                : '7+ years crafting high-impact commercial ads, emotionally resonant wedding films, healthcare storytelling, and cutting-edge AI motion graphics.')}
              onSave={(val) => updateHero({ subtitle: val })}
              multiline
              label={isAr ? 'الوصف الفرعي' : 'Hero Subtitle'}
            />
          </div>

          {/* Call to Actions */}
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
            <a
              id="hero-primary-cta"
              href={hero.primaryCtaLink || '#portfolio'}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-8 py-3 sm:py-4 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase text-white bg-[#941e33] hover:bg-[#b8283f] transition-all duration-300 shadow-xl hover:shadow-[#941e33]/30 border border-[#b8283f]/50 group cursor-pointer"
            >
              <span>
                <EditableText
                  value={hero.primaryCtaText || t('hero.explore', 'Explore Portfolio')}
                  onSave={(val) => updateHero({ primaryCtaText: val })}
                  label={isAr ? 'زر الاستكشاف' : 'Primary CTA'}
                />
              </span>
              <ArrowRight className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
            </a>

            <button
              id="hero-watch-showreel-btn"
              onClick={() => setShowreelModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-7 py-3 sm:py-4 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#f1f2ed] hover:text-white bg-[#1d1d1d] hover:bg-[#232323] transition-all duration-200 border border-[#2b2b2b] shadow-md group cursor-pointer"
            >
              <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-[#941e33] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Play className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-current translate-x-0.5" />
              </div>
              <span>
                <EditableText
                  value={hero.secondaryCtaText || t('hero.showreel', '2026 Showreel')}
                  onSave={(val) => updateHero({ secondaryCtaText: val })}
                  label={isAr ? 'زر الشوريل' : 'Showreel CTA'}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="relative z-10 w-full overflow-hidden border-y border-[#2b2b2b] bg-[#111111]/70 backdrop-blur-sm py-2.5 sm:py-3 mt-8">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueeList, ...marqueeList, ...marqueeList, ...marqueeList].map((item, idx) => (
            <span
              key={idx}
              className="mx-4 sm:mx-6 text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#706e6a] uppercase flex items-center gap-3"
            >
              <span>{item}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#941e33]" />
            </span>
          ))}
        </div>
      </div>

      {/* Showreel Modal */}
      {showreelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden bg-[#171717] border border-[#2b2b2b] shadow-2xl space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b2b2b]">
              <div>
                <h3 className="text-lg font-bold text-[#f1f2ed] uppercase font-quicksand">
                  {isAr ? 'العرض السينمائي الترويجي المجمع' : 'Official Director Showreel'}
                </h3>
                <p className="text-xs text-[#a8a6a1] font-mono">MOGRAFIX — Cinematography & AI Visuals</p>
              </div>
              <button
                onClick={() => setShowreelModalOpen(false)}
                className="p-2 rounded-full text-[#a8a6a1] hover:text-white hover:bg-[#232323] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-[#2b2b2b]">
              <YouTubeEmbed
                videoId={hero.featuredVideoId || 'dQw4w9WgXcQ'}
                title="Mografix Showreel"
                autoplay
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
