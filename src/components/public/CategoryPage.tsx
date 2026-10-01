import { ArrowLeft, ArrowRight, FolderKanban, Sparkles } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { getProjectPath } from '../../utils/projectRoutes';
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
          {isAr ? 'العودة إلى الأعمال' : 'Back to Portfolio'}
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
  const projects = (Array.isArray(content.projects) ? content.projects : [])
    .filter((project) => project?.published && project.category === category)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const label = isAr && detail?.nameAr ? detail.nameAr : category;
  const description = isAr ? (detail?.descriptionAr || detail?.description) : detail?.description;
  const cover = detail?.coverImage || projects.find((project) => project.coverImage)?.coverImage || '';

  return (
    <main className="min-h-screen pt-24 sm:pt-28 pb-20 bg-[#171717]">
      <section className="relative overflow-hidden border-b border-[#2b2b2b]">
        {cover && (
          <div className="absolute inset-0">
            <OptimizedImage src={cover} alt="" className="w-full h-full object-cover opacity-25 scale-105 blur-[1px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#171717]/75 via-[#171717]/90 to-[#171717]" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <a href="/#portfolio" className="inline-flex items-center gap-2 text-xs font-semibold text-[#a8a6a1] hover:text-[var(--site-accent)] transition-colors">
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {isAr ? 'جميع التصنيفات' : 'All Categories'}
          </a>

          <div className="mt-8 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d1d1d] border border-[#2b2b2b] text-[10px] font-mono uppercase tracking-[0.2em] text-[#a8a6a1]">
              <FolderKanban className="w-3.5 h-3.5 text-[var(--site-accent)]" />
              {isAr ? 'تصنيف الأعمال' : 'PORTFOLIO CATEGORY'}
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
              {projects.length} {isAr ? 'مشروع منشور' : projects.length === 1 ? 'published project' : 'published projects'}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-[#2b2b2b] bg-[#1d1d1d] p-10 text-center text-sm text-[#a8a6a1]">
            {isAr ? 'لا توجد مشاريع منشورة في هذا التصنيف حالياً.' : 'There are no published projects in this category yet.'}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project) => (
              <a
                key={project.id}
                href={getProjectPath(project)}
                className="group overflow-hidden rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[var(--site-accent)]/60 transition-all duration-300 shadow-md hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#141414]">
                  <OptimizedImage
                    src={project.coverImage}
                    alt={project.title}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  {project.featured && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[var(--site-accent)] text-white flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#706e6a]">
                    {[project.client, project.year].filter(Boolean).join(' • ')}
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-[#f1f2ed] font-quicksand group-hover:text-[var(--site-accent)] transition-colors">
                    {project.title}
                  </h2>
                  {project.description && (
                    <p className="mt-2 text-xs sm:text-sm text-[#a8a6a1] leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--site-accent)]">
                    {isAr ? 'عرض المشروع' : 'View Project'}
                    <ArrowRight className={`w-4 h-4 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
