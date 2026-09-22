import React, { useState, useRef, useEffect } from 'react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { Pencil, Check, X } from 'lucide-react';

interface EditableTextProps {
  value?: string;
  onSave: (newValue: string) => void;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div';
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  label?: string;
  children?: React.ReactNode;
}

export function EditableText({
  value = '',
  onSave,
  as: Component = 'span',
  className = '',
  multiline = false,
  placeholder = 'Click to edit text...',
  label,
  children
}: EditableTextProps) {
  const { isLiveEditMode } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync draft when value prop changes
  useEffect(() => {
    setDraft(value || '');
  }, [value]);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          if ('select' in inputRef.current) {
            inputRef.current.select();
          }
        }
      }, 50);
    }
  }, [isEditing]);

  // Click outside to commit
  useEffect(() => {
    if (!isEditing) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isEditing, draft]);

  const handleSave = () => {
    onSave(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(value || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      handleCancel();
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    } else if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    }
  };

  // If live edit mode is OFF, render pristine clean tag
  if (!isLiveEditMode) {
    return <Component className={className}>{value || children}</Component>;
  }

  // Active in-place editing state
  if (isEditing) {
    return (
      <div 
        ref={containerRef} 
        className="relative inline-block w-full max-w-full z-40 my-1 animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {label && (
          <span className="block text-[10px] font-mono text-[#941e33] uppercase font-bold tracking-wider mb-1">
            {label}
          </span>
        )}
        <div className="flex items-center gap-1.5 bg-[#171717] border-2 border-[#941e33] rounded-lg p-1.5 shadow-2xl">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder={placeholder}
              className="w-full bg-[#111111] text-[#f1f2ed] text-sm p-2 rounded border border-[#333] focus:outline-none resize-y min-h-[70px] font-inherit"
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-[#111111] text-[#f1f2ed] text-sm px-2.5 py-1.5 rounded border border-[#333] focus:outline-none font-inherit"
            />
          )}

          <div className="flex flex-col gap-1 shrink-0">
            <button
              type="button"
              onClick={handleSave}
              className="p-1.5 rounded bg-[#941e33] hover:bg-[#b8283f] text-white transition-colors cursor-pointer"
              title={isAr ? 'حفظ (Enter)' : 'Save (Enter)'}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1.5 rounded bg-[#262626] hover:bg-[#333] text-[#aaa] hover:text-white transition-colors cursor-pointer"
              title={isAr ? 'إلغاء (Esc)' : 'Cancel (Esc)'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Live edit mode is ON, but not currently clicked: show hover highlight & badge
  return (
    <Component
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`${className} relative group/live-text cursor-pointer transition-all duration-200 outline outline-1 outline-dashed outline-transparent hover:outline-[#941e33] hover:bg-[#941e33]/10 hover:shadow-sm rounded px-1 -mx-1`}
      title={isAr ? `انقر لتعديل: ${label || 'النص'}` : `Click to edit: ${label || 'Text'}`}
    >
      {value || children || <span className="italic text-[#706e6a]">({placeholder})</span>}

      {/* Floating Hover Indicator */}
      <span className={`opacity-0 group-hover/live-text:opacity-100 transition-opacity absolute -top-3.5 ${isAr ? '-left-2' : '-right-2'} inline-flex items-center gap-1 bg-[#941e33] text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow-lg pointer-events-none z-30`}>
        <Pencil className="w-2.5 h-2.5" />
        <span>{isAr ? 'تعديل' : 'Edit'}</span>
      </span>
    </Component>
  );
}
