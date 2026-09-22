import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { EditableText } from '../live-editor/EditableText';
import { EditableImage } from '../live-editor/EditableImage';
import { SectionQuickActions } from '../live-editor/SectionQuickActions';
import { Trash2 } from 'lucide-react';

export function ClientLogos() {
  const { 
    content, 
    updateClientLogos, 
    addClientLogo, 
    deleteClientLogo, 
    isLiveEditMode 
  } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const logos = content.clientLogos || [];

  const handleUpdateLogoItem = (id: string, updates: Partial<typeof logos[0]>) => {
    const nextLogos = logos.map((l) => (l.id === id ? { ...l, ...updates } : l));
    updateClientLogos(nextLogos);
  };

  const handleAddLogo = () => {
    addClientLogo({
      id: `client-${Date.now()}`,
      name: isAr ? 'علامة تجارية جديدة' : 'New Brand Partner',
      logoUrl: '',
      websiteUrl: 'https://example.com'
    });
  };

  if (logos.length === 0 && !isLiveEditMode) return null;

  return (
    <section className="relative py-12 bg-[#141414] border-y border-[#262626] overflow-hidden">
      <SectionQuickActions
        sectionKey="clientLogos"
        title="Client Logos"
        titleAr="شعارات العملاء والشركاء"
        onAddItem={handleAddLogo}
        addItemLabel="+ Add Logo"
        addItemLabelAr="+ إضافة شريك"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#706e6a] mb-8">
          {isAr ? 'علامات تجارية وشركاء وثقوا بإبداعنا' : 'TRUSTED BY LEADING GLOBAL BRANDS & CREATIVE HOUSES'}
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {logos.map((client) => {
            const logoSrc = client.logoUrl || client.logo;

            return (
              <div 
                key={client.id}
                className="relative group flex items-center gap-3 px-4 py-2 rounded-xl bg-[#1c1c1c] border border-[#2b2b2b] hover:border-[#941e33]/50 transition-all shadow-sm"
              >
                {/* Logo Image with direct upload / edit in Live Edit Mode */}
                <EditableImage
                  src={logoSrc || ''}
                  onSave={(newUrl) => handleUpdateLogoItem(client.id, { logoUrl: newUrl, logo: newUrl })}
                  label={client.name}
                  aspectRatio="aspect-video"
                  className="h-7 max-w-[120px] flex items-center"
                  imageClassName="h-6 sm:h-7 object-contain max-w-[120px] grayscale group-hover:grayscale-0 transition-all"
                />

                {/* Editable Client Name */}
                <span className="text-xs font-medium text-[#a8a6a1] group-hover:text-white transition-colors">
                  <EditableText
                    value={client.name}
                    onSave={(val) => handleUpdateLogoItem(client.id, { name: val })}
                    label={isAr ? 'اسم العميل' : 'Client Name'}
                  />
                </span>

                {/* Delete button in live edit mode */}
                {isLiveEditMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteClientLogo(client.id);
                    }}
                    className="p-1 rounded bg-[#2b2b2b] hover:bg-[#941e33] text-[#888] hover:text-white transition-colors cursor-pointer ml-1"
                    title={isAr ? 'حذف هذا الشعار' : 'Delete logo'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

