import { useState } from 'react';
import { Settings, Save, Check, Key, Sliders, Sparkles } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export function SiteSettings() {
  const { content, updateContent, changeAdminPassword } = useContent();

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [branding, setBranding] = useState({ ...content.branding });
  const [hero, setHero] = useState({
    ...content.hero,
    marqueeText: content.hero.marqueeItems.join(' • ')
  });
  const [about, setAbout] = useState({
    ...content.about,
    bioText: content.about.bioParagraphs.join('\n\n'),
    skillsText: content.about.skills.join(', ')
  });
  const [footer, setFooter] = useState({ ...content.footer });

  // Security password change state
  const [newPass, setNewPass] = useState('');
  const [passUpdated, setPassUpdated] = useState(false);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedMarquee = hero.marqueeText
      .split('•')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedBios = about.bioText
      .split('\n\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedSkills = about.skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updateContent({
      branding,
      hero: {
        ...content.hero,
        title: hero.title,
        subtitle: hero.subtitle,
        badgeText: hero.badgeText,
        primaryCtaText: hero.primaryCtaText,
        primaryCtaLink: hero.primaryCtaLink,
        secondaryCtaText: hero.secondaryCtaText,
        secondaryCtaLink: hero.secondaryCtaLink,
        marqueeItems: updatedMarquee.length > 0 ? updatedMarquee : content.hero.marqueeItems
      },
      about: {
        ...content.about,
        heading: about.heading,
        highlightText: about.highlightText,
        experienceYears: about.experienceYears,
        bioParagraphs: updatedBios.length > 0 ? updatedBios : content.about.bioParagraphs,
        skills: updatedSkills.length > 0 ? updatedSkills : content.about.skills
      },
      footer
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass.trim()) return;
    changeAdminPassword(newPass.trim());
    setPassUpdated(true);
    setNewPass('');
    setTimeout(() => setPassUpdated(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2b2b2b]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#f1f2ed] font-quicksand uppercase">
            Website Content & Branding Settings
          </h2>
          <p className="text-xs text-[#a8a6a1]">
            Configure global brand identity, typography, copy text, marquee ticker, and security credentials.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-md self-start sm:self-auto"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Settings Saved!' : 'Save All Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        {/* Branding Section */}
        <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[#232323]">
            <Sparkles className="w-4 h-4 text-[#2563eb]" />
            <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
              Brand Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                Logo / Brand Name
              </label>
              <input
                type="text"
                value={branding.logoText}
                onChange={(e) => setBranding({ ...branding, logoText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                value={branding.logoSubtext}
                onChange={(e) => setBranding({ ...branding, logoSubtext: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Hero Section Copy */}
        <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[#232323]">
            <Sliders className="w-4 h-4 text-[#2563eb]" />
            <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
              Hero Section Copy
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                Hero Badge
              </label>
              <input
                type="text"
                value={hero.badgeText}
                onChange={(e) => setHero({ ...hero, badgeText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                Main Headline
              </label>
              <input
                type="text"
                value={hero.title}
                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
              Sub-Headline Description
            </label>
            <textarea
              rows={2}
              value={hero.subtitle}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                Primary Button Text
              </label>
              <input
                type="text"
                value={hero.primaryCtaText}
                onChange={(e) => setHero({ ...hero, primaryCtaText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                Secondary Button Text
              </label>
              <input
                type="text"
                value={hero.secondaryCtaText}
                onChange={(e) => setHero({ ...hero, secondaryCtaText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
              Marquee Ticker Items (Separate with • symbol)
            </label>
            <input
              type="text"
              value={hero.marqueeText}
              onChange={(e) => setHero({ ...hero, marqueeText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
            />
          </div>
        </div>

        {/* About Section Copy */}
        <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[#232323]">
            <Settings className="w-4 h-4 text-[#2563eb]" />
            <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
              About Director (Mo Abdallah) Copy
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                Heading
              </label>
              <input
                type="text"
                value={about.heading}
                onChange={(e) => setAbout({ ...about, heading: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                Subtitle / Role
              </label>
              <input
                type="text"
                value={about.highlightText}
                onChange={(e) => setAbout({ ...about, highlightText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
              Biography Paragraphs (Separate paragraphs with double newlines)
            </label>
            <textarea
              rows={4}
              value={about.bioText}
              onChange={(e) => setAbout({ ...about, bioText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
              Skills & Toolchain (Comma-separated)
            </label>
            <input
              type="text"
              value={about.skillsText}
              onChange={(e) => setAbout({ ...about, skillsText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
            />
          </div>
        </div>

        {/* Footer & Quote */}
        <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[#232323]">
            <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
              Footer & Legal Disclaimers
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                Copyright Text
              </label>
              <input
                type="text"
                value={footer.copyrightText}
                onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                Director Quotation
              </label>
              <input
                type="text"
                value={footer.quote || ''}
                onChange={(e) => setFooter({ ...footer, quote: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Security Credentials */}
      <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-[#232323]">
          <Key className="w-4 h-4 text-[#2563eb]" />
          <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
            Admin Passphrase Security
          </h3>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-3 max-w-md">
          <label className="block text-xs font-mono uppercase text-[#a8a6a1]">
            Set New Admin Passphrase
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Enter new secret passphrase..."
              className="flex-1 px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#232323] hover:bg-[#2b2b2b] text-xs font-semibold text-[#f1f2ed] border border-[#2b2b2b]"
            >
              Update
            </button>
          </div>
          {passUpdated && (
            <p className="text-xs text-emerald-400 font-mono">
              ✓ Admin passphrase updated and saved into local storage.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
