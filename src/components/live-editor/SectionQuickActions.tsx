import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sliders, Plus, Check, X, Sparkles } from 'lucide-react';

interface SectionQuickActionsProps {
  sectionKey: string;
  title: string;
  titleAr?: string;
  onAddItem?: () => void;
  addItemLabel?: string;
  addItemLabelAr?: string;
  badge?: string;
  headerTitle?: string;
  headerDescription?: string;
  onUpdateHeader?: (badge: string, title: string, description: string) => void;
  children?: React.ReactNode;
}

export function SectionQuickActions({
  sectionKey,
  title,
  titleAr,
  onAddItem,
  addItemLabel = 'Add Item',
  addItemLabelAr = 'إضافة عنصر',
  badge = '',
  headerTitle = '',
  headerDescription = '',
  onUpdateHeader,
  children
}: SectionQuickActionsProps) {
  const { isLiveEditMode } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftBadge, setDraftBadge] = useState(badge);
  const [draftTitle, setDraftTitle] = useState(headerTitle);
  const [draftDesc, setDraftDesc] = useState(headerDescription);

  if (!isLiveEditMode) return null;

  const handleOpenModal = () => {
    setDraftBadge(badge);
    setDraftTitle(headerTitle);
    setDraftDesc(headerDescription);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (onUpdateHeader) {
      onUpdateHeader(draftBadge, draftTitle, draftDesc);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-30 flex items-center gap-2 bg-[#181818]/95 backdrop-blur-md border border-[#941e33]/50 rounded-full px-3 py-1.5 shadow-xl animate-in fade-in duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-white tracking-wide">
          <span className="w-2 h-2 rounded-full bg-[#941e33] animate-pulse" />
          {isAr ? (titleAr || title) : title}
        </span>

        {onAddItem && (
          <button
            type="button"
            onClick={onAddItem}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#941e33] hover:bg-[#b8283f] text-white text-[10px] font-medium transition-colors shadow-sm cursor-pointer"
            title={isAr ? addItemLabelAr : addItemLabel}
          >
            <Plus className="w-3 h-3" />
            <span>{isAr ? addItemLabelAr : addItemLabel}</span>
          </button>
        )}

        {onUpdateHeader && (
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#262626] hover:bg-[#333] text-[#f1f2ed] text-[10px] font-medium border border-[#3a3a3a] transition-colors cursor-pointer"
            title={isAr ? 'تعديل نصوص العنوان والوصف' : 'Edit Header & Description'}
          >
            <Sliders className="w-3 h-3 text-[#941e33]" />
            <span>{isAr ? 'تعديل الترويسة' : 'Edit Header'}</span>
          </button>
        )}

        {children}
      </div>

      {/* Header Quick Edit Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-[#181818] border border-[#2b2b2b] rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2b2b2b] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#941e33]" />
                <h3 className="text-sm font-semibold text-white">
                  {isAr ? `تعديل عنوان ورأس قسم: ${titleAr || title}` : `Edit Header: ${title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#706e6a] hover:text-white hover:bg-[#232323] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#a8a6a1] mb-1">
                  {isAr ? 'شارة القسم (Badge)' : 'Section Badge'}
                </label>
                <input
                  type="text"
                  value={draftBadge}
                  onChange={(e) => setDraftBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-white focus:border-[#941e33] focus:outline-none"
                  placeholder="e.g. WORKFLOW, CAPABILITIES..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#a8a6a1] mb-1">
                  {isAr ? 'العنوان الرئيسي للقسم' : 'Main Section Title'}
                </label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-white focus:border-[#941e33] focus:outline-none font-bold"
                  placeholder="e.g. CRAFTING VISUAL STORIES..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#a8a6a1] mb-1">
                  {isAr ? 'الوصف التوضيحي' : 'Description'}
                </label>
                <textarea
                  value={draftDesc}
                  onChange={(e) => setDraftDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-white focus:border-[#941e33] focus:outline-none resize-none"
                  placeholder="e.g. A clear description for this section..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2b2b2b]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#232323] hover:bg-[#2c2c2c] text-xs text-[#a8a6a1] hover:text-white transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#941e33] hover:bg-[#b8283f] text-xs font-semibold text-white transition-colors shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? 'حفظ التغييرات' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
