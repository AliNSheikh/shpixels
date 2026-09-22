import { Workflow, Trash2 } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { AVAILABLE_ICONS } from '../common/IconPicker';
import { EditableText } from '../live-editor/EditableText';
import { EditableIcon } from '../live-editor/EditableIcon';
import { SectionQuickActions } from '../live-editor/SectionQuickActions';

export function Process() {
  const { 
    content, 
    updateWorkflowStep, 
    addWorkflowStep, 
    deleteWorkflowStep, 
    updateSectionHeader, 
    isLiveEditMode 
  } = useContent();
  const { language, t } = useLanguage();
  const isAr = language === 'ar';
  const workflow = content.workflow || [];

  const sectionBadge = content.sectionHeaders?.workflow?.badge || t('process.badge', 'THE PRODUCTION PIPELINE');
  const sectionTitle = content.sectionHeaders?.workflow?.title || t('process.title', 'HOW WE BRING IDEAS TO LIFE');
  const sectionDesc = content.sectionHeaders?.workflow?.description || t('process.desc', 'A battle-tested production methodology ensuring razor-sharp timelines, uncompromising visual fidelity, and frictionless client collaboration.');

  const handleAddStep = () => {
    const nextNum = String(workflow.length + 1).padStart(2, '0');
    addWorkflowStep({
      number: nextNum,
      title: isAr ? 'مرحلة عمل جديدة' : 'New Pipeline Phase',
      description: isAr ? 'شرح لخطوات وتفاصيل هذه المرحلة في إنتاج العمل.' : 'Explanation of milestones and deliverables for this phase.',
      icon: 'Workflow'
    });
  };

  return (
    <section id="process" className="relative py-16 sm:py-24 bg-[#171717] border-t border-[#2b2b2b]">
      <SectionQuickActions
        sectionKey="workflow"
        title="Production Pipeline"
        titleAr="مراحل العمل والإنتاج (Pipeline)"
        badge={sectionBadge}
        headerTitle={sectionTitle}
        headerDescription={sectionDesc}
        onAddItem={handleAddStep}
        addItemLabel="+ Add Step"
        addItemLabelAr="+ إضافة مرحلة"
        onUpdateHeader={(badge, title, description) => {
          updateSectionHeader('workflow', { badge, title, description });
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d1d1d] border border-[#2b2b2b] text-[10px] sm:text-[11px] font-mono tracking-widest text-[#a8a6a1] uppercase mb-3">
              <Workflow className="w-3.5 h-3.5 text-[#941e33]" />
              <span>
                <EditableText
                  value={sectionBadge}
                  onSave={(val) => updateSectionHeader('workflow', { badge: val })}
                  label={isAr ? 'شارة المراحل' : 'Pipeline Badge'}
                />
              </span>
            </div>
            <h2 className="text-2xl sm:text-5xl font-black text-[#f1f2ed] tracking-tight uppercase font-quicksand">
              <EditableText
                value={sectionTitle}
                onSave={(val) => updateSectionHeader('workflow', { title: val })}
                label={isAr ? 'عنوان المراحل' : 'Pipeline Title'}
              />
            </h2>
          </div>
          <div className="text-xs sm:text-base text-[#a8a6a1] max-w-md">
            <EditableText
              value={sectionDesc}
              onSave={(val) => updateSectionHeader('workflow', { description: val })}
              multiline
              label={isAr ? 'وصف المراحل' : 'Pipeline Description'}
            />
          </div>
        </div>

        {/* Workflow steps: 2 COLUMNS ON MOBILE, 4 COLUMNS ON DESKTOP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {workflow.map((step, idx) => {
            return (
              <div
                key={idx}
                className="relative p-3.5 sm:p-7 rounded-xl sm:rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[#941e33]/50 transition-colors flex flex-col justify-between group"
              >
                {/* Delete button in live edit mode */}
                {isLiveEditMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWorkflowStep(idx);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#252525] hover:bg-[#941e33] text-[#777] hover:text-white transition-colors cursor-pointer z-20"
                    title={isAr ? 'حذف هذه المرحلة' : 'Delete Step'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-6">
                    <span className="text-2xl sm:text-4xl font-black text-[#941e33] group-hover:text-[#b8283f] transition-colors font-quicksand">
                      <EditableText
                        value={step.number}
                        onSave={(val) => updateWorkflowStep(idx, { number: val })}
                        label={isAr ? 'رقم المرحلة' : 'Step Number'}
                      />
                    </span>

                    {/* Live Editable Step Icon */}
                    <EditableIcon
                      iconName={step.icon || 'Workflow'}
                      onSave={(newIcon) => updateWorkflowStep(idx, { icon: newIcon })}
                      label={step.title}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#232323] flex items-center justify-center text-[#a8a6a1] group-hover:text-[#f1f2ed] transition-colors"
                      iconClassName="w-3.5 h-3.5 text-[#941e33]"
                    />
                  </div>

                  <h3 className="text-xs sm:text-lg font-bold text-[#f1f2ed] mb-1.5 sm:mb-3 font-quicksand group-hover:text-white transition-colors">
                    <EditableText
                      value={step.title}
                      onSave={(val) => updateWorkflowStep(idx, { title: val })}
                      label={isAr ? 'عنوان المرحلة' : 'Step Title'}
                    />
                  </h3>

                  <div className="text-[11px] sm:text-sm text-[#a8a6a1] leading-relaxed">
                    <EditableText
                      value={step.description}
                      onSave={(val) => updateWorkflowStep(idx, { description: val })}
                      multiline
                      label={isAr ? 'شرح المرحلة' : 'Step Description'}
                    />
                  </div>
                </div>

                <div className="mt-3 sm:mt-6 pt-2 sm:pt-4 border-t border-[#232323]">
                  <div className="w-full bg-[#232323] h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-[#941e33] h-full transition-all duration-500"
                      style={{ width: `${((idx + 1) / Math.max(workflow.length, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
