import { useMemo } from 'react';
import { ArrowRight, FolderKanban, Images } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { getCategoryPath } from '../../utils/projectRoutes';
import { useLanguage } from '../../context/LanguageContext';
import { OptimizedImage } from '../common/OptimizedImage';

export function Portfolio() {
  const { content, categories: contextCategories, categoryDetails } = useContent();
  const { language, t, isRTL } = useLanguage();
  const isAr = language === 'ar';

  const publishedProjects = useMemo(
    () => (Array.isArray(content.projects) ? content.projects : [])
      .filter((project) => project?.published)
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    [content.projects]
  );

  const categories = useMemo(() => {
    const ordered: string[] = [];
    const seen = new Set<string>();
    const add = (value: unknown) => {
      const name = String(value || '').trim();
      const key = name.toLowerCase();
      if (!name || seen.has(key)) return;
      seen.add(key);
      ordered.push(name);
    };

    (Array.isArray(contextCategories) ? contextCategories : []).forEach(add);
    publishedProjects.forEach((project) => add(project.category));
    return ordered;
  }, [contextCategories, publishedProjects]);

  const categoryCards = useMemo(
    () => categories.map((category) => {
      const projects = publishedProjects.filter((project) => project.category === category);
      const detail = categoryDetails?.[category];
      return {
        category,
        projects,
        detail,
        coverImage: detail?.coverImage || projects.find((project) => project.coverImage)?.coverImage || ''
      };
    }).filter((item) => item.projects.length > 0 || item.detail),
    [categories, publishedProjects, categoryDetails]
  );

  const getCategoryLabel = (category: string) => {
    if (!isAr) return category;
    return categoryDetails?.[category]?.nameAr || category;
  };

  const sectionBadge = content.sectionHeaders?.portfolio?.badge || t('portfolio.badge', 'PORTFOLIO CATEGORIES');
  const sectionTitle = content.sectionHeaders?.portfolio?.title || t('portfolio.title', 'FEATURED PORTFOLIO');
  const sectionDesc = content.sectionHeaders?.portfolio?.description || t(
    'portfolio.desc',
    'Explore the portfolio by category. Open any category to view all published projects inside it.'
  );

  return (
    <section id="portfolio" className="relative py-16 sm:py-24 bg-[#171717]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d1d1d] border border-[#2b2b2b] text-[10px] sm:text-[11px] font-mono tracking-widest text-[#a8a6a1] uppercase mb-3">
              <FolderKanban className="w-3.5 h-3.5 text-[var(--site-accent)]" />
              <span>{sectionBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-5xl font-black text-[#f1f2ed] tracking-tight uppercase font-quicksand">
              {sectionTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-base text-[#a8a6a1] max-w-md leading-relaxed">
            {sectionDesc}
          </p>
        </div>

        {categoryCards.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] text-[#a8a6a1]">
            <p className="text-xs sm:text-sm">{t('portfolio.empty', 'No portfolio categories are available yet.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {categoryCards.map(({ category, projects, detail, coverImage }) => (
              <article
                key={category}
                className="group overflow-hidden rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[var(--site-accent)]/60 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-[var(--site-accent)]/10"
              >
                <a href={getCategoryPath(category)} className="block focus:outline-none focus:ring-2 focus:ring-[var(--site-accent)]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#141414]">
                    {coverImage ? (
                      <OptimizedImage
                        src={coverImage}
                        alt={getCategoryLabel(category)}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.18),transparent_70%)]">
                        <Images className="w-10 h-10 text-[var(--site-accent)]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute left-3 bottom-3 right-3 sm:left-4 sm:bottom-4 sm:right-4 flex items-end justify-between gap-2 sm:gap-3">
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#c8c8c8]">
                          {projects.length} {isAr ? 'مشروع' : projects.length === 1 ? 'project' : 'projects'}
                        </p>
                        <h3 className="mt-1 text-sm sm:text-xl font-black text-white font-quicksand uppercase leading-tight">
                          {getCategoryLabel(category)}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-5">
                    {(isAr ? detail?.descriptionAr : detail?.description) && (
                      <p className="text-xs sm:text-sm text-[#a8a6a1] leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {isAr ? detail?.descriptionAr : detail?.description}
                      </p>
                    )}
                    <span className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--site-accent)]">
                      {isAr ? 'عرض المشاريع' : 'View Projects'}
                      <ArrowRight className={`w-4 h-4 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                    </span>
                  </div>
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
