import { useMemo, useState } from 'react';
import {
  Check,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import type { ContactSocialLink, SocialPlatform } from '../../types/content';
import {
  getPlatformLabel,
  normalizePublicUrl,
  SOCIAL_PLATFORM_OPTIONS,
  SocialIcon
} from '../common/SocialIcon';

const fieldClass =
  'w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none';

const PRESET_FIELDS: Array<{
  key: 'website' | 'whatsapp' | 'facebook' | 'instagram' | 'tiktok' | 'snapchat' | 'youtube' | 'behance' | 'linkedin' | 'wego';
  platform: SocialPlatform;
  label: string;
  placeholder: string;
}> = [
  { key: 'website', platform: 'website', label: 'Website', placeholder: 'https://yourwebsite.com' },
  { key: 'whatsapp', platform: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/971... or +971...' },
  { key: 'facebook', platform: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'instagram', platform: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'tiktok', platform: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
  { key: 'snapchat', platform: 'snapchat', label: 'Snapchat', placeholder: 'https://snapchat.com/add/...' },
  { key: 'youtube', platform: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
  { key: 'behance', platform: 'behance', label: 'Behance', placeholder: 'https://behance.net/...' },
  { key: 'linkedin', platform: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
  { key: 'wego', platform: 'wego', label: 'WeGo', placeholder: 'https://...' }
];

function makeCustomLink(index: number): ContactSocialLink {
  return {
    id: `custom-social-${Date.now()}-${index}`,
    platform: 'custom',
    label: '',
    url: '',
    order: 100 + index,
    visible: true
  };
}

export function LinkManager() {
  const { content, updateContent } = useContent();
  const [contactLinks, setContactLinks] = useState({ ...content.contact });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const customLinks = useMemo(
    () => [...(contactLinks.socialLinks || [])].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [contactLinks.socialLinks]
  );

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();

    const cleanedCustomLinks = (contactLinks.socialLinks || [])
      .map((item, index) => ({
        ...item,
        label: item.label?.trim() || getPlatformLabel(item.platform),
        url: item.url.trim(),
        order: item.order ?? 100 + index
      }))
      .filter((item) => item.url);

    updateContent({
      contact: {
        ...contactLinks,
        socialLinks: cleanedCustomLinks
      }
    });

    setContactLinks((current) => ({ ...current, socialLinks: cleanedCustomLinks }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const setField = (key: string, value: string) => {
    setContactLinks((current) => ({ ...current, [key]: value }));
  };

  const updateCustomLink = (id: string, updates: Partial<ContactSocialLink>) => {
    setContactLinks((current) => ({
      ...current,
      socialLinks: (current.socialLinks || []).map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

  const removeCustomLink = (id: string) => {
    setContactLinks((current) => ({
      ...current,
      socialLinks: (current.socialLinks || []).filter((item) => item.id !== id)
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2b2b2b]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#f1f2ed] font-quicksand uppercase">
            Contact & Social Links
          </h2>
          <p className="text-xs text-[#a8a6a1]">
            Only fields with data are displayed publicly. Empty contact fields and social channels remain hidden.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-md self-start sm:self-auto"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Links Saved!' : 'Save Contact Links'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="p-5 sm:p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">Direct Contact Information</h3>
            <p className="mt-1 text-[11px] text-[#706e6a]">
              Email, phone, location, website and availability are shown only when the corresponding field is filled.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                <Mail className="w-3.5 h-3.5 text-[#2563eb]" /> Email
              </label>
              <input
                type="email"
                value={contactLinks.email || ''}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="contact@example.com"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                <Phone className="w-3.5 h-3.5 text-[#2563eb]" /> Phone
              </label>
              <input
                type="text"
                value={contactLinks.phone || ''}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="+971..."
                className={fieldClass}
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2563eb]" /> Location
              </label>
              <input
                type="text"
                value={contactLinks.location || ''}
                onChange={(e) => setField('location', e.target.value)}
                placeholder="Dubai, UAE"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">Address</label>
              <input
                type="text"
                value={contactLinks.address || ''}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Full address (optional)"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">Working Hours</label>
              <input
                type="text"
                value={contactLinks.workingHours || ''}
                onChange={(e) => setField('workingHours', e.target.value)}
                placeholder="Sunday–Thursday • 09:00–18:00"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">Response Note</label>
              <input
                type="text"
                value={contactLinks.responseTimeNote || ''}
                onChange={(e) => setField('responseTimeNote', e.target.value)}
                placeholder="Typically responds within 24 hours"
                className={fieldClass}
              />
            </div>
          </div>
        </section>

        <section className="p-5 sm:p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-5 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">Social Media & Website Icons</h3>
            <p className="mt-1 text-[11px] text-[#706e6a]">
              Add a URL to make its icon appear on the website. Clear the URL to hide it. WhatsApp also creates the floating website button.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-3">
            {PRESET_FIELDS.map((field) => {
              const value = String(contactLinks[field.key] || '');
              return (
                <div key={field.key} className="p-3 rounded-xl bg-[#171717] border border-[#262626]">
                  <label className="flex items-center gap-2 text-xs font-mono uppercase text-[#a8a6a1] mb-2">
                    <span className={value.trim() ? 'text-[#38bdf8]' : 'text-[#555]'}>
                      <SocialIcon platform={field.platform} className="w-4 h-4" />
                    </span>
                    <span>{field.label}</span>
                    {value.trim() && <span className="ml-auto text-[9px] text-emerald-400">VISIBLE</span>}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={fieldClass}
                    />
                    {value.trim() && (
                      <a
                        href={normalizePublicUrl(value, field.platform)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-2.5 rounded-xl bg-[#232323] text-[#a8a6a1] hover:text-white"
                        title="Open link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="p-5 sm:p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">Additional Social / Custom Links</h3>
              <p className="mt-1 text-[11px] text-[#706e6a]">
                Add any extra network or website. Choose the closest icon, or use Custom for a generic web icon.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setContactLinks((current) => ({
                  ...current,
                  socialLinks: [...(current.socialLinks || []), makeCustomLink((current.socialLinks || []).length)]
                }))
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] hover:border-[#2563eb]"
            >
              <Plus className="w-4 h-4" /> Add Social Link
            </button>
          </div>

          {customLinks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#2b2b2b] p-6 text-center text-xs text-[#706e6a]">
              No additional links configured.
            </div>
          ) : (
            <div className="space-y-3">
              {customLinks.map((item) => (
                <div key={item.id} className="grid md:grid-cols-12 gap-2 p-3 rounded-xl bg-[#171717] border border-[#262626] items-center">
                  <div className="md:col-span-1 flex justify-center text-[#38bdf8]">
                    <SocialIcon platform={item.platform} className="w-5 h-5" />
                  </div>
                  <select
                    value={item.platform}
                    onChange={(e) => updateCustomLink(item.id, { platform: e.target.value as SocialPlatform })}
                    className={`${fieldClass} md:col-span-2`}
                  >
                    {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <input
                    value={item.label || ''}
                    onChange={(e) => updateCustomLink(item.id, { label: e.target.value })}
                    placeholder="Display label"
                    className={`${fieldClass} md:col-span-2`}
                  />
                  <input
                    value={item.url}
                    onChange={(e) => updateCustomLink(item.id, { url: e.target.value })}
                    placeholder="https://..."
                    className={`${fieldClass} md:col-span-5`}
                  />
                  <label className="md:col-span-1 flex items-center justify-center gap-1 text-[10px] text-[#a8a6a1]">
                    <input
                      type="checkbox"
                      checked={item.visible !== false}
                      onChange={(e) => updateCustomLink(item.id, { visible: e.target.checked })}
                    />
                    Show
                  </label>
                  <button
                    type="button"
                    onClick={() => removeCustomLink(item.id)}
                    className="md:col-span-1 p-2 text-red-400 hover:text-red-300"
                    title="Delete link"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="p-5 sm:p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">Contact Section Text</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">Heading</label>
              <input
                value={contactLinks.ctaHeading || ''}
                onChange={(e) => setField('ctaHeading', e.target.value)}
                placeholder="LET'S CREATE SOMETHING UNFORGETTABLE"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1.5">Subtitle</label>
              <textarea
                rows={3}
                value={contactLinks.ctaSubtitle || ''}
                onChange={(e) => setField('ctaSubtitle', e.target.value)}
                placeholder="Optional contact section introduction"
                className={fieldClass}
              />
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
