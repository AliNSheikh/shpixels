import { Film, Sparkles, Trash2, Plus } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { AVAILABLE_ICONS } from '../common/IconPicker';
import { EditableText } from '../live-editor/EditableText';
import { EditableIcon } from '../live-editor/EditableIcon';
import { SectionQuickActions } from '../live-editor/SectionQuickActions';

export function Services() {
  const { 
    content, 
    updateService, 
    addService, 
    deleteService, 
    updateSectionHeader, 
    isLiveEditMode 
  } = useContent();
  const { language, t } = useLanguage();
  const isAr = language === 'ar';
  const services = content.services || [];

  const sectionBadge = content.sectionHeaders?.services?.badge || t('services.badge', 'CREATIVE CAPABILITIES');
  const sectionTitle = content.sectionHeaders?.services?.title || t('services.title', 'SPECIALIZED SERVICES');
  const sectionDesc = content.sectionHeaders?.services?.description || t('services.desc', 'From script concept and 4K cinema shooting to neural AI visual synthesis and broadcast-grade DaVinci Resolve color grading.');

  const handleAddService = () => {
    addService({
      id: `svc-${Date.now()}`,
      title: isAr ? 'خدمة إبداعية جديدة' : 'New Creative Service',
      subtitle: isAr ? 'إنتاج متميز' : 'High-End Production',
      description: isAr ? 'وصف تفصيلي للخدمة الجديدة والمزايا التي تقدمها للعملاء.' : 'Detailed description of the new service and value provided to clients.',
      category: 'Commercial',
      icon: 'Film',
      features: isAr ? ['تصوير سينمائي 4K', 'مونتاج احترافي', 'مؤثرات بصرية'] : ['4K Cinema Capture', 'Master Color Grade', 'Full Audio Design']
    });
  };

  return (
    <section id="services" className="relative py-16 sm:py-24 bg-[#171717] border-t border-[#2b2b2b]">
      <SectionQuickActions
        sectionKey="services"
        title="Services & Capabilities"
        titleAr="الخدمات والقدرات (Services)"
        badge={sectionBadge}
        headerTitle={sectionTitle}
        headerDescription={sectionDesc}
        onAddItem={handleAddService}
        addItemLabel="+ Add Service"
        addItemLabelAr="+ إضافة خدمة"
        onUpdateHeader={(badge, title, description) => {
          updateSectionHeader('services', { badge, title, description });
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d1d1d] border border-[#2b2b2b] text-[10px] sm:text-[11px] font-mono tracking-widest text-[#a8a6a1] uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#941e33]" />
              <span>
                <EditableText
                  value={sectionBadge}
                  onSave={(val) => updateSectionHeader('services', { badge: val })}
                  label={isAr ? 'شارة الخدمات' : 'Services Badge'}
                />
              </span>
            </div>
            <h2 className="text-2xl sm:text-5xl font-black text-[#f1f2ed] tracking-tight uppercase font-quicksand">
              <EditableText
                value={sectionTitle}
                onSave={(val) => updateSectionHeader('services', { title: val })}
                label={isAr ? 'عنوان الخدمات' : 'Services Title'}
              />
            </h2>
          </div>
          <div className="text-xs sm:text-base text-[#a8a6a1] max-w-md">
            <EditableText
              value={sectionDesc}
              onSave={(val) => updateSectionHeader('services', { description: val })}
              multiline
              label={isAr ? 'وصف الخدمات' : 'Services Description'}
            />
          </div>
        </div>

        {/* Services Grid: 2 COLUMNS ON MOBILE, 3 COLUMNS ON DESKTOP */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {services.map((service) => {
            return (
              <div
                key={service.id}
                className="group relative rounded-xl sm:rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] p-3.5 sm:p-7 transition-all duration-300 hover:border-[#941e33]/60 hover:shadow-xl hover:shadow-[#941e33]/5 flex flex-col justify-between"
              >
                {/* Delete button in Live Edit Mode */}
                {isLiveEditMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteService(service.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#252525] hover:bg-[#941e33] text-[#777] hover:text-white transition-colors cursor-pointer z-20"
                    title={isAr ? 'حذف هذه الخدمة' : 'Delete Service'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-6">
                    {/* Live Editable Icon Picker */}
                    <EditableIcon
                      iconName={service.icon || 'Film'}
                      onSave={(newIcon) => updateService(service.id, { icon: newIcon })}
                      label={service.title}
                      className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#232323] border border-[#2b2b2b] group-hover:bg-[#941e33] text-[#b8283f] group-hover:text-white flex items-center justify-center transition-colors duration-300 flex-shrink-0"
                      iconClassName="w-4 h-4 sm:w-6 sm:h-6"
                    />

                    {/* Category */}
                    <span className="text-[8px] sm:text-[10px] font-mono tracking-wider uppercase text-[#706e6a] bg-[#232323] px-2 py-0.5 rounded truncate max-w-[50%]">
                      <EditableText
                        value={service.category}
                        onSave={(val) => updateService(service.id, { category: val })}
                        label={isAr ? 'التصنيف' : 'Category'}
                      />
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-xl font-bold text-[#f1f2ed] group-hover:text-white transition-colors mb-1 sm:mb-2 font-quicksand">
                    <EditableText
                      value={service.title}
                      onSave={(val) => updateService(service.id, { title: val })}
                      label={isAr ? 'اسم الخدمة' : 'Service Title'}
                    />
                  </h3>
                  <div className="text-[10px] sm:text-xs text-[#b8283f] font-medium tracking-wide mb-1.5 sm:mb-3">
                    <EditableText
                      value={service.subtitle}
                      onSave={(val) => updateService(service.id, { subtitle: val })}
                      label={isAr ? 'العنوان الفرعي' : 'Subtitle'}
                    />
                  </div>
                  <div className="text-[11px] sm:text-sm text-[#a8a6a1] leading-relaxed mb-3 sm:mb-6">
                    <EditableText
                      value={service.description}
                      onSave={(val) => updateService(service.id, { description: val })}
                      multiline
                      label={isAr ? 'وصف الخدمة' : 'Service Description'}
                    />
                  </div>
                </div>

                {service.features && service.features.length > 0 && (
                  <div className="pt-2 sm:pt-4 border-t border-[#232323] space-y-1 sm:space-y-1.5">
                    {service.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#706e6a]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#941e33] shrink-0" />
                        <EditableText
                          value={f}
                          onSave={(val) => {
                            const nextFeatures = [...(service.features || [])];
                            nextFeatures[i] = val;
                            updateService(service.id, { features: nextFeatures });
                          }}
                          label={`${isAr ? 'ميزة' : 'Feature'} ${i + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
