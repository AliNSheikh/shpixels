import { FolderKanban, Video, Image, Eye, Plus, Download, Globe, Sparkles, Zap, Tag, Layers } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';

interface DashboardHomeProps {
  onNavigate: (tab: string) => void;
  onNewProject: () => void;
}

export function DashboardHome({ onNavigate, onNewProject }: DashboardHomeProps) {
  const { content, exportJson, setIsAdminView } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const totalProjects = content.projects.length;
  const publishedProjects = content.projects.filter((p) => p.published).length;
  const hiddenProjects = totalProjects - publishedProjects;
  
  const totalProjectVideos = content.projects.reduce((acc, p) => acc + (p.videos?.length || 0), 0);
  const totalVideos = totalProjectVideos + (content.featuredVideos?.length || 0) + 1;

  const totalGalleryImages = (content.gallery?.length || 0) + content.projects.reduce((acc, p) => acc + (p.gallery?.length || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#1d1d1d] via-[#232323] to-[#1d1d1d] border border-[#2b2b2b] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#941e33]/20 border border-[#941e33]/40 text-xs font-mono uppercase text-[#b8283f]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'محرك إدارة محتوى MOGRAFIX' : 'MOGRAFIX Content Engine'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#f1f2ed] font-quicksand uppercase">
            {isAr ? 'لوحة القيادة ونظرة عامة' : 'Content Management Overview'}
          </h1>
          <p className="text-xs sm:text-sm text-[#a8a6a1] max-w-xl">
            {isAr 
              ? 'إدارة متكاملة لمشاريع الفيديو، رفع صور الأغلفة واللقطات مباشرة من سطح المكتب، ضبط معرفات YouTube بدقة 4K، وتحديث إعدادات أرشفة Google وخريطة الموقع sitemap.xml.' 
              : 'Manage your videography portfolio, YouTube embeds, direct desktop image uploads, client links, and SEO settings. All updates persist in real-time to the codebase.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAdminView(false)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#232323] hover:bg-[#2b2b2b] text-xs font-semibold text-[#f1f2ed] border border-[#2b2b2b] transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#941e33]" />
            <span>{isAr ? 'مشاهدة الموقع العام' : 'View Public Website'}</span>
          </button>
          <button
            onClick={exportJson}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#941e33] hover:bg-[#b8283f] text-xs font-semibold text-white transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تصدير JSON' : 'Export Content'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row: 2-COLUMN ON MOBILE, 4-COLUMN ON LARGER SCREENS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div
          onClick={() => onNavigate('projects')}
          className="p-4 sm:p-5 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[#941e33]/50 transition-colors cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-xs font-mono uppercase text-[#a8a6a1]">{isAr ? 'إجمالي المشاريع' : 'Total Projects'}</span>
            <div className="w-8 h-8 rounded-lg bg-[#232323] text-[#b8283f] group-hover:bg-[#941e33] group-hover:text-white flex items-center justify-center transition-colors">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#f1f2ed] font-quicksand">{totalProjects}</p>
          <div className="flex items-center gap-2 mt-2 text-[10px] sm:text-xs text-[#706e6a]">
            <span className="text-emerald-400 font-bold">{publishedProjects} {isAr ? 'منشور' : 'active'}</span>
            <span>•</span>
            <span>{hiddenProjects} {isAr ? 'مخفي' : 'draft'}</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('videos')}
          className="p-4 sm:p-5 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[#941e33]/50 transition-colors cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-xs font-mono uppercase text-[#a8a6a1]">{isAr ? 'فيديوهات YouTube' : 'YouTube Videos'}</span>
            <div className="w-8 h-8 rounded-lg bg-[#232323] text-[#b8283f] group-hover:bg-[#941e33] group-hover:text-white flex items-center justify-center transition-colors">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#f1f2ed] font-quicksand">{totalVideos}</p>
          <p className="text-[10px] sm:text-xs text-[#706e6a] mt-2 font-mono">4K Ultra HD Embeds</p>
        </div>

        <div
          onClick={() => onNavigate('media')}
          className="p-4 sm:p-5 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[#941e33]/50 transition-colors cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-xs font-mono uppercase text-[#a8a6a1]">{isAr ? 'لقطات المعرض' : 'Gallery Stills'}</span>
            <div className="w-8 h-8 rounded-lg bg-[#232323] text-[#b8283f] group-hover:bg-[#941e33] group-hover:text-white flex items-center justify-center transition-colors">
              <Image className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#f1f2ed] font-quicksand">{totalGalleryImages}</p>
          <p className="text-[10px] sm:text-xs text-[#706e6a] mt-2 font-mono">{isAr ? 'دعم الرفع من سطح المكتب' : 'Desktop Upload Ready'}</p>
        </div>

        <div
          onClick={() => onNavigate('seo')}
          className="p-4 sm:p-5 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[#941e33]/50 transition-colors cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-xs font-mono uppercase text-[#a8a6a1]">{isAr ? 'أرشفة Google & XML' : 'Sitemap & SEO'}</span>
            <div className="w-8 h-8 rounded-lg bg-[#232323] text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">sitemap.xml</p>
          <p className="text-[10px] sm:text-xs text-[#706e6a] mt-2 font-mono">{isAr ? 'توليد تلقائي فوري' : 'Dynamic Auto-Generated'}</p>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
            {isAr ? 'إجراءات سريعة' : 'Quick Actions'}
          </h3>
          <p className="text-xs text-[#a8a6a1]">
            {isAr ? 'إضافة مشروع سينمائي جديد أو تحديث إعدادات الأرشفة والوسائط' : 'Add new cinematography projects or configure Google indexing.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('categories')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#232323] hover:bg-[#2b2b2b] text-xs font-semibold text-[#f1f2ed] border border-[#2b2b2b] transition-colors cursor-pointer"
          >
            <Tag className="w-4 h-4 text-[#941e33]" />
            <span>{isAr ? 'إدارة التصنيفات' : 'Categories'}</span>
          </button>
          <button
            onClick={() => onNavigate('sections')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#232323] hover:bg-[#2b2b2b] text-xs font-semibold text-[#f1f2ed] border border-[#2b2b2b] transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#941e33]" />
            <span>{isAr ? 'تعديل الأقسام والمسار' : 'Sections & Pipeline'}</span>
          </button>
          <button
            onClick={onNewProject}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#941e33] hover:bg-[#b8283f] text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة مشروع جديد' : 'New Project'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
