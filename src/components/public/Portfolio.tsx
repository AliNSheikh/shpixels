import { useState, useMemo } from 'react';
import { Play, Sparkles, FolderKanban, Trash2, Plus } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { ProjectItem } from '../../types/content';
import { ProjectModal } from './ProjectModal';
import { useLanguage } from '../../context/LanguageContext';
import { OptimizedImage } from '../common/OptimizedImage';
import { EditableText } from '../live-editor/EditableText';
import { EditableImage } from '../live-editor/EditableImage';
import { SectionQuickActions } from '../live-editor/SectionQuickActions';

export function Portfolio() {
  const { 
    content, 
    categories: contextCategories, 
    updateProject, 
    addProject, 
    deleteProject, 
    updateSectionHeader, 
    isLiveEditMode 
  } = useContent();
  const { language, t } = useLanguage();
  const isAr = language === 'ar';

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  const publishedProjects = useMemo(() => {
    return [...content.projects]
      .filter((p) => isLiveEditMode || p.published)
      .sort((a, b) => a.order - b.order);
  }, [content.projects, isLiveEditMode]);

  const categories = useMemo(() => {
    if (contextCategories && contextCategories.length > 0) {
      return ['All', ...contextCategories];
    }
    const set = new Set<string>();
    publishedProjects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [publishedProjects, contextCategories]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return publishedProjects;
    return publishedProjects.filter((p) => p.category === selectedCategory);
  }, [publishedProjects, selectedCategory]);

  const getCategoryLabel = (cat: string) => {
    if (!isAr) return cat;
    if (cat === 'All') return 'الكل';
    const dict: Record<string, string> = {
      'Commercial & Brand Ads': 'إعلانات تجارية',
      'AI & Motion Graphics': 'ذكاء اصطناعي وموشن',
      'Luxury Weddings & Events': 'أعراس وفعاليات',
      'Fitness & Sports Cinematography': 'تصوير رياضي',
      'Aerial 4K Drone': 'تصوير جوي درون',
      'Healthcare & Medical Films': 'أفلام طبية'
    };
    return dict[cat] || cat;
  };

  const sectionBadge = content.sectionHeaders?.portfolio?.badge || t('portfolio.badge', 'SELECTED PRODUCTIONS');
  const sectionTitle = content.sectionHeaders?.portfolio?.title || t('portfolio.title', 'FEATURED PORTFOLIO');
  const sectionDesc = content.sectionHeaders?.portfolio?.description || t('portfolio.desc', 'Click any production to view the full 4K YouTube film, creative backstory, production stills, and directorial credits.');

  const handleAddProject = () => {
    const newId = `proj-${Date.now()}`;
    const defaultCat = categories[1] || 'Commercial & Brand Ads';
    addProject({
      id: newId,
      title: isAr ? 'عمل سينمائي جديد' : 'New Cinema Production',
      category: defaultCat,
      client: isAr ? 'عميل رائد' : 'Premier Client',
      year: new Date().getFullYear().toString(),
      description: isAr ? 'وصف سينمائي قصير للعمل الجديد وأهدافه الإنتاجية.' : 'Short cinematic overview of the new production and creative goals.',
      coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
      published: true,
      featured: false,
      order: content.projects.length + 1,
      videos: [{
        id: `vid-${Date.now()}`,
        youtubeUrl: 'https://youtu.be/ScMzIvxBSi4',
        videoId: 'ScMzIvxBSi4',
        title: isAr ? 'الفيديو الرئيسي' : 'Main Film',
        caption: '4K Cinema'
      }],
      gallery: [],
      externalLinks: []
    });
  };

  return (
    <section id="portfolio" className="relative py-16 sm:py-24 bg-[#171717]">
      <SectionQuickActions
        sectionKey="portfolio"
        title="Works Portfolio"
        titleAr="معرض الأعمال (Portfolio)"
        badge={sectionBadge}
        headerTitle={sectionTitle}
        headerDescription={sectionDesc}
        onAddItem={handleAddProject}
        addItemLabel="+ Add Project"
        addItemLabelAr="+ إضافة عمل جديد"
        onUpdateHeader={(badge, title, description) => {
          updateSectionHeader('portfolio', { badge, title, description });
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d1d1d] border border-[#2b2b2b] text-[10px] sm:text-[11px] font-mono tracking-widest text-[#a8a6a1] uppercase mb-3">
              <FolderKanban className="w-3.5 h-3.5 text-[#941e33]" />
              <span>
                <EditableText
                  value={sectionBadge}
                  onSave={(val) => updateSectionHeader('portfolio', { badge: val })}
                  label={isAr ? 'شارة المعرض' : 'Portfolio Badge'}
                />
              </span>
            </div>
            <h2 className="text-2xl sm:text-5xl font-black text-[#f1f2ed] tracking-tight uppercase font-quicksand">
              <EditableText
                value={sectionTitle}
                onSave={(val) => updateSectionHeader('portfolio', { title: val })}
                label={isAr ? 'عنوان المعرض' : 'Portfolio Title'}
              />
            </h2>
          </div>
          <div className="text-xs sm:text-base text-[#a8a6a1] max-w-md">
            <EditableText
              value={sectionDesc}
              onSave={(val) => updateSectionHeader('portfolio', { description: val })}
              multiline
              label={isAr ? 'وصف المعرض' : 'Portfolio Description'}
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-4 mb-6 sm:mb-10 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-200 whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#941e33] text-white shadow-lg shadow-[#941e33]/25 border border-[#b8283f]/50'
                  : 'bg-[#1d1d1d] text-[#a8a6a1] hover:text-[#f1f2ed] hover:bg-[#232323] border border-[#2b2b2b]'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Projects Grid: TWO-COLUMN ON MOBILE, MULTI-COLUMN ON LARGER SCREENS */}
        {filteredProjects.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] text-[#a8a6a1]">
            <p className="text-xs sm:text-sm">{t('portfolio.empty', 'No projects found in this category.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                onClick={(e) => {
                  // In live edit mode, if clicking inside an editable or button, don't open modal
                  if ((e.target as HTMLElement).closest('.editable-action, button, input, textarea')) return;
                  setActiveProject(project);
                }}
                className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[#941e33]/60 transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:shadow-[#941e33]/15 flex flex-col justify-between"
              >
                {/* Delete button in Live Edit Mode */}
                {isLiveEditMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-[#941e33] text-[#aaa] hover:text-white transition-colors cursor-pointer z-30"
                    title={isAr ? 'حذف هذا العمل' : 'Delete Project'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Image Cover Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#171717]">
                  <EditableImage
                    src={project.coverImage}
                    onSave={(newUrl) => updateProject(project.id, { coverImage: newUrl })}
                    label={project.title}
                    aspectRatio="aspect-[16/10]"
                    className="w-full h-full"
                  >
                    <OptimizedImage
                      src={project.coverImage}
                      alt={project.title}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </EditableImage>

                  {/* Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1d] via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity pointer-events-none" />

                  {/* Category & Featured Badge */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1.5 z-10">
                    <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-[#f1f2ed] border border-[#2b2b2b]">
                      <EditableText
                        value={project.category}
                        onSave={(val) => updateProject(project.id, { category: val })}
                        label={isAr ? 'التصنيف' : 'Category'}
                      />
                    </span>
                    {project.featured && (
                      <span className="p-1 rounded-full bg-[#941e33] text-white" title="Featured Project">
                        <Sparkles className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Play Button Overlay on Hover (only when not in live edit mode) */}
                  {!isLiveEditMode && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#941e33] text-white flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current translate-x-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Client & Year Tag */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] sm:text-xs text-[#a8a6a1] z-10">
                    <span className="font-mono text-[#f1f2ed] font-medium drop-shadow-md truncate max-w-[65%]">
                      <EditableText
                        value={project.client}
                        onSave={(val) => updateProject(project.id, { client: val })}
                        label={isAr ? 'العميل' : 'Client'}
                      />
                    </span>
                    <span className="font-mono text-[10px] drop-shadow-md flex-shrink-0">
                      <EditableText
                        value={project.year}
                        onSave={(val) => updateProject(project.id, { year: val })}
                        label={isAr ? 'السنة' : 'Year'}
                      />
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="text-xs sm:text-base font-bold text-[#f1f2ed] group-hover:text-white transition-colors font-quicksand">
                      <EditableText
                        value={project.title}
                        onSave={(val) => updateProject(project.id, { title: val })}
                        label={isAr ? 'عنوان العمل' : 'Project Title'}
                      />
                    </h3>
                    <div className="text-[11px] sm:text-xs text-[#a8a6a1] mt-1 leading-relaxed">
                      <EditableText
                        value={project.description}
                        onSave={(val) => updateProject(project.id, { description: val })}
                        multiline
                        label={isAr ? 'وصف العمل' : 'Project Description'}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#232323] flex items-center justify-between text-[10px] sm:text-xs">
                    <span className="font-semibold text-[#b8283f] group-hover:text-white flex items-center gap-1 transition-colors">
                      <Play className="w-3 h-3 fill-current" />
                      <span>{t('portfolio.watchFilm', 'Watch Film')}</span>
                    </span>
                    {project.videos && project.videos.length > 0 && (
                      <span className="text-[9px] font-mono text-[#706e6a] uppercase">
                        4K DCI
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </section>
  );
}
