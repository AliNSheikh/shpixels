import { Sparkles, Video } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import { useLanguage } from '../../context/LanguageContext';

export function Showreel() {
  const { content } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  
  const videoId = content.hero.featuredVideoId;
  const headerInfo = content.sectionHeaders?.showreel || {
    badge: isAr ? 'عرض إخراجي حصري' : 'DIRECTOR SHOWCASE',
    title: isAr ? 'الشوريل السينمائي 2026' : 'THE 2026 VISUAL REEL',
    description: isAr 
      ? 'مزيج سريع ومبهر من الإعلانات التجارية الفاخرة، المشاهد الجوية بالدرون، وتصاميم الذكاء الاصطناعي والموشن جرافيكس.'
      : 'A fast-cut synthesis of commercial advertising, licensed drone aerials, sensitive healthcare portraits, and generative AI motion aesthetics.'
  };

  return (
    <section id="showreel" className="relative py-20 bg-[#171717] border-b border-[#2b2b2b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d1d1d] border border-[#2b2b2b] text-[11px] font-mono tracking-widest text-[#a8a6a1] uppercase mb-3">
              <Video className="w-3.5 h-3.5 text-[var(--site-accent)]" />
              <span>{headerInfo.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#f1f2ed] tracking-tight uppercase font-quicksand">
              {headerInfo.title}
            </h2>
          </div>
          <div className="text-sm sm:text-base text-[#a8a6a1] max-w-md">
            <p>{headerInfo.description}</p>
          </div>
        </div>

        {/* Featured Video Frame */}
        <div className="relative rounded-2xl p-1 bg-gradient-to-b from-[#2b2b2b] via-[#232323] to-[#171717] shadow-2xl">
          <YouTubeEmbed
            videoId={videoId}
            title={headerInfo.title || content.branding.siteName}
            lazyLoad={false}
            caption={content.showreel?.caption || ''}
          />
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {(content.showreel?.specs || []).map((spec, index) => <div key={index} className="p-4 rounded-xl bg-[#1d1d1d]">
            <p className="text-xs text-gray-400">{spec.label}</p><p>{spec.value}</p>
          </div>)}
        </div>
      </div>
    </section>
  );
}
