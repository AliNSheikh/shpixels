import { useState, useMemo } from 'react';
import { 
  Search, Share2, Save, Check, Globe, FileCode, Copy, Download, 
  BarChart3, ShieldCheck, ExternalLink, HelpCircle 
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { ImageUploadDropzone } from '../common/ImageUploadDropzone';
import { getCategoryPath } from '../../utils/projectRoutes';

export function SEOManager() {
  const { content, updateContent } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [seo, setSeo] = useState({
    pageTitle: content.seo.pageTitle || '',
    metaDescription: content.seo.metaDescription || '',
    ogTitle: content.seo.ogTitle || '',
    ogDescription: content.seo.ogDescription || '',
    ogImage: content.seo.ogImage || '',
    canonicalUrl: content.seo.canonicalUrl || 'https://shpixels.vercel.app/',
    favicon: content.seo.favicon || '/favicon.ico',
    googleSiteVerification: content.seo.googleSiteVerification || '',
    googleAnalyticsId: content.seo.googleAnalyticsId || '',
    sitemapEnabled: content.seo.sitemapEnabled ?? true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSitemapLink, setCopiedSitemapLink] = useState(false);
  const sitemapUrl = useMemo(
    () => `${(seo.canonicalUrl || 'https://shpixels.vercel.app').replace(/\/$/, '')}/sitemap.xml`,
    [seo.canonicalUrl]
  );

  // Generate the same category-first sitemap model used by /api/sitemap.
  const sitemapCategories = useMemo(() => {
    const names: string[] = [];
    const seen = new Set<string>();
    const add = (value: unknown) => {
      const name = String(value || '').trim();
      const key = name.toLowerCase();
      if (!name || seen.has(key)) return;
      seen.add(key);
      names.push(name);
    };

    (content.categories || []).forEach(add);
    (content.featuredVideos || [])
      .filter((video) => video.visible !== false)
      .forEach((video) => add(video.category));

    return names;
  }, [content.categories, content.featuredVideos]);

  const generatedSitemapXml = useMemo(() => {
    const baseUrl = (seo.canonicalUrl || 'https://shpixels.vercel.app').replace(/\/$/, '');
    const today = new Date().toISOString().split('T')[0];
    const urls = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly' },
      ...sitemapCategories.map((category) => ({
        loc: `${baseUrl}${getCategoryPath(category)}`,
        priority: '0.9',
        changefreq: 'weekly'
      }))
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    urls.forEach((url) => {
      xml += `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>\n`;
    });
    xml += `</urlset>`;
    return xml;
  }, [seo.canonicalUrl, sitemapCategories]);

  const robotsTxtContent = useMemo(() => {
    const baseUrl = (seo.canonicalUrl || 'https://shpixels.vercel.app').replace(/\/$/, '');
    return `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
  }, [seo.canonicalUrl]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateContent({ 
      seo,
      branding: {
        ...content.branding,
        favicon: seo.favicon || content.branding.favicon
      }
    });

    // Update document title dynamically in DOM
    if (seo.pageTitle) {
      document.title = seo.pageTitle;
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopySitemapLink = () => {
    navigator.clipboard.writeText(sitemapUrl);
    setCopiedSitemapLink(true);
    setTimeout(() => setCopiedSitemapLink(false), 2000);
  };

  const handleDownloadSitemap = () => {
    const blob = new Blob([generatedSitemapXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadRobots = () => {
    const blob = new Blob([robotsTxtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2b2b2b]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#f1f2ed] font-quicksand uppercase">
            {isAr ? 'محركات البحث وأرشفة Google والتحليلات' : 'Search Engine Optimization (SEO) & Google Archiving'}
          </h2>
          <p className="text-xs text-[#a8a6a1]">
            {isAr 
              ? 'ربط الموقع بـ Google Search Console، وتوليد خريطة الموقع sitemap.xml تلقائياً، وتفعيل Google Analytics.' 
              : 'Link Google Search Console, generate dynamic sitemap.xml for indexing, and track users with Google Analytics 4.'}
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? (isAr ? 'تم حفظ الإعدادات!' : 'SEO Saved!') : (isAr ? 'حفظ إعدادات الأرشفة' : 'Save Configuration')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* Google Search Console & Google Analytics Card */}
          <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-[#232323]">
              <ShieldCheck className="w-5 h-5 text-[#2563eb]" />
              <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
                {isAr ? 'الربط مع Google Search Console و Analytics' : 'Google Search Console & Google Analytics'}
              </h3>
            </div>

            {/* Google Search Console verification */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5 flex items-center justify-between">
                <span>{isAr ? 'رمز التحقق من ملكية Google Search Console' : 'Google Search Console Verification Code'}</span>
                <span className="text-[10px] text-[#706e6a]">google-site-verification</span>
              </label>
              <input
                type="text"
                value={seo.googleSiteVerification}
                onChange={(e) => setSeo({ ...seo, googleSiteVerification: e.target.value })}
                placeholder="e.g. abc123xyz_verification_token or HTML Tag content"
                className="w-full px-4 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] font-mono focus:outline-none focus:border-[#2563eb]"
              />
              <p className="text-[10px] text-[#706e6a] mt-1 font-mono">
                {isAr 
                  ? 'سيتم توليد ودمج وسم <meta name="google-site-verification" content="..." /> تلقائياً في <head>' 
                  : 'Automatically inserts <meta name="google-site-verification" content="..." /> into page <head>.'}
              </p>
            </div>

            {/* Google Analytics 4 Measurement ID */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5 flex items-center justify-between">
                <span>{isAr ? 'معرف قياس Google Analytics 4 (GA4)' : 'Google Analytics 4 Measurement ID'}</span>
                <span className="text-[10px] text-[#706e6a]">G-XXXXXXXXXX</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={seo.googleAnalyticsId}
                  onChange={(e) => setSeo({ ...seo, googleAnalyticsId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] font-mono focus:outline-none focus:border-[#2563eb]"
                />
                <BarChart3 className="w-4 h-4 text-[#706e6a] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-[#706e6a] mt-1 font-mono">
                {isAr 
                  ? 'يتيح تتبع زوار المعرض، وتفاعلات تشغيل الفيديو 4K، وطلبات التواصل تلقائياً.' 
                  : 'Automatically injects Google Tag (gtag.js) to track visitor traffic, film plays, and inquiries.'}
              </p>
            </div>

            <div className="pt-3 border-t border-[#232323]">
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'رابط خريطة الموقع لـ Google Search Console' : 'Google Search Console Sitemap URL'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={sitemapUrl}
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-[#171717] border border-[#2b2b2b] text-[11px] text-[#d7d6d2] font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopySitemapLink}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-xs font-semibold text-white whitespace-nowrap"
                >
                  {copiedSitemapLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSitemapLink ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الرابط' : 'Copy Link')}</span>
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-[#706e6a] font-mono">
                {isAr
                  ? 'أرسل هذا الرابط في Google Search Console. Google Analytics يستخدم معرف GA4 أعلاه وليس ملف sitemap.'
                  : 'Submit this URL in Google Search Console. Google Analytics uses the GA4 Measurement ID above, not the sitemap itself.'}
              </p>
            </div>
          </div>

          {/* Standard Meta Tags Card */}
          <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand pb-2 border-b border-[#232323]">
              {isAr ? 'بيانات الميتا الرئيسية (Title & Description)' : 'Page Metadata'}
            </h3>

            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5 flex items-center justify-between">
                <span>{isAr ? 'عنوان الصفحة (Meta Title) *' : 'Page Meta Title *'}</span>
                <span className="text-[10px] text-[#706e6a]">{seo.pageTitle.length}/60 chars</span>
              </label>
              <input
                type="text"
                required
                value={seo.pageTitle}
                onChange={(e) => setSeo({ ...seo, pageTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5 flex items-center justify-between">
                <span>{isAr ? 'وصف الصفحة (Meta Description) *' : 'Page Meta Description *'}</span>
                <span className="text-[10px] text-[#706e6a]">{seo.metaDescription.length}/160 chars</span>
              </label>
              <textarea
                rows={3}
                required
                value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:outline-none focus:border-[#2563eb] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'الرابط الأساسي المعتمد (Canonical URL)' : 'Canonical URL'}
              </label>
              <input
                type="url"
                value={seo.canonicalUrl}
                onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] font-mono focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            {/* Favicon Browser Icon */}
            <div>
              <ImageUploadDropzone
                value={seo.favicon || ''}
                onChange={(url) => setSeo({ ...seo, favicon: url })}
                label={isAr ? 'أيقونة المتصفح (Browser Favicon - .ico, .svg, .png)' : 'Browser Favicon (.ico, .svg, .png)'}
                aspectRatio="aspect-square"
                previewFit="contain"
                compact={true}
                placeholder="/assets/shpixels-icon.svg"
                helperText={isAr ? 'يتم تحديث أيقونة التبويب في المتصفح تلقائياً عند الحفظ' : 'Browser tab icon automatically updates in real-time'}
              />
            </div>
          </div>

          {/* Social Open Graph */}
          <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand pb-2 border-b border-[#232323]">
              {isAr ? 'بطاقات المشاركة على مواقع التواصل (Open Graph / Twitter)' : 'Social Open Graph Cards'}
            </h3>

            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'عنوان المشاركة (og:title)' : 'Social Share Title'}
              </label>
              <input
                type="text"
                value={seo.ogTitle}
                onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'صورة بطاقة المشاركة (og:image)' : 'Social Share Image (OG Image)'}
              </label>
              <input
                type="url"
                value={seo.ogImage}
                onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] font-mono focus:outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>
        </form>

        {/* Right Column: Dynamic Sitemap & Previews */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dynamic Sitemap Generator Card */}
          <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#232323]">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#2563eb]" />
                <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
                  {isAr ? 'خريطة الموقع التلقائية (sitemap.xml)' : 'Dynamic Sitemap.xml'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                {sitemapCategories.length + 1} URLs
              </span>
            </div>

            <p className="text-xs text-[#a8a6a1]">
              {isAr 
                ? 'يتم تحديث خريطة الموقع تلقائياً عند إضافة فيديو إلى أي تصنيف.' 
                : 'Sitemap dynamically includes the homepage and every public video category page.'}
            </p>

            {/* Sitemap XML live preview box */}
            <div className="relative">
              <pre className="p-3 rounded-xl bg-black border border-[#2b2b2b] text-[11px] font-mono text-[#a8a6a1] max-h-44 overflow-y-auto overflow-x-hidden whitespace-pre-wrap select-all">
                {generatedSitemapXml}
              </pre>
            </div>

            {/* Sitemap Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySitemapLink}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#232323] hover:bg-[#2b2b2b] text-xs font-mono text-[#f1f2ed] transition-colors"
              >
                {copiedSitemapLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#2563eb]" />}
                <span>{copiedSitemapLink ? (isAr ? 'تم نسخ الرابط' : 'Link Copied!') : (isAr ? 'نسخ رابط Sitemap' : 'Copy Sitemap Link')}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSitemap}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-xs font-mono text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحميل sitemap.xml' : 'Download XML'}</span>
              </button>
            </div>

            {/* Robots.txt Download */}
            <div className="pt-2 border-t border-[#232323] flex items-center justify-between">
              <span className="text-xs text-[#706e6a] font-mono">robots.txt</span>
              <button
                type="button"
                onClick={handleDownloadRobots}
                className="text-xs text-[#a8a6a1] hover:text-white flex items-center gap-1 font-mono"
              >
                <Download className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>{isAr ? 'تحميل robots.txt' : 'Download robots.txt'}</span>
              </button>
            </div>
          </div>

          {/* Google Search Result Snippet Preview */}
          <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-3 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#a8a6a1]">
              {isAr ? 'معاينة النتيجة في بحث Google' : 'Google Search Result Preview'}
            </h3>

            <div className="p-4 rounded-xl bg-[#171717] border border-[#232323] space-y-1">
              <div className="text-[11px] font-mono text-[#706e6a] truncate">
                {seo.canonicalUrl}
              </div>
              <div className="text-sm font-semibold text-[#8ab4f8] hover:underline cursor-pointer truncate">
                {seo.pageTitle}
              </div>
              <div className="text-xs text-[#a8a6a1] line-clamp-2 leading-relaxed">
                {seo.metaDescription}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
