import { Camera, CheckCircle2, Award, Clapperboard, Layers } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { OptimizedImage } from '../common/OptimizedImage';
import { EditableText } from '../live-editor/EditableText';
import { EditableImage } from '../live-editor/EditableImage';
import { SectionQuickActions } from '../live-editor/SectionQuickActions';

export function About() {
  const { content, updateAbout } = useContent();
  const { language, t } = useLanguage();
  const isAr = language === 'ar';
  const about = content.about;

  const handleUpdateStat = (id: string, updates: Partial<typeof about.stats[0]>) => {
    const nextStats = (about.stats || []).map((s) => (s.id === id ? { ...s, ...updates } : s));
    updateAbout({ stats: nextStats });
  };

  const handleUpdateParagraph = (index: number, text: string) => {
    const nextParas = [...(about.bioParagraphs || [])];
    nextParas[index] = text;
    updateAbout({ bioParagraphs: nextParas });
  };

  return (
    <section id="about" className="relative py-16 sm:py-24 bg-[#171717] overflow-hidden">
      <SectionQuickActions
        sectionKey="about"
        title="About Director"
        titleAr="عن المخرج (About)"
        badge={about.badge}
        headerTitle={about.heading}
        headerDescription={about.highlightText}
        onUpdateHeader={(badge, title, desc) => {
          updateAbout({ badge, heading: title, highlightText: desc });
        }}
      />

      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#941e33]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Column: Image with cinematic badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Frame */}
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-tr from-[#941e33]/40 via-[#232323] to-transparent -z-10 blur-sm" />
              
              <div className="relative rounded-2xl overflow-hidden bg-[#1d1d1d] border border-[#2b2b2b] shadow-2xl aspect-[4/5]">
                <EditableImage
                  src={about.profileImage}
                  onSave={(newUrl) => updateAbout({ profileImage: newUrl })}
                  label={isAr ? 'صورة المخرج الشخصية' : 'Director Profile Photo'}
                  aspectRatio="aspect-[4/5]"
                  className="w-full h-full"
                >
                  <OptimizedImage
                    src={about.profileImage}
                    alt={about.highlightText || 'Mohammad Abdallah'}
                    sizes="(max-width: 1024px) 100vw, 480px"
                    className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
                  />
                </EditableImage>

                <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-transparent to-transparent opacity-80 pointer-events-none" />
                
                {/* Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 p-3.5 sm:p-4 rounded-xl bg-[#171717]/85 backdrop-blur-md border border-[#2b2b2b] z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#941e33] flex items-center justify-center text-white flex-shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#f1f2ed] uppercase tracking-wide">
                        {isAr ? 'محمد عبدالله (Mo)' : 'Mohammad Abdallah (Mo)'}
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#a8a6a1] font-mono">
                        {isAr ? 'مخرج ومدير تصوير سينمائي' : 'Director & Lead Cinematographer'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating experience pill */}
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-[#941e33] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-lg border border-[#b8283f]/60 flex items-center gap-2 z-10">
                <Award className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  <EditableText
                    value={String(about.experienceYears || 7)}
                    onSave={(val) => updateAbout({ experienceYears: parseInt(val) || 7 })}
                    label={isAr ? 'سنوات الخبرة' : 'Experience Years'}
                  />
                  + {isAr ? 'سنوات إبداع' : 'Years Storytelling'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Bio and details */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d1d1d] border border-[#2b2b2b] text-[10px] sm:text-[11px] font-mono tracking-widest text-[#a8a6a1] uppercase">
                <Clapperboard className="w-3.5 h-3.5 text-[#941e33]" />
                <span>
                  <EditableText
                    value={about.badge || (isAr ? 'المبدع خلف العدسة' : 'THE CREATIVE BEHIND THE LENS')}
                    onSave={(val) => updateAbout({ badge: val })}
                    label={isAr ? 'شارة التعريف' : 'About Badge'}
                  />
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#f1f2ed] tracking-tight uppercase font-quicksand leading-tight">
                <EditableText
                  value={about.heading || (isAr ? 'صناعة قصص بصرية تبقى حية في الذاكرة.' : 'Crafting visual stories that linger in the memory.')}
                  onSave={(val) => updateAbout({ heading: val })}
                  multiline
                  label={isAr ? 'العنوان' : 'Heading'}
                />
              </h2>
              <div className="text-sm sm:text-lg font-medium text-[#b8283f]">
                <EditableText
                  value={about.highlightText || (isAr ? 'محمد عبدالله (Mo) — مخرج أفلام ومصمم تجارب سينمائية' : 'Mohammad Abdallah (Mo) — Filmmaker & Visual Storyteller')}
                  onSave={(val) => updateAbout({ highlightText: val })}
                  label={isAr ? 'النص البارز' : 'Highlight Text'}
                />
              </div>
            </div>

            {/* Paragraphs */}
            <div className="space-y-3 sm:space-y-4 text-[#a8a6a1] text-xs sm:text-base leading-relaxed">
              {(about.bioParagraphs && about.bioParagraphs.length > 0 ? about.bioParagraphs : [
                'مخرج سينمائي ومدير تصوير مقيم بين الشرق الأوسط وأوروبا. على مدار 7 سنوات، تخصصت في توجيه الكاميرا لتحويل الأفكار الجريئة إلى إنتاجات سينمائية استثنائية تأسر الجمهور.',
                'أجمع بين أحدث عتاد التصوير السينمائي (Red، Sony FX Cinema، وعدسات Anamorphic) وبين تقنيات الذكاء الاصطناعي والموشن جرافيكس لتقديم محتوى بصري غير مسبوق في الإعلانات التجارية وفعاليات العلامات الفاخرة.'
              ]).map((paragraph, index) => (
                <div key={index}>
                  <EditableText
                    value={paragraph}
                    onSave={(val) => handleUpdateParagraph(index, val)}
                    multiline
                    label={`${isAr ? 'الفقرة' : 'Paragraph'} ${index + 1}`}
                  />
                </div>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-[#2b2b2b]">
              {about.stats && about.stats.map((stat) => (
                <div key={stat.id} className="p-3 sm:p-4 rounded-xl bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[#941e33]/50 transition-colors">
                  <span className="text-xl sm:text-3xl font-extrabold text-[#f1f2ed] font-quicksand block">
                    <EditableText
                      value={stat.value}
                      onSave={(val) => handleUpdateStat(stat.id, { value: val })}
                      label={isAr ? 'قيمة الإحصائية' : 'Stat Value'}
                    />
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#a8a6a1] uppercase tracking-wider font-mono">
                    <EditableText
                      value={stat.label}
                      onSave={(val) => handleUpdateStat(stat.id, { label: val })}
                      label={isAr ? 'تسمية الإحصائية' : 'Stat Label'}
                    />
                  </span>
                </div>
              ))}
            </div>

            {/* Capabilities / Tools */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#706e6a]">
                <Layers className="w-3.5 h-3.5 text-[#941e33]" />
                <span>{isAr ? 'المهارات وأدوات الإنتاج' : 'Core Competencies & Toolchain'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {about.skills && about.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium text-[#f1f2ed] bg-[#1d1d1d] border border-[#2b2b2b]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#941e33]" />
                    <EditableText
                      value={skill}
                      onSave={(val) => {
                        const nextSkills = [...(about.skills || [])];
                        nextSkills[index] = val;
                        updateAbout({ skills: nextSkills });
                      }}
                      label={isAr ? 'المهارة' : 'Skill'}
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
