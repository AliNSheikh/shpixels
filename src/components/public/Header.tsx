import { useState, useEffect } from 'react';
import { Menu, X, Film, ArrowRight, Globe, Sparkles } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { EditableText } from '../live-editor/EditableText';
import { EditableImage } from '../live-editor/EditableImage';

export function Header() {
  const { 
    content, 
    setIsAdminView, 
    isLiveEditMode, 
    toggleLiveEditMode, 
    updateBranding 
  } = useContent();
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut listener to access admin without public button (Ctrl+Shift+A or Cmd+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminView(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsAdminView]);

  const navItems = [...content.navigation]
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Easter egg: clicking logo 3 times rapidly opens admin
  const handleLogoClick = (e: React.MouseEvent) => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setIsAdminView(true);
        return 0;
      }
      setTimeout(() => setClickCount(0), 1000);
      return next;
    });
  };

  // Helper to translate default labels if in Arabic
  const getNavLabel = (label: string, id: string) => {
    if (language === 'en') return label;
    const map: Record<string, string> = {
      'Home': 'الرئيسية',
      'Showreel': 'العرض الترويجي',
      'Work': 'الأعمال',
      'Portfolio': 'الأعمال',
      'About': 'من أنا',
      'Services': 'الخدمات',
      'Process': 'مراحل الإنتاج',
      'Gallery': 'المعرض',
      'Contact': 'تواصل معي'
    };
    return map[label] || label;
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#171717]/90 backdrop-blur-md border-b border-[#2b2b2b]/70 py-3 shadow-xl'
          : 'bg-gradient-to-b from-[#171717]/90 via-[#171717]/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo with live edit support */}
          <div className="flex items-center gap-2.5">
            <EditableImage
              src={content.branding.logoImage || ''}
              onSave={(url) => updateBranding({ logoImage: url })}
              label={language === 'ar' ? 'شعار الموقع (Logo)' : 'Website Logo'}
              aspectRatio="aspect-square"
              className="w-9 h-9"
            >
              <a
                id="brand-logo-link"
                href="#hero"
                onClick={(e) => {
                  handleNavClick(e, '#hero');
                  handleLogoClick(e);
                }}
                className="group flex items-center focus:outline-none cursor-pointer"
              >
                {content.branding.logoImage ? (
                  <img 
                    src={content.branding.logoImage} 
                    alt={content.branding.logoText || 'MOGRAFIX'} 
                    className="w-9 h-9 object-contain rounded-lg" 
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-[#941e33] flex items-center justify-center text-white font-black tracking-tighter shadow-md group-hover:bg-[#b8283f] transition-colors border border-[#b8283f]/40">
                    <Film className="w-5 h-5 text-white" />
                  </div>
                )}
              </a>
            </EditableImage>

            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-wider text-[#f1f2ed] uppercase font-quicksand flex items-center">
                <EditableText
                  value={content.branding.logoText || 'MOGRAFIX'}
                  onSave={(val) => updateBranding({ logoText: val })}
                  label={language === 'ar' ? 'اسم الشعار' : 'Brand Name'}
                />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#941e33] ml-1" />
              </span>
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#a8a6a1] font-mono -mt-1 font-medium">
                <EditableText
                  value={content.branding.logoSubtext || (language === 'ar' ? 'إنتاج سينمائي وإخراج بصري' : 'FILMMAKER & CREATIVE')}
                  onSave={(val) => updateBranding({ logoSubtext: val })}
                  label={language === 'ar' ? 'النص الفرعي للشعار' : 'Logo Subtext'}
                />
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-[#1d1d1d]/80 px-4 py-1.5 rounded-full border border-[#2b2b2b] shadow-inner backdrop-blur-sm">
            {navItems.map((item) => (
              <a
                key={item.id}
                id={`nav-link-${item.id}`}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="px-3.5 py-1.5 text-xs lg:text-sm font-medium text-[#a8a6a1] hover:text-[#f1f2ed] hover:bg-[#232323] rounded-full transition-all duration-200"
              >
                {getNavLabel(item.label, item.id)}
              </a>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Live Visual Editor Toggle Button */}
            <button
              type="button"
              onClick={toggleLiveEditMode}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                isLiveEditMode
                  ? 'bg-[#941e33] text-white shadow-md shadow-[#941e33]/30 border border-[#b8283f] ring-2 ring-[#941e33]/30'
                  : 'bg-[#1d1d1d] hover:bg-[#232323] text-[#a8a6a1] hover:text-white border border-[#2b2b2b]'
              }`}
              title={isLiveEditMode ? (language === 'ar' ? 'إيقاف وضع التحرير المباشر' : 'Disable Live Edit Mode') : (language === 'ar' ? 'تفعيل وضع التحرير المباشر لجميع الأقسام' : 'Enable Live Visual Editor for all sections')}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLiveEditMode ? 'text-white animate-spin' : 'text-[#941e33]'}`} />
              <span>{language === 'ar' ? (isLiveEditMode ? 'التحرير: مُفعل' : 'تعديل الموقع') : (isLiveEditMode ? 'Edit Mode: ON' : 'Live Editor')}</span>
            </button>

            {/* Language Switcher Button (EN | العربية) */}
            <button
              id="language-toggle-btn"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium text-[#a8a6a1] hover:text-[#f1f2ed] bg-[#1d1d1d] hover:bg-[#232323] border border-[#2b2b2b] transition-all cursor-pointer"
              title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
            >
              <Globe className="w-3.5 h-3.5 text-[#941e33]" />
              <span className={language === 'en' ? 'font-bold text-[#f1f2ed]' : 'text-[#706e6a]'}>EN</span>
              <span className="text-[#444]">/</span>
              <span className={language === 'ar' ? 'font-bold text-[#f1f2ed]' : 'text-[#706e6a]'}>عربي</span>
            </button>

            {/* Direct Contact CTA */}
            <a
              id="header-contact-btn"
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase text-white bg-[#941e33] hover:bg-[#b8283f] transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#941e33]/20 border border-[#b8283f]/40 group cursor-pointer"
            >
              <span>{t('nav.getInTouch', 'Get in Touch')}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'} transition-transform`} />
            </a>
          </div>

          {/* Mobile Actions: Language toggle + Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-1.5 px-2.5 rounded-lg text-xs font-mono text-[#a8a6a1] hover:text-white bg-[#1d1d1d] border border-[#2b2b2b]"
            >
              {language === 'en' ? 'عربي' : 'EN'}
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#f1f2ed] hover:bg-[#232323] focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className="md:hidden bg-[#171717] border-b border-[#2b2b2b] px-5 py-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <a
                key={item.id}
                id={`mobile-nav-link-${item.id}`}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#f1f2ed] hover:bg-[#232323] hover:text-[#b8283f] transition-colors"
              >
                {getNavLabel(item.label, item.id)}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-[#2b2b2b] flex flex-col gap-2.5">
            <a
              id="mobile-contact-cta"
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="w-full py-3 rounded-lg text-center font-semibold text-sm tracking-wider uppercase text-white bg-[#941e33] hover:bg-[#b8283f] transition-colors shadow-md"
            >
              {t('nav.getInTouch', 'Get in Touch')}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
