import { useState } from 'react';
import { 
  Settings, Save, Check, Key, Sliders, Sparkles, Image as ImageIcon, 
  Globe, RotateCcw, Trash2, Eye, ShieldCheck, Palette,
  UploadCloud, RefreshCw, Clock, Database, Server, Copy, 
  ExternalLink, Lock, AlertCircle, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { ImageUploadDropzone } from '../common/ImageUploadDropzone';

const ACCENT_COLOR_PRESETS = [
  { name: 'SHPIXELS Electric Blue', hex: '#2563eb' },
  { name: 'Cobalt Vivid', hex: '#3b82f6' },
  { name: 'Cyber Cyan', hex: '#06b6d4' },
  { name: 'Emerald Film', hex: '#10b981' },
  { name: 'Cinema Amber', hex: '#f59e0b' },
  { name: 'Neon Violet', hex: '#8b5cf6' },
  { name: 'Crimson Rose', hex: '#e11d48' },
  { name: 'Monochrome Silver', hex: '#9ca3af' }
];

const DEFAULT_LOGO = '/assets/shpixels-logo.svg';
const DEFAULT_FAVICON = '/assets/shpixels-icon.svg';

const SUPABASE_SETUP_SQL = `-- SHPIXELS CMS Database Schema for Supabase
CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY DEFAULT 'current',
  data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and permissions for instant synchronization
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site_content" ON site_content;
CREATE POLICY "Public can read site_content" ON site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon inserts" ON site_content;
CREATE POLICY "Allow anon inserts" ON site_content FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon updates" ON site_content;
CREATE POLICY "Allow anon updates" ON site_content FOR UPDATE USING (true);
`;

export function SiteSettings() {
  const { 
    content, 
    updateContent, 
    changeAdminPassword,
    publishSite,
    isPublishing,
    publishSuccess: isGlobalPublishSuccess,
    hasUnsavedChanges,
    lastPublishedAt,
    publicationVersion,
    supabaseConfigState,
    updateSupabaseCredentials,
    testDatabaseConnection,
    syncNowToSupabase
  } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Database / Supabase states
  const [dbUrl, setDbUrl] = useState(supabaseConfigState.url);
  const [dbAnonKey, setDbAnonKey] = useState(supabaseConfigState.anonKey);
  const [dbStatusMsg, setDbStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Security password change states
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Form states
  const [branding, setBranding] = useState({
    logoText: content.branding.logoText || 'SHPIXELS',
    logoSubtext: content.branding.logoSubtext || 'SHARIF ABS • CINEMATOGRAPHY',
    logoImage: content.branding.logoImage || DEFAULT_LOGO,
    favicon: content.branding.favicon || content.seo?.favicon || DEFAULT_FAVICON,
    accentColor: content.branding.accentColor || '#2563eb'
  });

  const [hero, setHero] = useState({
    ...content.hero,
    marqueeText: content.hero.marqueeItems.join(' • ')
  });

  const [about, setAbout] = useState({
    ...content.about,
    bioText: content.about.bioParagraphs.join('\n\n'),
    skillsText: content.about.skills.join(', ')
  });

  const [footer, setFooter] = useState({ ...content.footer });

  // Handlers for Database & Password
  const handleSaveDbCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUrl.trim() || !dbAnonKey.trim()) {
      setDbStatusMsg({ text: isAr ? 'يرجى إدخال الرابط والمفتاح' : 'Please enter URL and Anon Key', isError: true });
      return;
    }
    setIsTestingDb(true);
    setDbStatusMsg(null);
    try {
      const res = await updateSupabaseCredentials(dbUrl.trim(), dbAnonKey.trim());
      setDbStatusMsg({ text: res.message, isError: !res.success });
    } catch (err: any) {
      setDbStatusMsg({ text: err.message, isError: true });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleTestDatabase = async () => {
    setIsTestingDb(true);
    setDbStatusMsg(null);
    try {
      const res = await testDatabaseConnection(dbUrl.trim(), dbAnonKey.trim());
      setDbStatusMsg({ text: res.message, isError: !res.success });
    } catch (err: any) {
      setDbStatusMsg({ text: err.message, isError: true });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingDb(true);
    setDbStatusMsg(null);
    try {
      const res = await syncNowToSupabase();
      setDbStatusMsg({ text: res.message, isError: !res.success });
    } catch (err: any) {
      setDbStatusMsg({ text: err.message, isError: true });
    } finally {
      setIsSyncingDb(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPass.trim()) {
      setPassError(isAr ? 'يرجى إدخال كلمة المرور الحالية.' : 'Please enter current password.');
      return;
    }
    if (!newPass.trim() || newPass.trim().length < 6) {
      setPassError(isAr ? 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.' : 'New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError(isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }

    setIsUpdatingPass(true);
    try {
      const res = await changeAdminPassword(currentPass, newPass);
      if (res.success) {
        setPassSuccess(isAr ? '✓ تم تشفير وتحديث كلمة المرور بنجاح!' : '✓ Password encrypted & updated successfully!');
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setPassError(res.error || (isAr ? 'فشل التحديث.' : 'Update failed.'));
      }
    } catch (err: any) {
      setPassError(err.message || 'Error updating password');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  // Preview contrast toggles
  const [logoPreviewBg, setLogoPreviewBg] = useState<'dark' | 'light' | 'checker'>('dark');

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const updatedMarquee = hero.marqueeText
      .split('•')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedBios = about.bioText
      .split('\n\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedSkills = about.skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updateContent({
      branding: {
        ...content.branding,
        ...branding
      },
      seo: {
        ...content.seo,
        favicon: branding.favicon || content.seo.favicon
      },
      hero: {
        ...content.hero,
        title: hero.title,
        subtitle: hero.subtitle,
        badgeText: hero.badgeText,
        primaryCtaText: hero.primaryCtaText,
        primaryCtaLink: hero.primaryCtaLink,
        secondaryCtaText: hero.secondaryCtaText,
        secondaryCtaLink: hero.secondaryCtaLink,
        marqueeItems: updatedMarquee.length > 0 ? updatedMarquee : content.hero.marqueeItems
      },
      about: {
        ...content.about,
        heading: about.heading,
        highlightText: about.highlightText,
        experienceYears: about.experienceYears,
        bioParagraphs: updatedBios.length > 0 ? updatedBios : content.about.bioParagraphs,
        skills: updatedSkills.length > 0 ? updatedSkills : content.about.skills
      },
      footer
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveAndPublish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    handleSaveAll();
    await publishSite('Settings and branding published');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2b2b2b]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#f1f2ed] font-quicksand uppercase">
            {isAr ? 'إعدادات الشعار، الهوية البصرية والمحتوى' : 'Website Logo, Branding & Settings'}
          </h2>
          <p className="text-xs text-[#a8a6a1]">
            {isAr 
              ? 'رفع وتغيير شعار الموقع (Logo)، أيقونة المتصفح (Favicon)، الألوان، النصوص والعبارات.'
              : 'Upload custom site logo, browser favicon, accent colors, hero copy, and director bio.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1d1d1d] border border-[#2b2b2b] text-[11px] font-mono text-[#a8a6a1]">
            <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>{isAr ? 'آخر نشر:' : 'Published:'}</span>
            <span className="text-[#f1f2ed] font-semibold">
              {lastPublishedAt 
                ? new Date(lastPublishedAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
                : (isAr ? 'غير مسجل' : 'N/A')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSaveAndPublish}
            disabled={isPublishing}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md cursor-pointer ${
              isGlobalPublishSuccess
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                : hasUnsavedChanges
                ? 'bg-[#2563eb] hover:bg-[#3b82f6] ring-2 ring-[#38bdf8]/50 shadow-[#2563eb]/30 animate-pulse'
                : 'bg-[#2563eb] hover:bg-[#3b82f6] shadow-[#2563eb]/20'
            }`}
          >
            {isPublishing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>{isAr ? 'جارِ النشر على السيرفر...' : 'Publishing to Server...'}</span>
              </>
            ) : isGlobalPublishSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>{isAr ? 'تم النشر بنجاح ✓' : 'Published to Server ✓'}</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 text-white" />
                <span>{isAr ? 'حفظ ونشر الموقع (Save Site)' : 'Save Site & Publish'}</span>
                {hasUnsavedChanges && <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />}
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        {/* ============================================================ */}
        {/* BRAND LOGO & FAVICON UPLOAD MANAGEMENT CARD */}
        {/* ============================================================ */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#2563eb]/5 blur-3xl pointer-events-none rounded-full" />

          <div className="flex items-center justify-between pb-3 border-b border-[#232323] relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2563eb]/20 text-[#2563eb] flex items-center justify-center border border-[#2563eb]/30">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
                  {isAr ? 'شعار الموقع وأيقونة المتصفح (Logo & Favicon)' : 'Site Logo & Favicon Upload'}
                </h3>
                <p className="text-[11px] text-[#a8a6a1]">
                  {isAr 
                    ? 'قم برفع ملفات الشعار والأيقونة مباشرة من جهازك (SVG, PNG, ICO, WebP).'
                    : 'Upload your own brand logo and browser favicon directly from your computer or specify an image URL.'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#2563eb]/10 text-[#3b82f6] border border-[#2563eb]/20">
              {isAr ? 'تحديث حي' : 'Live Sync'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
            {/* 1. BRAND LOGO SECTION */}
            <div className="space-y-4 p-5 rounded-xl bg-[#171717] border border-[#262626]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2563eb]" />
                  <label className="text-xs font-bold uppercase tracking-wider text-[#f1f2ed] font-quicksand">
                    {isAr ? 'شعار الموقع (Website Logo)' : 'Website Logo'}
                  </label>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBranding({ ...branding, logoImage: DEFAULT_LOGO })}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-[#a8a6a1] hover:text-white bg-[#232323] hover:bg-[#2c2c2c] px-2 py-1 rounded transition-colors"
                    title={isAr ? 'استعادة الشعار الافتراضي' : 'Reset to default SHPIXELS logo'}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isAr ? 'الافتراضي' : 'Default'}</span>
                  </button>
                  {branding.logoImage && (
                    <button
                      type="button"
                      onClick={() => setBranding({ ...branding, logoImage: '' })}
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 px-2 py-1 rounded transition-colors"
                      title={isAr ? 'حذف الشعار واستخدام النص فقط' : 'Remove image and use text logo'}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{isAr ? 'نص فقط' : 'Text only'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Upload Dropzone for Logo */}
              <ImageUploadDropzone
                value={branding.logoImage || ''}
                onChange={(url) => setBranding({ ...branding, logoImage: url })}
                label={isAr ? 'رفع ملف الشعار (PNG شفاف أو SVG موصى به)' : 'Upload Logo File (Transparent PNG or SVG recommended)'}
                aspectRatio="aspect-[4/1]"
                previewFit="contain"
                placeholder="https://.../logo.png or /assets/..."
                helperText={isAr ? 'الارتفاع الموصى به: 40px - 80px مع خلفية شفافة.' : 'Recommended dimensions: 200×60px to 400×120px with transparent background.'}
              />

              {/* Live Preview Box for Logo */}
              <div className="space-y-2 pt-2 border-t border-[#232323]">
                <div className="flex items-center justify-between text-[11px] text-[#a8a6a1]">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Eye className="w-3.5 h-3.5 text-[#2563eb]" />
                    {isAr ? 'معاينة ظهور الشعار في شريط التنقل:' : 'Navbar Logo Preview:'}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <span className="text-[#666]">{isAr ? 'خلفية:' : 'Bg:'}</span>
                    <button
                      type="button"
                      onClick={() => setLogoPreviewBg('dark')}
                      className={`px-1.5 py-0.5 rounded ${logoPreviewBg === 'dark' ? 'bg-[#2563eb] text-white' : 'bg-[#232323] text-[#a8a6a1]'}`}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoPreviewBg('light')}
                      className={`px-1.5 py-0.5 rounded ${logoPreviewBg === 'light' ? 'bg-[#2563eb] text-white' : 'bg-[#232323] text-[#a8a6a1]'}`}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoPreviewBg('checker')}
                      className={`px-1.5 py-0.5 rounded ${logoPreviewBg === 'checker' ? 'bg-[#2563eb] text-white' : 'bg-[#232323] text-[#a8a6a1]'}`}
                    >
                      Grid
                    </button>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border border-[#2b2b2b] flex items-center justify-center transition-colors min-h-[72px] ${
                  logoPreviewBg === 'dark' 
                    ? 'bg-[#171717]' 
                    : logoPreviewBg === 'light' 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'bg-[#1a1a1a] bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:12px_12px]'
                }`}>
                  {branding.logoImage ? (
                    <img
                      src={branding.logoImage}
                      alt={branding.logoText || 'Logo Preview'}
                      className="max-h-11 w-auto max-w-[240px] object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white font-black text-sm">
                        {branding.logoText.slice(0, 2).toUpperCase() || 'SH'}
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-extrabold text-base uppercase font-quicksand ${logoPreviewBg === 'light' ? 'text-slate-900' : 'text-white'}`}>
                          {branding.logoText || 'SHPIXELS'}
                        </span>
                        <span className="text-[9px] font-mono tracking-widest text-[#a8a6a1]">
                          {branding.logoSubtext || 'CINEMATOGRAPHY'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. BROWSER FAVICON SECTION */}
            <div className="space-y-4 p-5 rounded-xl bg-[#171717] border border-[#262626]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#2563eb]" />
                  <label className="text-xs font-bold uppercase tracking-wider text-[#f1f2ed] font-quicksand">
                    {isAr ? 'أيقونة تبويب المتصفح (Browser Favicon)' : 'Browser Favicon'}
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setBranding({ ...branding, favicon: DEFAULT_FAVICON })}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-[#a8a6a1] hover:text-white bg-[#232323] hover:bg-[#2c2c2c] px-2 py-1 rounded transition-colors"
                  title={isAr ? 'استعادة الأيقونة الافتراضية' : 'Reset to default favicon icon'}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isAr ? 'الافتراضي' : 'Default'}</span>
                </button>
              </div>

              {/* Upload Dropzone for Favicon */}
              <ImageUploadDropzone
                value={branding.favicon || ''}
                onChange={(url) => setBranding({ ...branding, favicon: url })}
                label={isAr ? 'رفع ملف الأيقونة (.ico, .svg, .png)' : 'Upload Favicon File (.ico, .svg, .png)'}
                aspectRatio="aspect-square"
                previewFit="contain"
                compact={true}
                placeholder="/assets/shpixels-icon.svg or data:image/..."
                helperText={isAr ? 'المقاس الموصى به: 32×32 أو 64×64 بكسل أو ملف SVG متجهي.' : 'Recommended size: 32×32px, 64×64px, or vector SVG. Updates immediately in browser tab.'}
              />

              {/* Simulated Browser Tab Mockup */}
              <div className="space-y-2 pt-2 border-t border-[#232323]">
                <span className="text-[11px] text-[#a8a6a1] font-mono flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#2563eb]" />
                  {isAr ? 'معاينة تبويب المتصفح الفعلي (Browser Tab Preview):' : 'Live Browser Tab Mockup:'}
                </span>

                <div className="rounded-xl border border-[#2b2b2b] bg-[#1f1f1f] p-2 overflow-hidden shadow-inner">
                  {/* Browser Bar */}
                  <div className="flex items-center gap-1.5 pb-2 px-1 border-b border-[#2b2b2b]/60">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="text-[10px] font-mono text-[#666] ml-2">Chrome / Safari / Edge</span>
                  </div>

                  {/* Browser Tab */}
                  <div className="pt-2 px-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-[#141414] border-t border-x border-[#333] max-w-[260px] shadow-sm">
                      {branding.favicon ? (
                        <img
                          src={branding.favicon}
                          alt="Favicon"
                          className="w-4 h-4 object-contain rounded-sm flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_FAVICON;
                          }}
                        />
                      ) : (
                        <div className="w-4 h-4 rounded bg-[#2563eb] flex-shrink-0" />
                      )}
                      <span className="text-xs text-[#e5e5e5] truncate font-medium font-sans">
                        {content.seo?.pageTitle || 'SHPIXELS | Sharif Abs'}
                      </span>
                      <span className="text-[10px] text-[#666] ml-auto">×</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text & Accent Color Customization */}
          <div className="pt-4 border-t border-[#232323] space-y-4 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                  {isAr ? 'اسم العلامة / النص (Brand Name)' : 'Brand / Logo Text'}
                </label>
                <input
                  type="text"
                  value={branding.logoText}
                  onChange={(e) => setBranding({ ...branding, logoText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                  {isAr ? 'شعار فرعي / تخصص (Brand Tagline)' : 'Brand Tagline'}
                </label>
                <input
                  type="text"
                  value={branding.logoSubtext}
                  onChange={(e) => setBranding({ ...branding, logoSubtext: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
                />
              </div>
            </div>

            {/* Accent Color Palette */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#2563eb]" />
                  {isAr ? 'اللون الرئيسي للموقع (Theme Accent Color)' : 'Primary Theme Accent Color'}
                </span>
                <span className="text-[11px] font-mono text-[#f1f2ed]">{branding.accentColor}</span>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setBranding({ ...branding, accentColor: preset.hex })}
                    className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                      branding.accentColor.toLowerCase() === preset.hex.toLowerCase()
                        ? 'border-white bg-[#262626] text-white shadow-sm'
                        : 'border-[#2b2b2b] bg-[#1b1b1b] text-[#a8a6a1] hover:border-[#444]'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full inline-block shadow-sm"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span>{preset.name.split(' ')[0]}</span>
                  </button>
                ))}

                <div className="flex items-center gap-1.5 ml-auto">
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    className="w-7 h-7 rounded border border-[#2b2b2b] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    className="w-24 px-2 py-1 rounded bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* HERO SECTION COPY */}
        {/* ============================================================ */}
        <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[#232323]">
            <Sliders className="w-4 h-4 text-[#2563eb]" />
            <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
              {isAr ? 'نصوص قسم العرض الرئيسي (Hero Section Copy)' : 'Hero Section Copy'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'شارة البداية (Hero Badge)' : 'Hero Badge'}
              </label>
              <input
                type="text"
                value={hero.badgeText}
                onChange={(e) => setHero({ ...hero, badgeText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'العنوان الرئيسي (Main Headline)' : 'Main Headline'}
              </label>
              <input
                type="text"
                value={hero.title}
                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
              {isAr ? 'الوصف الفرعي (Sub-Headline)' : 'Sub-Headline Description'}
            </label>
            <textarea
              rows={2}
              value={hero.subtitle}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'نص الزر الرئيسي (Primary Button)' : 'Primary Button Text'}
              </label>
              <input
                type="text"
                value={hero.primaryCtaText}
                onChange={(e) => setHero({ ...hero, primaryCtaText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'نص الزر الثانوي (Secondary Button)' : 'Secondary Button Text'}
              </label>
              <input
                type="text"
                value={hero.secondaryCtaText}
                onChange={(e) => setHero({ ...hero, secondaryCtaText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
              {isAr ? 'عناصر شريط التمرير (Marquee Ticker - افصل برمز •)' : 'Marquee Ticker Items (Separate with • symbol)'}
            </label>
            <input
              type="text"
              value={hero.marqueeText}
              onChange={(e) => setHero({ ...hero, marqueeText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* ABOUT DIRECTOR COPY */}
        {/* ============================================================ */}
        <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[#232323]">
            <Settings className="w-4 h-4 text-[#2563eb]" />
            <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
              {isAr ? 'نصوص نبذة المخرج (Sharif Abs - About Copy)' : 'About Director (Sharif Abs) Copy'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'عنوان النبذة الرئيسي' : 'Heading'}
              </label>
              <input
                type="text"
                value={about.heading}
                onChange={(e) => setAbout({ ...about, heading: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'الدور واللقب الفني' : 'Subtitle / Role'}
              </label>
              <input
                type="text"
                value={about.highlightText}
                onChange={(e) => setAbout({ ...about, highlightText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
              {isAr ? 'نص السيرة الذاتية (افصل الفقرات بسطر فارغ)' : 'Biography Paragraphs (Separate paragraphs with double newlines)'}
            </label>
            <textarea
              rows={4}
              value={about.bioText}
              onChange={(e) => setAbout({ ...about, bioText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
              {isAr ? 'المهارات والتقنيات (مفصولة بفاصلة)' : 'Skills & Toolchain (Comma-separated)'}
            </label>
            <input
              type="text"
              value={about.skillsText}
              onChange={(e) => setAbout({ ...about, skillsText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* FOOTER & LEGAL */}
        {/* ============================================================ */}
        <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[#232323]">
            <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
              {isAr ? 'تذييل الموقع وحقوق النشر (Footer & Legal)' : 'Footer & Legal Disclaimers'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'نص حقوق الملكية (Copyright)' : 'Copyright Text'}
              </label>
              <input
                type="text"
                value={footer.copyrightText}
                onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'اقتباس المخرج (Director Quotation)' : 'Director Quotation'}
              </label>
              <input
                type="text"
                value={footer.quote || ''}
                onChange={(e) => setFooter({ ...footer, quote: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-lg cursor-pointer"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? (isAr ? 'تم الحفظ بنجاح!' : 'Settings Saved!') : (isAr ? 'حفظ كافة التغييرات' : 'Save All Settings')}</span>
          </button>
        </div>
      </form>

      {/* ============================================================ */}
      {/* DATABASE & VERCEL CLOUD PERSISTENCE (SUPABASE)              */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#232323] gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand flex items-center gap-2">
                <span>{isAr ? 'قاعدة البيانات والنشر السحابي (Supabase & Vercel)' : 'Cloud Database & Vercel Persistence'}</span>
                {supabaseConfigState.isConfigured ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                    ✓ {isAr ? 'قاعدة البيانات متصلة' : 'Database Active'}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/40">
                    • {isAr ? 'وضع التخزين المحلي (Local)' : 'Local Storage Mode'}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-[#a8a6a1]">
                {isAr 
                  ? 'ربط قاعدة بيانات Supabase يضمن حفظ ونشر كافة التعديلات بشكل دائم عند استضافة الموقع على Vercel أو GitHub.' 
                  : 'Connecting Supabase ensures all site changes, images, and content persist permanently on serverless Vercel deployments.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 2500);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#232323] hover:bg-[#2c2c2c] border border-[#2b2b2b] text-[11px] font-mono text-[#f1f2ed] transition-colors cursor-pointer"
              title={isAr ? 'نسخ كود SQL لإنشاء الجداول في Supabase' : 'Copy SQL Schema to create tables in Supabase SQL editor'}
            >
              <Copy className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{copiedSql ? (isAr ? 'تم نسخ كود SQL ✓' : 'SQL Copied ✓') : (isAr ? 'نسخ كود SQL' : 'Copy SQL Script')}</span>
            </button>
          </div>
        </div>

        {dbStatusMsg && (
          <div className={`p-3.5 rounded-xl text-xs font-mono flex items-center gap-2 animate-fadeIn ${
            dbStatusMsg.isError 
              ? 'bg-red-950/50 border border-red-800/60 text-red-300' 
              : 'bg-emerald-950/50 border border-emerald-800/60 text-emerald-300'
          }`}>
            {dbStatusMsg.isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
            <span>{dbStatusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveDbCredentials} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'رابط مشروع Supabase (Project URL)' : 'Supabase Project URL'}
              </label>
              <input
                type="url"
                placeholder="https://your-project-id.supabase.co"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] font-mono focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'المفتاح العام (anon / public key)' : 'Supabase Anon Public Key'}
              </label>
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={dbAnonKey}
                onChange={(e) => setDbAnonKey(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] font-mono focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestDatabase}
                disabled={isTestingDb || !dbUrl}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#232323] hover:bg-[#2c2c2c] border border-[#2b2b2b] text-xs font-semibold text-[#f1f2ed] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isTestingDb ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#38bdf8]" />
                ) : (
                  <Server className="w-3.5 h-3.5 text-[#38bdf8]" />
                )}
                <span>{isAr ? 'فحص الاتصال (Ping)' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleSyncToSupabase}
                disabled={isSyncingDb || !supabaseConfigState.isConfigured}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-600/40 text-xs font-semibold text-emerald-300 disabled:opacity-40 transition-colors cursor-pointer"
              >
                {isSyncingDb ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{isAr ? 'مزامنة المحتوى الحالي للقاعدة الآن' : 'Push Content to Supabase'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isTestingDb}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-xs font-bold text-white shadow-md shadow-[#2563eb]/20 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isAr ? 'حفظ إعدادات قاعدة البيانات' : 'Save Database Credentials'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ============================================================ */}
      {/* SECURITY CREDENTIALS (SALTED SHA-256 ENCRYPTED AUTH)         */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[#232323]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb]/20 text-[#38bdf8] flex items-center justify-center border border-[#2563eb]/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
                {isAr ? 'أمان وكلمة مرور لوحة التحكم (Encrypted Password)' : 'Encrypted Admin Authentication Security'}
              </h3>
              <p className="text-[11px] text-[#a8a6a1]">
                {isAr 
                  ? 'يتم تخزين كلمة المرور بتشفير SHA-256 مع بصمة ملحية ديناميكية (Salt) لمنع أي اختراق أو استرجاع غير مصرح به.' 
                  : 'Passwords are cryptographically hashed using salted SHA-256 to ensure maximum protection against unauthorized access.'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            SHA-256 + Salt
          </span>
        </div>

        {passSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{passSuccess}</span>
          </div>
        )}

        {passError && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
              {isAr ? 'كلمة المرور الحالية *' : 'Current Admin Password *'}
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'كلمة المرور الجديدة *' : 'New Password (Min. 6 chars) *'}
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                {isAr ? 'تأكيد كلمة المرور الجديدة *' : 'Confirm New Password *'}
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingPass}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-xs font-bold text-white shadow-lg shadow-[#2563eb]/20 cursor-pointer disabled:opacity-50"
            >
              {isUpdatingPass ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>{isAr ? 'جارِ التشفير والتحديث...' : 'Encrypting & Updating...'}</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تحديث وتشفير كلمة المرور' : 'Encrypt & Save Password'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
