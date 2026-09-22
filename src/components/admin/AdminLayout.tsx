import { useState } from 'react';
import { 
  FolderKanban, 
  Video, 
  Image, 
  Settings, 
  Menu, 
  Globe, 
  Search, 
  Download, 
  LogOut, 
  LayoutDashboard, 
  ExternalLink,
  Film,
  Zap,
  Tag,
  Layers
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { DashboardHome } from './DashboardHome';
import { ProjectManager } from './ProjectManager';
import { CategoryManager } from './CategoryManager';
import { SectionManager } from './SectionManager';
import { VideoManager } from './VideoManager';
import { MediaManager } from './MediaManager';
import { SiteSettings } from './SiteSettings';
import { NavigationManager } from './NavigationManager';
import { LinkManager } from './LinkManager';
import { SEOManager } from './SEOManager';
import { ExportManager } from './ExportManager';

type AdminTab = 
  | 'home' 
  | 'projects' 
  | 'categories' 
  | 'sections' 
  | 'videos' 
  | 'media' 
  | 'settings' 
  | 'navigation' 
  | 'links' 
  | 'seo' 
  | 'export';

export function AdminLayout() {
  const { content, categories, logoutAdmin, setIsAdminView } = useContent();
  const { language, toggleLanguage } = useLanguage();
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<AdminTab>('home');

  const navItems = [
    { id: 'home', label: isAr ? 'لوحة القيادة' : 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: isAr ? 'إدارة المشاريع والأعمال' : 'Projects (CRUD)', icon: FolderKanban, count: content.projects.length },
    { id: 'categories', label: isAr ? 'إدارة التصنيفات والفئات' : 'Category Manager', icon: Tag, count: categories.length },
    { id: 'sections', label: isAr ? 'محرر كافة الأقسام والمحتوى' : 'Section & Pipeline Editor', icon: Layers },
    { id: 'videos', label: isAr ? 'فيديوهات YouTube 4K' : 'YouTube Videos', icon: Video },
    { id: 'media', label: isAr ? 'الوسائط والرفع المباشر' : 'Media & Desktop Upload', icon: Image },
    { id: 'settings', label: isAr ? 'النصوص والإعدادات' : 'Site & Security Settings', icon: Settings },
    { id: 'navigation', label: isAr ? 'قائمة التنقل' : 'Navigation Menu', icon: Menu },
    { id: 'links', label: isAr ? 'الروابط والتواصل' : 'Links & Social', icon: Globe },
    { id: 'seo', label: isAr ? 'أرشفة Google & Sitemap' : 'SEO & Google Indexing', icon: Search },
    { id: 'export', label: isAr ? 'تصدير الكود والبيانات' : 'Codebase Export', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-[#f1f2ed] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#171717]/95 backdrop-blur-md border-b border-[#2b2b2b] px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#941e33] flex items-center justify-center text-white font-black shadow-md shadow-[#941e33]/25">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider uppercase font-quicksand text-white">
                MOGRAFIX
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#232323] text-[#b8283f] border border-[#941e33]/40">
                {isAr ? 'لوحة التحكم CMS' : 'ADMIN CMS'}
              </span>
            </div>
          </div>
        </div>

        {/* Status & Quick actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Real-time Codebase Sync Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/40">
            <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{isAr ? 'المزامنة المباشرة للكود نشطة' : 'Real-time Codebase Sync'}</span>
          </div>

          {/* Bilingual Language Toggle for Admin CMS */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#232323] hover:bg-[#2b2b2b] text-xs font-mono text-[#a8a6a1] hover:text-white border border-[#2b2b2b] transition-colors cursor-pointer"
            title={isAr ? 'Switch CMS to English' : 'تحويل اللوحة إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-[#941e33]" />
            <span className={!isAr ? 'font-bold text-[#f1f2ed]' : 'text-[#706e6a]'}>EN</span>
            <span className="text-[#444]">/</span>
            <span className={isAr ? 'font-bold text-[#f1f2ed]' : 'text-[#706e6a]'}>عربي</span>
          </button>

          <button
            onClick={() => setIsAdminView(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#232323] hover:bg-[#2b2b2b] text-xs font-medium text-[#f1f2ed] border border-[#2b2b2b] transition-colors cursor-pointer"
          >
            <span>{isAr ? 'الموقع العام' : 'Public Site'}</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#941e33]" />
          </button>

          <button
            onClick={logoutAdmin}
            className="p-2 rounded-xl text-[#a8a6a1] hover:text-white hover:bg-[#232323] transition-colors cursor-pointer"
            title={isAr ? 'تسجيل الخروج' : 'Log Out'}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-64 rounded-2xl bg-[#171717] border border-[#2b2b2b] p-3 space-y-1 self-start shadow-xl sticky top-20">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-[#706e6a]">
            {isAr ? 'أقسام لوحة التحكم' : 'Content Management'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#941e33] text-white shadow-md shadow-[#941e33]/20 font-bold'
                    : 'text-[#a8a6a1] hover:text-[#f1f2ed] hover:bg-[#232323]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-black/30 text-white' : 'bg-[#232323] text-[#706e6a]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Mobile Horizontal Tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#171717] border-t border-[#2b2b2b] p-2 flex items-center justify-around overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 cursor-pointer ${
                  isActive ? 'text-[#941e33]' : 'text-[#706e6a]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] uppercase tracking-wider">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Content Workspace Area */}
        <main className="flex-1 min-w-0 pb-16 md:pb-0">
          {activeTab === 'home' && (
            <DashboardHome
              onNavigate={(tab) => setActiveTab(tab as AdminTab)}
              onNewProject={() => setActiveTab('projects')}
            />
          )}
          {activeTab === 'projects' && <ProjectManager />}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'sections' && <SectionManager />}
          {activeTab === 'videos' && <VideoManager />}
          {activeTab === 'media' && <MediaManager />}
          {activeTab === 'settings' && <SiteSettings />}
          {activeTab === 'navigation' && <NavigationManager />}
          {activeTab === 'links' && <LinkManager />}
          {activeTab === 'seo' && <SEOManager />}
          {activeTab === 'export' && <ExportManager />}
        </main>
      </div>
    </div>
  );
}
