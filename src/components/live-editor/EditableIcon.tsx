import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { AVAILABLE_ICONS } from '../common/IconPicker';
import { Film, Pencil, Search, X, Sparkles } from 'lucide-react';

interface EditableIconProps {
  iconName?: string;
  onSave: (newIconName: string) => void;
  className?: string;
  iconClassName?: string;
  label?: string;
}

export function EditableIcon({
  iconName = 'Film',
  onSave,
  className = '',
  iconClassName = 'w-6 h-6',
  label
}: EditableIconProps) {
  const { isLiveEditMode } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const CurrentIcon = AVAILABLE_ICONS[iconName] || Film;

  const filteredIcons = Object.keys(AVAILABLE_ICONS).filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (name: string) => {
    onSave(name);
    setIsModalOpen(false);
  };

  if (!isLiveEditMode) {
    return (
      <div className={className}>
        <CurrentIcon className={iconClassName} />
      </div>
    );
  }

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsModalOpen(true);
        }}
        className={`${className} relative group/live-icon cursor-pointer transition-all duration-200 outline outline-1 outline-dashed outline-[#941e33]/50 hover:outline-[#941e33] hover:ring-2 hover:ring-[#941e33]/20 rounded-lg p-0.5`}
        title={isAr ? `انقر لتغيير الأيقونة: ${label || iconName}` : `Click to change icon: ${label || iconName}`}
      >
        <CurrentIcon className={iconClassName} />

        {/* Small floating indicator */}
        <span className="opacity-0 group-hover/live-icon:opacity-100 transition-opacity absolute -top-2 -right-2 bg-[#941e33] text-white p-1 rounded-full text-[9px] shadow-lg pointer-events-none z-30">
          <Pencil className="w-2.5 h-2.5" />
        </span>
      </div>

      {/* Interactive Icon Picker Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(false);
          }}
        >
          <div 
            className="w-full max-w-md bg-[#181818] border border-[#2b2b2b] rounded-2xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2b2b2b] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#941e33]" />
                <h3 className="text-sm font-semibold text-white">
                  {isAr ? 'اختر أيقونة' : 'Select Icon'}
                  {label && <span className="text-xs text-[#a8a6a1] font-normal ml-1.5">({label})</span>}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#706e6a] hover:text-white hover:bg-[#232323] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className={`w-4 h-4 absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-[#706e6a]`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isAr ? 'ابحث عن أيقونة (film, video, camera, zap...)' : 'Search icon (film, video, camera, zap...)'}
                className={`w-full ${isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-white placeholder-[#706e6a] focus:border-[#941e33] focus:outline-none`}
                autoFocus
              />
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-1 custom-scrollbar">
              {filteredIcons.map((name) => {
                const IconComponent = AVAILABLE_ICONS[name];
                const isSelected = iconName === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSelect(name)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-[#941e33]/20 border-[#941e33] text-white shadow-md'
                        : 'bg-[#212121] border-[#2b2b2b] text-[#a8a6a1] hover:text-white hover:border-[#941e33]/50 hover:bg-[#282828]'
                    }`}
                    title={name}
                  >
                    <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-mono mt-1 truncate max-w-full text-center opacity-70 group-hover:opacity-100">
                      {name}
                    </span>
                  </button>
                );
              })}
              {filteredIcons.length === 0 && (
                <div className="col-span-6 py-8 text-center text-xs text-[#706e6a]">
                  {isAr ? 'لم يتم العثور على أيقونة مطابقة' : 'No matching icons found'}
                </div>
              )}
            </div>

            {/* Current Selection & Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#2b2b2b] text-xs text-[#a8a6a1]">
              <span className="font-mono">
                {isAr ? 'الحالية: ' : 'Current: '}
                <strong className="text-white">{iconName}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333] text-white text-xs transition-colors cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
