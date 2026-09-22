import { Film, ArrowUp } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { EditableText } from '../live-editor/EditableText';
import { EditableImage } from '../live-editor/EditableImage';

export function Footer() {
  const { content, updateBranding, updateFooter } = useContent();
  const { language, t } = useLanguage();
  const isAr = language === 'ar';
  const footer = content.footer;
  const branding = content.branding;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-[#111111] border-t border-[#232323] py-16 text-[#a8a6a1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-[#232323]">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <EditableImage
                src={branding.logoImage}
                onSave={(newUrl) => updateBranding({ logoImage: newUrl })}
                label={isAr ? 'شعار الفوتر' : 'Footer Logo'}
                className="w-8 h-8 rounded-lg overflow-hidden shrink-0"
              >
                {branding.logoImage ? (
                  <img 
                    src={branding.logoImage} 
                    alt={branding.logoText || 'MOGRAFIX'} 
                    className="w-8 h-8 object-contain rounded-lg" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#941e33] flex items-center justify-center text-white font-black">
                    <Film className="w-4 h-4" />
                  </div>
                )}
              </EditableImage>

              <span className="font-extrabold text-2xl tracking-wider text-[#f1f2ed] uppercase font-quicksand">
                <EditableText
                  value={branding.logoText || 'MOGRAFIX'}
                  onSave={(val) => updateBranding({ logoText: val })}
                  label={isAr ? 'اسم العلامة' : 'Brand Name'}
                />
              </span>
            </div>

            <p className="text-xs font-mono uppercase tracking-widest text-[#706e6a]">
              <EditableText
                value={footer.disclaimer || (isAr 
                  ? 'استوديو الإخراج السينمائي وتصوير الإعلانات التجارية والفعاليات الفاخرة.' 
                  : 'Professional videographer portfolio & creative production studio.')}
                onSave={(val) => updateFooter({ disclaimer: val })}
                label={isAr ? 'وصف الفوتر' : 'Footer Subtext'}
              />
            </p>
          </div>

          {/* Quote */}
          <div className={`max-w-md text-xs sm:text-sm italic text-[#706e6a] ${isAr ? 'border-r-2 pr-4' : 'border-l-2 pl-4'} border-[#941e33]`}>
            "
            <EditableText
              value={footer.quote || (isAr ? 'كل إطار سينمائي يحمل قصة، وكل حركة كاميرا تبني شعوراً لا يُنسى.' : 'Every frame tells a story, and every camera movement crafts unforgettable emotion.')}
              onSave={(val) => updateFooter({ quote: val })}
              multiline
              label={isAr ? 'اقتباس الفوتر' : 'Footer Quote'}
            />
            "
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1d1d1d] hover:bg-[#232323] text-xs font-mono uppercase text-[#f1f2ed] border border-[#2b2b2b] transition-colors cursor-pointer"
          >
            <span>{t('footer.top', 'Back to Top')}</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#941e33]" />
          </button>
        </div>

        {/* Bottom bar without any admin button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#706e6a]">
          <div>
            <EditableText
              value={footer.copyrightText || '© 2026 MOGRAFIX. All rights reserved.'}
              onSave={(val) => updateFooter({ copyrightText: val })}
              label={isAr ? 'حقوق النشر' : 'Copyright'}
            />
          </div>

          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-[#f1f2ed] transition-colors">{t('nav.home', 'Home')}</a>
            <a href="#portfolio" className="hover:text-[#f1f2ed] transition-colors">{t('nav.work', 'Work')}</a>
            <a href="#about" className="hover:text-[#f1f2ed] transition-colors">{t('nav.about', 'About')}</a>
            <a href="#contact" className="hover:text-[#f1f2ed] transition-colors">{t('nav.contact', 'Contact')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
