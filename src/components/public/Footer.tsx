import { useEffect, useMemo, useState } from 'react';
import { ArrowUp, Film, Mail, Phone } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getConfiguredSocialLinks, getPlatformLabel, SocialIcon } from '../common/SocialIcon';

export function Footer() {
  const { content, setIsAdminView } = useContent();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isAr = language === 'ar';
  const { branding, contact, footer, navigation } = content;
  const [logoError, setLogoError] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [branding.logoImage, branding.logoLight, branding.logoDark, theme]);

  useEffect(() => {
    const updateBackToTop = () => {
      const doc = document.documentElement;
      const distanceFromBottom = doc.scrollHeight - (window.scrollY + window.innerHeight);
      setShowBackToTop(distanceFromBottom <= 360 && window.scrollY > 240);
    };

    updateBackToTop();
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    window.addEventListener('resize', updateBackToTop);
    return () => {
      window.removeEventListener('scroll', updateBackToTop);
      window.removeEventListener('resize', updateBackToTop);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [...navigation]
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);

  const footerLinks = [...(content.footerLinks || [])]
    .filter((item) => item.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const activeLogo = theme === 'light'
    ? (branding.logoDark || branding.logoImage || branding.logoLight || '')
    : (branding.logoLight || branding.logoImage || branding.logoDark || '');

  const socialLinks = getConfiguredSocialLinks(contact);
  const isHomePage = typeof window === 'undefined' || window.location.pathname === '/';
  const resolveSiteHref = (href: string) => (!isHomePage && href.startsWith('#') ? `/${href}` : href);

  const rightsNotice = useMemo(() => {
    const configured = String(footer.copyrightText || '').trim();
    if (/all rights reserved/i.test(configured)) return configured;
    const base = `© ${new Date().getFullYear()} ${branding.siteName}. All Rights Reserved.`;
    return configured ? `${base} ${configured}` : base;
  }, [footer.copyrightText, branding.siteName]);

  const getNavLabel = (label: string) => {
    if (!isAr) return label;
    const map: Record<string, string> = {
      Home: 'الرئيسية',
      Brands: 'العلامات التجارية',
      Showreel: 'العرض الترويجي',
      Work: 'الأعمال',
      Portfolio: 'الأعمال',
      About: 'من أنا',
      Services: 'الخدمات',
      Process: 'مراحل الإنتاج',
      Gallery: 'المعرض',
      Contact: 'تواصل معي'
    };
    return map[label] || label;
  };

  return (
    <>
      <footer id="main-footer" className="relative bg-[#111111] border-t border-[#2b2b2b] text-[#a8a6a1] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-[#2563eb]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-7 lg:gap-10 pb-8 border-b border-[#232323]">
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2.5">
                {activeLogo && !logoError ? (
                  <img
                    src={activeLogo}
                    alt={branding.logoText || branding.siteName}
                    className="h-9 w-auto max-w-[190px] object-contain rounded-md"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-[var(--site-accent)] flex items-center justify-center text-white">
                    <Film className="w-5 h-5" />
                  </div>
                )}
                {(!activeLogo || logoError) && (
                  <span className="font-extrabold text-xl tracking-wider text-[#f1f2ed] uppercase font-quicksand">
                    {branding.logoText || branding.siteName}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed max-w-sm">
                {footer.disclaimer || (isAr
                  ? 'استوديو إنتاج بصري وسينمائي يركز على القصص، الإعلانات والمحتوى الإبداعي.'
                  : 'Cinematic production and visual storytelling for brands, campaigns, events and creative projects.')}
              </p>

              {socialLinks.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {socialLinks.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[var(--site-accent)] hover:text-white transition-colors border border-[#2b2b2b]"
                      title={getPlatformLabel(item.platform, item.label)}
                      aria-label={getPlatformLabel(item.platform, item.label)}
                    >
                      <SocialIcon platform={item.platform} className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#f1f2ed] font-semibold mb-3">
                {isAr ? 'روابط سريعة' : 'Quick Links'}
              </h4>
              <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2 text-xs">
                {navItems.slice(0, 8).map((item) => (
                  <li key={item.id}>
                    <a href={resolveSiteHref(item.href)} className="hover:text-[#f1f2ed] transition-colors">
                      {getNavLabel(item.label)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#f1f2ed] font-semibold mb-3">
                {isAr ? 'تواصل' : 'Contact'}
              </h4>
              <div className="space-y-2.5 text-xs">
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-[#f1f2ed] transition-colors">
                    <Mail className="w-3.5 h-3.5 text-[var(--site-accent)]" />
                    <span className="truncate">{contact.email}</span>
                  </a>
                )}
                {contact.phone && (
                  <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 hover:text-[#f1f2ed] transition-colors">
                    <Phone className="w-3.5 h-3.5 text-[var(--site-accent)]" />
                    <span>{contact.phone}</span>
                  </a>
                )}
                {contact.location && (
                  <p className="text-[#706e6a] leading-relaxed">{contact.location}</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#f1f2ed] font-semibold mb-3">
                {isAr ? 'عن الاستوديو' : 'Studio'}
              </h4>
              <p className="text-xs italic leading-relaxed text-[#a8a6a1]">
                “{footer.quote || 'Every frame carries purpose.'}”
              </p>
              {branding.logoSubtext && (
                <p className="mt-3 text-[10px] font-mono uppercase tracking-wider text-[#706e6a]">
                  {branding.logoSubtext}
                </p>
              )}
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-[11px] font-mono text-[#706e6a]">
            <p className="text-center sm:text-left">{rightsNotice}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
              {footerLinks.map((item) => (
                <a
                  key={item.id}
                  href={resolveSiteHref(item.url)}
                  target={item.target || '_self'}
                  rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                  className="hover:text-[#f1f2ed] transition-colors"
                >
                  {item.label}
                </a>
              ))}
              {footer.legalNotice && <span>{footer.legalNotice}</span>}
              <button
                id="footer-admin-login-link"
                onClick={() => setIsAdminView(true)}
                className="hover:text-[#a8a6a1] transition-colors cursor-pointer"
              >
                Director Portal
              </button>
            </div>
          </div>
        </div>
      </footer>

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#2563eb] hover:bg-[#3b82f6] text-white text-xs font-semibold shadow-[0_12px_35px_-12px_rgba(37,99,235,0.75)] transition-all cursor-pointer"
          aria-label={isAr ? 'العودة إلى أعلى الصفحة' : 'Back to Top'}
          title={isAr ? 'العودة إلى أعلى الصفحة' : 'Back to Top'}
        >
          <ArrowUp className="w-4 h-4" />
          <span className="hidden sm:inline">{isAr ? 'للأعلى' : 'Back to Top'}</span>
        </button>
      )}
    </>
  );
}
