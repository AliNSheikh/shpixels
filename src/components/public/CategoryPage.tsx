import { ArrowLeft, FolderKanban, PlayCircle } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import { OptimizedImage } from '../common/OptimizedImage';

export function CategoryNotFound() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <main className="min-h-[80vh] pt-32 pb-20 bg-[#171717] flex items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--site-accent)]">
          {isAr ? 'التصنيف غير موجود' : 'CATEGORY NOT FOUND'}
        </p>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black text-[#f1f2ed] font-quicksand uppercase">
          {isAr ? 'تعذر العثور على هذا التصنيف' : 'This category is unavailable'}
        </h1>
        <a href="/#portfolio" className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--site-accent)] text-white text-xs font-bold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" />
          {isAr ? 'العودة إلى التصنيفات' : 'Back to Categories'}
        </a>
      </div>
    </main>
  );
}

export function CategoryPage({ category }: { category: string }) {
  const { content } = useContent();
  const { language, isRTL } = useLanguage();
  const isAr = language === 'ar';
  const detail = content.categoryDetails?.[category];

  const videos = [...(content.featuredVideos || [])]
    .filter((video) => video && video.visible !== false && video.category === category)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const label = isAr && detail?.nameAr ? detail.nameAr : category;
  const description = isAr ? (detail?.descriptionAr || detail?.description) : detail?.description;
  const cover = detail?.coverImage || videos.find((video) => video.thumbnail)?.thumbnail || '';

  return (
    <main className="min-h-screen pt-24 sm:pt-28 pb-16 bg-[#171717]">
      <section className="relative overflow-hidden border-b border-[#2b2b2b]">
        {cover && (
          <div className="absolute inset-0">
            <OptimizedImage src={cover} alt="" className="w-full h-full object-cover opacity-25 scale-105 blur-[1px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#171717]/75 via-[#171717]/90 to-[#171717]" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <a href="/#portfolio" className="inline-flex items-center gap-2 text-xs font-semibold text-[#a8a6a1] hover:text-[var(--site-accent)] transition-colors">
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {isAr ? 'جميع التصنيفات' : 'All Categories'}
          </a>

          <div className="mt-7 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d1d1d] border border-[#2b2b2b] text-[10px] font-mono uppercase tracking-[0.2em] text-[#a8a6a1]">
              <FolderKanban className="w-3.5 h-3.5 text-[var(--site-accent)]" />
              {isAr ? 'تصنيف الفيديو' : 'VIDEO CATEGORY'}
            </div>
            <h1 className="mt-4 text-3xl sm:text-6xl font-black text-[#f1f2ed] font-quicksand uppercase tracking-tight">
              {label}
            </h1>
            {description && (
              <p className="mt-4 max-w-2xl text-sm sm:text-lg text-[#a8a6a1] leading-relaxed">
                {description}
              </p>
            )}
            <p className="mt-5 text-xs font-mono uppercase tracking-wider text-[#706e6a]">
              {videos.length} {isAr ? 'فيديو' : videos.length === 1 ? 'video' : 'videos'}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {videos.length === 0 ? (
          <div className="rounded-2xl border border-[#2b2b2b] bg-[#1d1d1d] p-10 text-center text-sm text-[#a8a6a1]">
            {isAr ? 'لا توجد فيديوهات في هذا التصنيف حالياً.' : 'There are no videos in this category yet.'}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
            {videos.map((video) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] shadow-md"
              >
                <YouTubeEmbed
                  videoId={video.videoId || video.youtubeUrl}
                  title={video.title || label}
                  lazyLoad
                />

                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-8 h-8 rounded-full bg-[var(--site-accent)]/15 text-[var(--site-accent)] flex items-center justify-center shrink-0">
                      <PlayCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-[#f1f2ed] font-quicksand">
                        {video.title || (isAr ? 'فيديو YouTube' : 'YouTube Video')}
                      </h2>
                      {video.client && (
                        <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-[#706e6a]">
                          {video.client}
                        </p>
                      )}
                      {video.description && (
                        <p className="mt-2 text-xs sm:text-sm text-[#a8a6a1] leading-relaxed">
                          {video.description}
                        </p>
                      )}
                      {video.caption && (
                        <p className="mt-2 text-[11px] text-[#706e6a]">{video.caption}</p>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
