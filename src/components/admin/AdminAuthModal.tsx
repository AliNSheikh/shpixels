import React from 'react';
import { Film, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';

export function AdminAuthModal() {
  const { loginAdmin, setIsAdminView } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const handleDirectAccess = () => {
    loginAdmin();
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl bg-[#171717] border border-[#2b2b2b] p-8 shadow-2xl space-y-6 text-center">
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#941e33] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#941e33]/25 border border-[#b8283f]/40">
            <Film className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#f1f2ed] tracking-wider uppercase font-quicksand">
            {isAr ? 'لوحة تحكم MOGRAFIX' : 'MOGRAFIX CMS'}
          </h2>
          <p className="text-xs text-[#a8a6a1] font-mono">
            {isAr ? 'بوابة إدارة المحتوى والأعمال' : 'Administrator Content Management Portal'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#1d1d1d] border border-[#2b2b2b] text-left space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isAr ? 'الدخول المباشر مفعل (تمت إزالة حقل كلمة المرور)' : 'Direct Access Mode Active'}</span>
          </div>
          <p className="text-xs text-[#a8a6a1] leading-relaxed">
            {isAr 
              ? 'تمت إزالة متطلب كلمة المرور. يمكنك الدخول فوراً لإدارة المشاريع، رفع الصور، وتحديث روابط يوتيوب.' 
              : 'Password requirement has been removed. Click below to directly access the dashboard to manage projects, upload images, and update content.'}
          </p>
        </div>

        <button
          id="admin-login-submit-btn"
          type="button"
          onClick={handleDirectAccess}
          className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider text-white bg-[#941e33] hover:bg-[#b8283f] transition-all shadow-xl flex items-center justify-center gap-2 border border-[#b8283f]/40 cursor-pointer"
        >
          <span>{isAr ? 'الدخول إلى لوحة التحكم' : 'Enter Admin Dashboard'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-4 border-t border-[#232323] flex items-center justify-between text-xs text-[#706e6a]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#941e33]" />
            <span>{isAr ? 'مزامنة مباشرة للكود' : 'Direct Codebase Sync'}</span>
          </div>
          <button
            onClick={() => setIsAdminView(false)}
            className="hover:text-[#f1f2ed] underline transition-colors cursor-pointer"
          >
            {isAr ? 'العودة للموقع الرئيسي' : 'Back to Public Website'}
          </button>
        </div>
      </div>
    </div>
  );
}
