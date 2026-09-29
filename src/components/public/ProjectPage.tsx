import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ExternalLink,
  Github,
  Home,
  Images,
  Tag,
  User
} from 'lucide-react';
import { ProjectItem } from '../../types/content';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { getProjectPath } from '../../utils/projectRoutes';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import { OptimizedImage } from '../common/OptimizedImage';

interface ProjectPageProps {
  project: ProjectItem;
}

export function ProjectPage({ project }: ProjectPageProps) {
  const { content } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const publishedProjects = [...(content.projects || [])]
    .filter((item) => item.published)
    .sort((a, b) => a.order - b.order);

  const currentIndex = publishedProjects.findIndex((item) => item.id === project.id);
  const previousProject = currentIndex > 0 ? publishedProjects[currentIndex - 1] : null;
  const nextProject = currentIndex >= 0 && currentIndex < publishedProjects.length - 1
    ? publishedProjects[currentIndex + 1]
    : null;

  const relatedProjects = publishedProjects
    .filter((item) => item.id !== project.id && item.category === project.category)
    .slice(0, 3);

  return (
    <main className="pt-24 sm:pt-28 pb-16 bg-[#171717] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-mono text-[#706e6a] mb-6">
          <a href="/" className="inline-flex items-center gap-1.5 hover:text-[#f1f2ed] transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>{isAr ? 'الرئيسية' : 'Home'}</span>
          </a>
          <span>/</span>
          <a href="/#portfolio" className="hover:text-[#f1f2ed] transition-colors">
            {isAr ? 'الأعمال' : 'Portfolio'}
          </a>
          <span>/</span>
          <span className="text-[#a8a6a1]">{project.title}</span>
        </nav>

        <section className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7 space-y-5">
            <div className="relative aspect-[16/10] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#111] border border-[#2b2b2b] shadow-2xl">
              <OptimizedImage
                src={project.coverImage}
                alt={project.title}
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute left-4 right-4 bottom-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase text-white">
                  {project.category}
                </span>
                {project.featured && (
                  <span className="px-3 py-1 rounded-full bg-[var(--site-accent)] text-[10px] font-mono uppercase text-white">
                    {isAr ? 'مشروع مميز' : 'Featured'}
                  </span>
                )}
              </div>
            </div>

            {project.videos?.length > 0 && (
              <div className="space-y-5">
                {project.videos.map((video, index) => (
                  <div key={video.id || index} className="space-y-2">
                    {(video.title || video.caption) && (
                      <div>
                        {video.title && <h2 className="text-base sm:text-lg font-bold text-[#f1f2ed]">{video.title}</h2>}
                        {video.caption && <p className="mt-1 text-xs text-[#706e6a]">{video.caption}</p>}
                      </div>
                    )}
                    <YouTubeEmbed
                      videoId={video.videoId || video.youtubeUrl}
                      title={video.title || project.title}
                      caption={video.caption}
                      lazyLoad={index > 0}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d1d1d] border border-[#2b2b2b] text-[10px] font-mono uppercase tracking-widest text-[#38bdf8]">
                <Tag className="w-3 h-3" />
                {project.category}
              </div>
              <h1 className="mt-4 text-3xl sm:text-5xl font-black font-quicksand tracking-tight text-[#f1f2ed]">
                {project.title}
              </h1>
              {project.description && (
                <p className="mt-5 text-sm sm:text-base leading-7 text-[#a8a6a1] whitespace-pre-line">
                  {project.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {project.client && (
                <div className="rounded-xl bg-[#1d1d1d] border border-[#2b2b2b] p-4">
                  <User className="w-4 h-4 text-[var(--site-accent)]" />
                  <div className="mt-2 text-[10px] font-mono uppercase text-[#706e6a]">{isAr ? 'العميل' : 'Client'}</div>
                  <div className="mt-1 text-xs sm:text-sm font-semibold text-[#f1f2ed]">{project.client}</div>
                </div>
              )}
              {(project.completionDate || project.year) && (
                <div className="rounded-xl bg-[#1d1d1d] border border-[#2b2b2b] p-4">
                  <Calendar className="w-4 h-4 text-[var(--site-accent)]" />
                  <div className="mt-2 text-[10px] font-mono uppercase text-[#706e6a]">{isAr ? 'التاريخ' : 'Completed'}</div>
                  <div className="mt-1 text-xs sm:text-sm font-semibold text-[#f1f2ed]">
                    {project.completionDate || project.year}
                  </div>
                </div>
              )}
            </div>

            {project.techStack && project.techStack.length > 0 && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#706e6a] mb-2">
                  {isAr ? 'التقنيات / الكلمات المفتاحية' : 'Tech Stack / Tags'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-[#232323] border border-[#2b2b2b] text-xs text-[#d7d6d2]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(project.liveUrl || project.githubUrl || project.externalLinks?.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--site-accent)] text-white text-xs font-semibold"
                  >
                    {isAr ? 'زيارة المشروع' : 'Visit Live Project'}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-[#f1f2ed] text-xs font-semibold"
                  >
                    GitHub
                    <Github className="w-3.5 h-3.5" />
                  </a>
                )}
                {(project.externalLinks || []).map((link, index) => (
                  <a
                    key={`${link.url}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-[#f1f2ed] text-xs font-semibold"
                  >
                    {link.label}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            )}

            <a
              href="/#portfolio"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#38bdf8] hover:text-white transition-colors"
            >
              <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              {isAr ? 'العودة إلى جميع الأعمال' : 'Back to all projects'}
            </a>
          </aside>
        </section>

        {project.gallery && project.gallery.length > 0 && (
          <section className="mt-14 sm:mt-20">
            <div className="flex items-center gap-2 mb-5">
              <Images className="w-5 h-5 text-[var(--site-accent)]" />
              <h2 className="text-xl sm:text-2xl font-black font-quicksand uppercase text-[#f1f2ed]">
                {isAr ? 'معرض المشروع' : 'Project Gallery'}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
              {project.gallery.map((image, index) => (
                <div key={`${image}-${index}`} className="aspect-[4/3] overflow-hidden rounded-xl sm:rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b]">
                  <OptimizedImage
                    src={image}
                    alt={`${project.title} gallery ${index + 1}`}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedProjects.length > 0 && (
          <section className="mt-14 sm:mt-20 pt-10 border-t border-[#2b2b2b]">
            <h2 className="text-xl sm:text-2xl font-black font-quicksand uppercase text-[#f1f2ed] mb-5">
              {isAr ? 'أعمال ذات صلة' : 'Related Projects'}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedProjects.map((item) => (
                <a
                  key={item.id}
                  href={getProjectPath(item)}
                  className="group rounded-2xl overflow-hidden bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[var(--site-accent)]/60 transition-colors"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <OptimizedImage
                      src={item.coverImage}
                      alt={item.title}
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] font-mono uppercase text-[#706e6a]">{item.category}</div>
                    <h3 className="mt-1 font-bold text-[#f1f2ed] group-hover:text-[#38bdf8] transition-colors">{item.title}</h3>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <nav className="mt-14 sm:mt-20 pt-6 border-t border-[#2b2b2b] grid sm:grid-cols-2 gap-3">
          {previousProject ? (
            <a href={getProjectPath(previousProject)} className="rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] p-4 hover:border-[var(--site-accent)]/50 transition-colors">
              <div className="text-[10px] font-mono uppercase text-[#706e6a]">{isAr ? 'المشروع السابق' : 'Previous project'}</div>
              <div className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-[#f1f2ed]">
                <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                {previousProject.title}
              </div>
            </a>
          ) : <div />}

          {nextProject && (
            <a href={getProjectPath(nextProject)} className="rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] p-4 hover:border-[var(--site-accent)]/50 transition-colors sm:text-right">
              <div className="text-[10px] font-mono uppercase text-[#706e6a]">{isAr ? 'المشروع التالي' : 'Next project'}</div>
              <div className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-[#f1f2ed]">
                {nextProject.title}
                <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </div>
            </a>
          )}
        </nav>
      </div>
    </main>
  );
}

export function ProjectNotFound() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <main className="min-h-[75vh] pt-32 pb-20 flex items-center justify-center bg-[#171717]">
      <div className="max-w-lg text-center px-6">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#706e6a]">404 / Project</div>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black font-quicksand text-[#f1f2ed]">
          {isAr ? 'المشروع غير موجود' : 'Project not found'}
        </h1>
        <p className="mt-4 text-sm text-[#a8a6a1]">
          {isAr
            ? 'ربما تم تغيير رابط المشروع أو إلغاء نشره. يمكنك العودة إلى الصفحة الرئيسية أو تصفح جميع الأعمال.'
            : 'The project URL may have changed or the project may no longer be published. Return home or browse the portfolio.'}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--site-accent)] text-white text-xs font-semibold">
            <Home className="w-4 h-4" />
            {isAr ? 'الرئيسية' : 'Home'}
          </a>
          <a href="/#portfolio" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-[#f1f2ed] text-xs font-semibold">
            {isAr ? 'عرض الأعمال' : 'View Portfolio'}
          </a>
        </div>
      </div>
    </main>
  );
}
