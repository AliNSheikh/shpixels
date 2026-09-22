import React, { useState } from 'react';
import { 
  Tag, Plus, Edit2, Trash2, Check, X, ArrowUp, ArrowDown, 
  FolderCheck, Sparkles, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';

interface CategoryManagerProps {
  onClose?: () => void;
  onSelectCategory?: (category: string) => void;
}

export function CategoryManager({ onClose, onSelectCategory }: CategoryManagerProps) {
  const { content, categories, addCategory, renameCategory, deleteCategory, reorderCategories } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [newCatName, setNewCatName] = useState('');
  const [editingOldName, setEditingOldName] = useState<string | null>(null);
  const [editingNewName, setEditingNewName] = useState('');
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Quick stats per category
  const getCategoryUsage = (catName: string) => {
    const projCount = (content.projects || []).filter((p) => p.category === catName).length;
    const servCount = (content.services || []).filter((s) => s.category === catName).length;
    const galCount = (content.gallery || []).filter((g) => g.category === catName).length;
    return { projCount, servCount, galCount, total: projCount + servCount + galCount };
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setStatusMessage(isAr ? 'هذا التصنيف موجود بالفعل!' : 'Category already exists!');
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    addCategory(trimmed);
    setNewCatName('');
    setStatusMessage(isAr ? `✓ تم إضافة التصنيف: "${trimmed}"` : `✓ Added category: "${trimmed}"`);
    setTimeout(() => setStatusMessage(null), 3000);
    if (onSelectCategory) {
      onSelectCategory(trimmed);
    }
  };

  const handleStartRename = (name: string) => {
    setEditingOldName(name);
    setEditingNewName(name);
  };

  const handleSaveRename = (oldName: string) => {
    const trimmed = editingNewName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingOldName(null);
      return;
    }
    renameCategory(oldName, trimmed);
    setEditingOldName(null);
    setStatusMessage(
      isAr 
        ? `✓ تم تحديث اسم التصنيف "${oldName}" إلى "${trimmed}" وتحديث كافة المشاريع المرتبطة به.`
        : `✓ Renamed "${oldName}" to "${trimmed}" and updated all linked projects and services.`
    );
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleConfirmDelete = (name: string) => {
    deleteCategory(name);
    setDeletingName(null);
    setStatusMessage(
      isAr 
        ? `✓ تم حذف التصنيف "${name}"`
        : `✓ Category "${name}" deleted.`
    );
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newCats = [...categories];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newCats.length) return;
    const temp = newCats[index];
    newCats[index] = newCats[targetIdx];
    newCats[targetIdx] = temp;
    reorderCategories(newCats);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2b2b2b]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#941e33]/20 border border-[#941e33]/40 flex items-center justify-center text-[#b8283f]">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#f1f2ed] uppercase tracking-wide font-quicksand">
              {isAr ? 'إدارة التصنيفات والفئات' : 'Category & Filter Manager'}
            </h2>
            <p className="text-xs text-[#a8a6a1]">
              {isAr
                ? 'إضافة تصنيفات جديدة، وتعديل المسميات مع تحديث كافة المشاريع والخدمات المرتبطة تلقائياً.'
                : 'Create, rename, or reorder categories. Renaming automatically syncs all linked projects & services.'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#a8a6a1] hover:text-white hover:bg-[#232323] transition-colors self-end sm:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Add New Category Form */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] shadow-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#a8a6a1] mb-3 flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-[#941e33]" />
          <span>{isAr ? 'إضافة تصنيف جديد' : 'Add New Category'}</span>
        </h3>

        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder={isAr ? 'اسم التصنيف (مثال: أزياء وموضة، وثائقي، إعلانات سيارات)' : 'e.g. Automotive Cinema, Fashion Films, Documentary'}
              className="w-full px-4 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] focus:border-[#941e33] focus:outline-none text-xs sm:text-sm text-[#f1f2ed]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#941e33] hover:bg-[#b8283f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#941e33]/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة التصنيف' : 'Add Category'}</span>
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#a8a6a1] px-1 font-mono uppercase">
          <span>{isAr ? `التصنيفات الحالية (${categories.length})` : `Existing Categories (${categories.length})`}</span>
          <span className="hidden sm:inline">{isAr ? 'الترتيب والاستخدام' : 'Order & Usage'}</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {categories.map((cat, idx) => {
            const usage = getCategoryUsage(cat);
            const isEditing = editingOldName === cat;
            const isDeleting = deletingName === cat;

            return (
              <div
                key={cat}
                className="p-3.5 sm:p-4 rounded-xl bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[#383838] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left: Name / Edit field */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#232323] border border-[#2b2b2b] text-[#706e6a] text-xs font-mono flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <input
                        type="text"
                        autoFocus
                        value={editingNewName}
                        onChange={(e) => setEditingNewName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(cat);
                          if (e.key === 'Escape') setEditingOldName(null);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#232323] border border-[#941e33] text-xs sm:text-sm text-[#f1f2ed] focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveRename(cat)}
                        className="p-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white"
                        title={isAr ? 'حفظ التغيير' : 'Save'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingOldName(null)}
                        className="p-2 rounded-lg bg-[#232323] hover:bg-[#2b2b2b] text-[#a8a6a1]"
                        title={isAr ? 'إلغاء' : 'Cancel'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-sm sm:text-base font-bold text-[#f1f2ed] font-quicksand truncate">
                        {cat}
                      </span>
                      {onSelectCategory && (
                        <button
                          onClick={() => onSelectCategory(cat)}
                          className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#232323] hover:bg-[#941e33] text-[#a8a6a1] hover:text-white transition-colors"
                        >
                          {isAr ? 'اختيار' : 'Select'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Usage badge + Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#232323]">
                  {/* Usage count */}
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#a8a6a1]">
                    <FolderCheck className="w-3.5 h-3.5 text-[#941e33]" />
                    <span>
                      {usage.projCount} {isAr ? 'مشروع' : 'projects'}
                    </span>
                    {usage.servCount > 0 && (
                      <span className="text-[#706e6a]">
                        • {usage.servCount} {isAr ? 'خدمة' : 'services'}
                      </span>
                    )}
                  </div>

                  {/* Move Up / Down */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-[#232323] hover:bg-[#2b2b2b] disabled:opacity-30 disabled:hover:bg-[#232323] text-[#a8a6a1] transition-colors"
                      title={isAr ? 'تحريك للأعلى' : 'Move Up'}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === categories.length - 1}
                      className="p-1.5 rounded-lg bg-[#232323] hover:bg-[#2b2b2b] disabled:opacity-30 disabled:hover:bg-[#232323] text-[#a8a6a1] transition-colors"
                      title={isAr ? 'تحريك للأسفل' : 'Move Down'}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Edit / Delete actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartRename(cat)}
                        className="p-2 rounded-lg bg-[#232323] hover:bg-[#2b2b2b] text-[#f1f2ed] transition-colors"
                        title={isAr ? 'تعديل اسم التصنيف' : 'Edit Category Name'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {isDeleting ? (
                        <div className="flex items-center gap-1 bg-red-950/60 border border-red-800/60 rounded-lg p-1 animate-fadeIn">
                          <button
                            onClick={() => handleConfirmDelete(cat)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold"
                          >
                            {isAr ? 'تأكيد الحذف' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setDeletingName(null)}
                            className="p-1 text-[#a8a6a1] hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingName(cat)}
                          className="p-2 rounded-lg bg-[#232323] hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-transparent hover:border-red-900/30 transition-colors"
                          title={isAr ? 'حذف التصنيف' : 'Delete Category'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
