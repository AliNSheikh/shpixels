import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { ImageUploadDropzone } from '../common/ImageUploadDropzone';
import { Camera, Check, X, Image as ImageIcon } from 'lucide-react';

interface EditableImageProps {
  src?: string;
  alt?: string;
  onSave: (newUrl: string) => void;
  className?: string;
  imageClassName?: string;
  label?: string;
  placeholder?: string;
  aspectRatio?: string;
  children?: React.ReactNode;
}

export function EditableImage({
  src = '',
  alt = 'Image',
  onSave,
  className = '',
  imageClassName = 'w-full h-full object-cover',
  label = 'Image / Logo',
  placeholder = 'https://...',
  aspectRatio = 'aspect-video',
  children
}: EditableImageProps) {
  const { isLiveEditMode } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftUrl, setDraftUrl] = useState(src);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraftUrl(src || '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    onSave(draftUrl);
    setIsModalOpen(false);
  };

  if (!isLiveEditMode) {
    if (children) {
      return <>{children}</>;
    }
    return (
      <div className={className}>
        {src ? (
          <img src={src} alt={alt} className={imageClassName} />
        ) : (
          <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center text-[#555]">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        onClick={handleOpen}
        className={`${className} relative group/live-img cursor-pointer transition-all duration-200 outline outline-2 outline-dashed outline-[#941e33]/60 hover:outline-[#941e33] hover:shadow-lg rounded-xl overflow-hidden`}
        title={isAr ? `انقر لتغيير أو رفع: ${label}` : `Click to change or upload: ${label}`}
      >
        {children ? (
          children
        ) : src ? (
          <img src={src} alt={alt} className={imageClassName} />
        ) : (
          <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center text-[#555]">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}

        {/* Hover Overlay with Camera Icon */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/live-img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-3 text-white z-20">
          <div className="p-2 rounded-full bg-[#941e33] shadow-lg">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <span className="text-[11px] font-medium tracking-wide bg-black/80 px-2.5 py-0.5 rounded-full border border-white/10">
            {isAr ? `تغيير ${label}` : `Change ${label}`}
          </span>
        </div>
      </div>

      {/* Modal for Direct Image Upload / URL Change */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(false);
          }}
        >
          <div 
            className="w-full max-w-lg bg-[#181818] border border-[#2b2b2b] rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2b2b2b] pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#941e33]" />
                <h3 className="text-sm font-semibold text-white">
                  {isAr ? `تعديل ورفع: ${label}` : `Edit & Upload: ${label}`}
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

            {/* Dropzone & File Uploader */}
            <div className="space-y-3">
              <ImageUploadDropzone
                value={draftUrl}
                onChange={(url: string) => setDraftUrl(url)}
                label={isAr ? 'اسحب وأفلت صورة من جهازك، أو اختر ملف' : 'Drag & drop image from your computer or choose file'}
                placeholder={placeholder}
                aspectRatio={aspectRatio}
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2b2b2b]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#232323] hover:bg-[#2c2c2c] text-xs text-[#a8a6a1] hover:text-white transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#941e33] hover:bg-[#b8283f] text-xs font-semibold text-white transition-colors shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? 'تطبيق وحفظ' : 'Apply & Save'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
