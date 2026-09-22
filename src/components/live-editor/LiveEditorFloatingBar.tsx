import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Sparkles, Sliders, ChevronDown, ChevronUp, LayoutDashboard, 
  CheckCircle2, RefreshCw, Eye, EyeOff, Globe, Plus, Layers
} from 'lucide-react';

export function LiveEditorFloatingBar() {
  const { 
    isLiveEditMode, 
    toggleLiveEditMode, 
    setIsAdminView, 
    lastSaved,
    addService,
    addWorkflowStep,
    addClientLogo,
    content
  } = useContent();
  const { language, toggleLanguage } = useLanguage();
  const isAr = language === 'ar';

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleQuickAddService = () => {
    addService({
      id: `svc-${Date.now()}`,
      title: isAr ? 'خدمة إبداعية جديدة' : 'New Creative Service',
      subtitle: isAr ? 'إنتاج متميز' : 'High-End Production',
      description: isAr ? 'وصف تفصيلي للخدمة الجديدة والمزايا التي تقدمها للعملاء.' : 'Detailed description of the new service and value provided to clients.',
      category: 'Commercial',
      icon: 'Film',
      features: isAr ? ['تصوير سينمائي 4K', 'مونتاج احترافي', 'مؤثرات بصرية'] : ['4K Cinema Capture', 'Master Color Grade', 'Full Audio Design']
    });
    // Smooth scroll to services
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    setShowQuickAdd(false);
  };

  const handleQuickAddStep = () => {
    const nextNum = String((content.workflow?.length || 0) + 1).padStart(2, '0');
    addWorkflowStep({
      number: nextNum,
      title: isAr ? 'مرحلة عمل جديدة' : 'New Pipeline Phase',
      description: isAr ? 'شرح لخطوات وتفاصيل هذه المرحلة في إنتاج العمل.' : 'Explanation of milestones and deliverables for this phase.',
      icon: 'Workflow'
    });
    document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' });
    setShowQuickAdd(false);
  };

  const handleQuickAddLogo = () => {
    addClientLogo({
      id: `client-${Date.now()}`,
      name: isAr ? 'شريك جديد' : 'New Brand Partner',
      logoUrl: '',
      websiteUrl: 'https://example.com'
    });
    setShowQuickAdd(false);
  };

  // If collapsed to floating pill
  if (isCollapsed) {
    return (
      <div className={`fixed bottom-4 ${isAr ? 'left-4' : 'right-4'} z-50 flex items-center gap-2`}>
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-mono text-xs font-bold shadow-2xl transition-all border ${
            isLiveEditMode
              ? 'bg-[#941e33] text-white border-[#b8283f] hover:bg-[#b8283f] ring-4 ring-[#941e33]/30'
              : 'bg-[#181818] text-[#a8a6a1] border-[#2b2b2b] hover:text-white hover:bg-[#222]'
          }`}
          title={isAr ? 'فتح شريط التحرير المباشر' : 'Expand Live Visual Editor'}
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>{isAr ? 'المحرر المباشر' : 'Live Editor'}</span>
          <span className={`w-2 h-2 rounded-full ${isLiveEditMode ? 'bg-green-400 animate-pulse' : 'bg-[#555]'}`} />
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-[#141414]/95 backdrop-blur-xl border-2 border-[#941e33]/60 rounded-2xl p-2.5 sm:px-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Mode Toggle & Status Indicator */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLiveEditMode}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md cursor-pointer ${
              isLiveEditMode
                ? 'bg-[#941e33] text-white hover:bg-[#b8283f] ring-2 ring-[#941e33]/40'
                : 'bg-[#222] text-[#a8a6a1] hover:text-white border border-[#333]'
            }`}
            title={isLiveEditMode ? (isAr ? 'إيقاف وضع التحرير' : 'Turn Off Edit Mode') : (isAr ? 'تفعيل التحرير المباشر' : 'Turn On Edit Mode')}
          >
            {isLiveEditMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>
              {isAr 
                ? (isLiveEditMode ? 'وضع التحرير المباشر: مُفعل' : 'التحرير المباشر: متوقف') 
                : (isLiveEditMode ? 'Live Edit: ACTIVE' : 'Live Edit: OFF')}
            </span>
            <span className={`w-2 h-2 rounded-full ${isLiveEditMode ? 'bg-green-400 animate-ping' : 'bg-[#555]'}`} />
          </button>

          {isLiveEditMode && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-green-400/90 bg-green-950/40 border border-green-800/40 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              <span>{isAr ? 'انقر على أي نص، أيقونة، أو شعار لتعديله مباشرة' : 'Click any text, icon, or logo to edit directly'}</span>
            </div>
          )}
        </div>

        {/* Center: Quick Add Actions when in edit mode */}
        {isLiveEditMode && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#222] hover:bg-[#2a2a2a] text-xs font-medium text-[#f1f2ed] border border-[#333] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#941e33]" />
              <span>{isAr ? 'إضافة عناصر' : 'Quick Add'}</span>
              <ChevronDown className="w-3 h-3 text-[#706e6a]" />
            </button>

            {showQuickAdd && (
              <div className={`absolute bottom-full mb-2 ${isAr ? 'right-0' : 'left-0'} w-48 bg-[#181818] border border-[#333] rounded-xl p-1.5 shadow-2xl space-y-1 z-50 text-xs`}>
                <button
                  type="button"
                  onClick={handleQuickAddService}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#252525] text-white flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#941e33]" />
                  <span>{isAr ? '+ خدمة جديدة' : '+ New Service'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleQuickAddStep}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#252525] text-white flex items-center gap-2 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#941e33]" />
                  <span>{isAr ? '+ مرحلة عمل (Workflow)' : '+ Pipeline Step'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleQuickAddLogo}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#252525] text-white flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#941e33]" />
                  <span>{isAr ? '+ شعار عميل / شريك' : '+ Client Logo'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right: Dashboard shortcut & Collapse */}
        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="p-1.5 px-2.5 rounded-xl bg-[#222] hover:bg-[#2c2c2c] text-xs font-mono text-[#a8a6a1] hover:text-white border border-[#333] transition-colors cursor-pointer"
            title={language === 'en' ? 'التبديل للعربية' : 'Switch to English'}
          >
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#941e33]" />
              {language === 'en' ? 'AR' : 'EN'}
            </span>
          </button>

          {/* Full Admin Dashboard Shortcut */}
          <button
            type="button"
            onClick={() => setIsAdminView(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#222] hover:bg-[#2c2c2c] text-xs font-medium text-[#f1f2ed] border border-[#333] transition-colors cursor-pointer"
            title={isAr ? 'لوحة التحكم الشاملة' : 'Full CMS Dashboard'}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#941e33]" />
            <span className="hidden sm:inline">{isAr ? 'لوحة التحكم' : 'CMS Panel'}</span>
          </button>

          {/* Minimize bar */}
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-[#706e6a] hover:text-white transition-colors cursor-pointer"
            title={isAr ? 'تصغير' : 'Minimize'}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
