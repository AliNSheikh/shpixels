import { useMemo, useState } from 'react';
import {
  BarChart3,
  Check,
  Clock,
  Copy,
  Database,
  ExternalLink,
  Film,
  FolderKanban,
  Globe,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Tag,
  UploadCloud,
  Video,
  Zap
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { extractYouTubeId } from '../../utils/youtube';

interface DashboardHomeProps {
  onNavigate: (tab: string) => void;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const {
    content,
    categories,
    addCategory,
    updateHero,
    setIsAdminView,
    publishSite,
    isPublishing,
    publishSuccess,
    hasUnsavedChanges,
    lastPublishedAt,
    publicationVersion,
    serverSyncStatus,
    publishError,
    diagnostics
  } = useContent();

  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [categoryNotice, setCategoryNotice] = useState<string | null>(null);
  const [showreelDraftId, setShowreelDraftId] = useState(content.hero.featuredVideoId || '');
  const [videoNotice, setVideoNotice] = useState<string | null>(null);
  const [copiedSitemapUrl, setCopiedSitemapUrl] = useState(false);

  const visibleVideos = useMemo(
    () => [...(content.featuredVideos || [])]
      .filter((video) => video?.visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    [content.featuredVideos]
  );

  const recentVideos = visibleVideos.slice(0, 6);
  const totalGalleryImages = content.gallery?.length || 0;
  const totalServices = content.services?.filter((service) => service.visible !== false).length || 0;
  const sitemapUrl = `${(content.seo.canonicalUrl || 'https://shpixels.vercel.app').replace(/\/$/, '')}/sitemap.xml`;

  const handleQuickAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickCategoryName.trim();
    if (!trimmed) return;

    if (categories.some((category) => category.toLowerCase() === trimmed.toLowerCase())) {
      setCategoryNotice(isAr ? 'التصنيف موجود بالفعل' : 'Category already exists');
      setTimeout(() => setCategoryNotice(null), 2500);
      return;
    }

    addCategory(trimmed);
    setQuickCategoryName('');
    setCategoryNotice(isAr ? `تمت إضافة "${trimmed}"` : `Added "${trimmed}"`);
    setTimeout(() => setCategoryNotice(null), 2500);
  };

  const handleSaveShowreelVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractYouTubeId(showreelDraftId);
    if (!cleanId) return;

    updateHero({ featuredVideoId: cleanId });
    setVideoNotice(isAr ? 'تم تحديث فيديو العرض' : 'Showreel updated');
    setTimeout(() => setVideoNotice(null), 2500);
  };

  const handleCopySitemapUrl = async () => {
    await navigator.clipboard.writeText(sitemapUrl);
    setCopiedSitemapUrl(true);
    setTimeout(() => setCopiedSitemapUrl(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <div className="p-5 sm:p-7 rounded-2xl bg-gradient-to-r from-[#1d1d1d] via-[#242424] to-[#1d1d1d] border border-[#2b2b2b] flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563eb]/20 border border-[#2563eb]/40 text-xs font-mono uppercase text-[#38bdf8]">
            <Video className="w-3.5 h-3.5" />
            <span>{isAr ? 'إدارة الفيديوهات حسب التصنيف' : 'Category Video CMS'}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-[#f1f2ed] font-quicksand uppercase tracking-wide">
            {isAr ? 'إدارة التصنيفات وفيديوهات YouTube' : 'Categories & YouTube Videos'}
          </h1>
          <p className="text-xs sm:text-sm text-[#a8a6a1] leading-relaxed">
            {isAr
              ? 'أضف رابط YouTube وحدد التصنيف فقط. سيظهر الفيديو مباشرة داخل صفحة التصنيف بدون إنشاء مشروع.'
              : 'Add a YouTube link and select its category. The video appears directly on that category page without creating a project.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('videos')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-xs font-semibold text-white"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'إضافة فيديو' : 'Add Video'}
          </button>
          <button
            onClick={() => setIsAdminView(false)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#232323] hover:bg-[#2b2b2b] text-xs font-semibold text-[#f1f2ed] border border-[#2b2b2b]"
          >
            <Globe className="w-4 h-4 text-[#38bdf8]" />
            {isAr ? 'الموقع العام' : 'Public Site'}
          </button>
        </div>
      </div>

      <div className={`p-5 sm:p-6 rounded-2xl border shadow-2xl ${
        serverSyncStatus === 'error'
          ? 'bg-rose-950/20 border-rose-700/40'
          : hasUnsavedChanges
            ? 'bg-amber-950/10 border-amber-600/30'
            : 'bg-[#181818] border-[#2b2b2b]'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono ${
                serverSyncStatus === 'error'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : hasUnsavedChanges
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${serverSyncStatus === 'error' ? 'bg-rose-400' : hasUnsavedChanges ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                {serverSyncStatus === 'error'
                  ? (isAr ? 'خطأ في الاتصال بالسيرفر' : 'Server connection issue')
                  : hasUnsavedChanges
                    ? (isAr ? 'تعديلات بانتظار الحفظ' : 'Changes waiting to publish')
                    : (isAr ? 'الموقع متزامن' : 'Live & synchronized')}
              </span>
              <span className="px-2 py-1 rounded-md bg-[#232323] text-[#a8a6a1] text-[11px] font-mono">
                v{publicationVersion}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-[#706e6a]">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                {lastPublishedAt ? new Date(lastPublishedAt).toLocaleString() : (isAr ? 'لم ينشر بعد' : 'Not published yet')}
              </span>
              {diagnostics && (
                <span className="inline-flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Supabase: {diagnostics.reachable ? 'Connected' : 'Offline'}
                </span>
              )}
            </div>

            {publishError && (
              <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800/40 rounded-xl px-3 py-2">
                {publishError}
              </div>
            )}
          </div>

          <button
            onClick={() => publishSite()}
            disabled={isPublishing}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] disabled:opacity-50 text-white text-sm font-bold shadow-lg"
          >
            {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : publishSuccess ? <Check className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
            {isPublishing
              ? (isAr ? 'جارِ النشر...' : 'Publishing...')
              : publishSuccess
                ? (isAr ? 'تم الحفظ والنشر' : 'Saved & Published')
                : (isAr ? 'حفظ ونشر الموقع' : 'Save Site')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button onClick={() => onNavigate('videos')} className="text-left p-4 sm:p-5 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[#2563eb]/50 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono uppercase text-[#a8a6a1]">{isAr ? 'الفيديوهات' : 'Category Videos'}</span>
            <Video className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-[#f1f2ed]">{visibleVideos.length}</p>
          <p className="mt-1 text-[10px] text-[#706e6a]">YouTube embeds</p>
        </button>

        <button onClick={() => onNavigate('categories')} className="text-left p-4 sm:p-5 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[#2563eb]/50 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono uppercase text-[#a8a6a1]">{isAr ? 'التصنيفات' : 'Categories'}</span>
            <Tag className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-[#f1f2ed]">{categories.length}</p>
          <p className="mt-1 text-[10px] text-[#706e6a]">{isAr ? 'صفحات فيديو مستقلة' : 'video category pages'}</p>
        </button>

        <button onClick={() => onNavigate('media')} className="text-left p-4 sm:p-5 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[#2563eb]/50 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono uppercase text-[#a8a6a1]">{isAr ? 'المعرض' : 'Gallery'}</span>
            <Layers className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-[#f1f2ed]">{totalGalleryImages}</p>
          <p className="mt-1 text-[10px] text-[#706e6a]">{totalServices} active services</p>
        </button>

        <button onClick={() => onNavigate('seo')} className="text-left p-4 sm:p-5 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] hover:border-emerald-500/50 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono uppercase text-[#a8a6a1]">Sitemap & SEO</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-[10px] sm:text-[11px] text-emerald-400 font-mono break-all leading-relaxed">{sitemapUrl}</p>
          <span
            onClick={(e) => { e.stopPropagation(); void handleCopySitemapUrl(); }}
            className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#f1f2ed]"
          >
            {copiedSitemapUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#38bdf8]" />}
            {copiedSitemapUrl ? 'Copied' : 'Copy Link'}
          </span>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
        <section className="rounded-2xl bg-[#171717] border border-[#2b2b2b] shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#2b2b2b] flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#f1f2ed] font-quicksand uppercase">
                {isAr ? 'أحدث فيديوهات التصنيفات' : 'Recent Category Videos'}
              </h2>
              <p className="text-[11px] text-[#706e6a]">
                {isAr ? 'كل فيديو مرتبط مباشرة بتصنيفه' : 'Every video is linked directly to its category'}
              </p>
            </div>
            <button onClick={() => onNavigate('videos')} className="text-xs text-[#38bdf8] hover:text-white">
              {isAr ? 'إدارة الفيديوهات' : 'Manage Videos'}
            </button>
          </div>

          <div className="divide-y divide-[#232323]">
            {recentVideos.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#706e6a]">
                {isAr ? 'لا توجد فيديوهات بعد' : 'No videos yet'}
              </div>
            ) : (
              recentVideos.map((video) => (
                <div key={video.id} className="p-3 sm:p-4 flex items-center gap-3">
                  <div className="w-20 h-12 rounded-lg overflow-hidden bg-[#232323] border border-[#2b2b2b] shrink-0">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Video className="w-4 h-4 text-[#706e6a]" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-mono uppercase text-[#38bdf8]">{video.category || 'Uncategorized'}</p>
                    <h3 className="text-xs sm:text-sm font-bold text-[#f1f2ed] truncate">{video.title || 'YouTube Video'}</h3>
                  </div>
                  <a
                    href={`https://youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-[#a8a6a1] hover:text-white hover:bg-[#232323]"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="p-4 sm:p-5 rounded-2xl bg-[#171717] border border-[#2b2b2b] shadow-xl space-y-5">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#f1f2ed] font-quicksand uppercase">
              {isAr ? 'إدارة سريعة للتصنيفات' : 'Quick Category Setup'}
            </h2>
            <p className="text-[11px] text-[#706e6a]">
              {isAr ? 'أنشئ التصنيف ثم اختره عند إضافة الفيديو.' : 'Create the category, then select it when adding a video.'}
            </p>
          </div>

          {categoryNotice && (
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs">
              {categoryNotice}
            </div>
          )}

          <form onSubmit={handleQuickAddCategory} className="flex gap-2">
            <input
              type="text"
              value={quickCategoryName}
              onChange={(e) => setQuickCategoryName(e.target.value)}
              placeholder={isAr ? 'اسم تصنيف جديد...' : 'New category name...'}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:outline-none focus:border-[#2563eb]"
            />
            <button type="submit" className="px-3.5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-white text-xs font-bold">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const count = visibleVideos.filter((video) => video.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => onNavigate('categories')}
                  className="px-3 py-1.5 rounded-full bg-[#232323] border border-[#2b2b2b] text-xs text-[#a8a6a1] hover:text-white hover:border-[#2563eb]/50"
                >
                  {category} <span className="text-[#38bdf8]">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#2b2b2b]">
            <h3 className="text-xs font-mono uppercase text-[#a8a6a1] mb-2">
              {isAr ? 'فيديو العرض الرئيسي' : 'Primary Showreel'}
            </h3>
            <form onSubmit={handleSaveShowreelVideo} className="flex gap-2">
              <input
                value={showreelDraftId}
                onChange={(e) => setShowreelDraftId(e.target.value)}
                placeholder="YouTube URL or ID"
                className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:outline-none focus:border-[#2563eb]"
              />
              <button type="submit" className="px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-[#f1f2ed]">
                <Film className="w-4 h-4 text-[#38bdf8]" />
              </button>
            </form>
            {videoNotice && <p className="mt-2 text-xs text-emerald-400">{videoNotice}</p>}
          </div>
        </section>
      </div>

      <section className="p-4 sm:p-5 rounded-2xl bg-[#171717] border border-[#2b2b2b]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#f1f2ed] uppercase">Content Structure</h2>
            <p className="mt-1 text-xs text-[#706e6a]">
              Categories → YouTube videos. Projects are no longer required for public portfolio content.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigate('categories')} className="px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed]">
              <FolderKanban className="inline w-3.5 h-3.5 mr-1" /> Categories
            </button>
            <button onClick={() => onNavigate('videos')} className="px-3 py-2 rounded-xl bg-[#2563eb] text-xs text-white">
              <Video className="inline w-3.5 h-3.5 mr-1" /> Videos
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
