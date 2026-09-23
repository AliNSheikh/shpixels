import { useState } from 'react';
import { 
  Settings, Save, Check, Key, Sliders, Sparkles, Image as ImageIcon, 
  Globe, RotateCcw, Trash2, Eye, ShieldCheck, Palette,
  UploadCloud, RefreshCw, Clock
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
    publicationVersion
  } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [savedSuccess, setSavedSuccess] = useState(false);

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

  // Security password change state
  const [newPass, setNewPass] = useState('');
  const [passUpdated, setPassUpdated] = useState(false);

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

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass.trim()) return;
    changeAdminPassword(newPass.trim());
    setPassUpdated(true);
    setNewPass('');
    setTimeout(() => setPassUpdated(false), 3000);
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
      {/* SECURITY CREDENTIALS */}
      {/* ============================================================ */}
      <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-[#232323]">
          <Key className="w-4 h-4 text-[#2563eb]" />
          <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
            {isAr ? 'كلمة سر لوحة التحكم (Admin Passphrase)' : 'Admin Passphrase Security'}
          </h3>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-3 max-w-md">
          <label className="block text-xs font-mono uppercase text-[#a8a6a1]">
            {isAr ? 'تعيين كلمة سر جديدة' : 'Set New Admin Passphrase'}
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder={isAr ? 'أدخل كلمة السر الجديدة...' : 'Enter new secret passphrase...'}
              className="flex-1 px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#232323] hover:bg-[#2b2b2b] text-xs font-semibold text-[#f1f2ed] border border-[#2b2b2b] cursor-pointer"
            >
              {isAr ? 'تحديث' : 'Update'}
            </button>
          </div>
          {passUpdated && (
            <p className="text-xs text-emerald-400 font-mono">
              ✓ {isAr ? 'تم تحديث كلمة سر لوحة التحكم بنجاح.' : 'Admin passphrase updated and saved into local storage.'}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
