import { useState } from 'react';
import { Database, Plus, Trash2, UploadCloud } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { ImageUploadDropzone } from '../common/ImageUploadDropzone';
import { FooterLink, HeaderCta, SkillItem, TestimonialItem, TimelineItem } from '../../types/content';

const fieldClass = 'w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none';
const labelClass = 'block text-[11px] font-mono uppercase text-[#a8a6a1] mb-1.5';
const cardClass = 'p-5 sm:p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4';

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function SiteDataManager() {
  const { content, updateContent, serverSyncStatus } = useContent();
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const setBranding = (updates: Partial<typeof content.branding>) =>
    updateContent({ branding: { ...content.branding, ...updates } });
  const setSeo = (updates: Partial<typeof content.seo>) =>
    updateContent({ seo: { ...content.seo, ...updates } });
  const setHero = (updates: Partial<typeof content.hero>) =>
    updateContent({ hero: { ...content.hero, ...updates } });
  const setAbout = (updates: Partial<typeof content.about>) =>
    updateContent({ about: { ...content.about, ...updates } });
  const setContact = (updates: Partial<typeof content.contact>) =>
    updateContent({ contact: { ...content.contact, ...updates } });
  const setFooter = (updates: Partial<typeof content.footer>) =>
    updateContent({ footer: { ...content.footer, ...updates } });

  const updateHeaderCta = (id: string, updates: Partial<HeaderCta>) =>
    updateContent({ headerCtas: (content.headerCtas || []).map((item) => item.id === id ? { ...item, ...updates } : item) });

  const updateTimeline = (key: 'experience' | 'education', id: string, updates: Partial<TimelineItem>) =>
    updateContent({ [key]: (content[key] || []).map((item) => item.id === id ? { ...item, ...updates } : item) });

  const updateSkill = (id: string, updates: Partial<SkillItem>) =>
    updateContent({ skills: (content.skills || []).map((item) => item.id === id ? { ...item, ...updates } : item) });

  const updateTestimonial = (id: string, updates: Partial<TestimonialItem>) =>
    updateContent({ testimonials: (content.testimonials || []).map((item) => item.id === id ? { ...item, ...updates } : item) });

  const updateFooterLink = (id: string, updates: Partial<FooterLink>) =>
    updateContent({ footerLinks: (content.footerLinks || []).map((item) => item.id === id ? { ...item, ...updates } : item) });

  const uploadResume = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Resume file must be 15MB or smaller.');
      return;
    }
    setUploadingResume(true);
    setUploadError('');
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Unable to read file.'));
        reader.readAsDataURL(file);
      });
      const response = await fetch('/api/upload-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ dataUrl, fileName: file.name, folder: 'resume' })
      });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || 'Upload failed');
      setAbout({ resumeUrl: result.url });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#2b2b2b]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase font-quicksand text-[#f1f2ed]">Full Site Data Manager</h2>
          <p className="text-xs text-[#a8a6a1] mt-1">Manage advanced global data, profile, timeline, skills, testimonials, CTAs and legal links. Changes auto-save to Supabase.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#a8a6a1]">
          <Database className="w-4 h-4 text-[#38bdf8]" />
          <span>{serverSyncStatus}</span>
        </div>
      </div>

      <section className={cardClass}>
        <h3 className="font-bold text-[#f1f2ed]">Global Branding, Logos & Analytics</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Brand / Site Name</label>
            <input className={fieldClass} value={content.branding.siteName} onChange={(e) => setBranding({ siteName: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Accent Color</label>
            <input className={fieldClass} value={content.branding.accentColor} onChange={(e) => setBranding({ accentColor: e.target.value })} />
          </div>
          <ImageUploadDropzone label="Light Logo (for dark backgrounds)" value={content.branding.logoLight || content.branding.logoImage || ''} onChange={(url) => setBranding({ logoLight: url, logoImage: url })} previewFit="contain" compact />
          <ImageUploadDropzone label="Dark Logo (for light backgrounds)" value={content.branding.logoDark || ''} onChange={(url) => setBranding({ logoDark: url })} previewFit="contain" compact />
          <ImageUploadDropzone label="Favicon" value={content.branding.favicon || content.seo.favicon || ''} onChange={(url) => { setBranding({ favicon: url }); setSeo({ favicon: url }); }} previewFit="contain" compact aspectRatio="aspect-square" />
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Google Analytics ID</label>
              <input className={fieldClass} value={content.seo.googleAnalyticsId || ''} onChange={(e) => setSeo({ googleAnalyticsId: e.target.value })} placeholder="G-XXXXXXXXXX" />
            </div>
            <div>
              <label className={labelClass}>Google Tag Manager ID</label>
              <input className={fieldClass} value={content.seo.googleTagManagerId || ''} onChange={(e) => setSeo({ googleTagManagerId: e.target.value })} placeholder="GTM-XXXXXXX" />
            </div>
            <div>
              <label className={labelClass}>Meta Pixel ID</label>
              <input className={fieldClass} value={content.seo.metaPixelId || ''} onChange={(e) => setSeo({ metaPixelId: e.target.value })} />
            </div>
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#f1f2ed]">Header CTA Buttons</h3>
          <button
            type="button"
            onClick={() => updateContent({ headerCtas: [...(content.headerCtas || []), { id: uid('cta'), label: 'New CTA', url: '#contact', target: '_self', variant: 'primary', order: (content.headerCtas || []).length + 1, visible: true }] })}
            className="px-3 py-2 rounded-xl bg-[#2563eb] text-white text-xs flex items-center gap-1"
          ><Plus className="w-3.5 h-3.5" /> Add CTA</button>
        </div>
        <div className="space-y-3">
          {(content.headerCtas || []).map((cta) => (
            <div key={cta.id} className="grid md:grid-cols-12 gap-2 items-center p-3 rounded-xl bg-[#171717] border border-[#262626]">
              <input className={`${fieldClass} md:col-span-3`} value={cta.label} onChange={(e) => updateHeaderCta(cta.id, { label: e.target.value })} placeholder="Label" />
              <input className={`${fieldClass} md:col-span-3`} value={cta.url} onChange={(e) => updateHeaderCta(cta.id, { url: e.target.value })} placeholder="#contact or https://..." />
              <select className={`${fieldClass} md:col-span-2`} value={cta.target || '_self'} onChange={(e) => updateHeaderCta(cta.id, { target: e.target.value as '_self' | '_blank' })}>
                <option value="_self">Same tab</option><option value="_blank">New tab</option>
              </select>
              <select className={`${fieldClass} md:col-span-1`} value={cta.variant || 'primary'} onChange={(e) => updateHeaderCta(cta.id, { variant: e.target.value as 'primary' | 'secondary' })}>
                <option value="primary">Primary</option><option value="secondary">Secondary</option>
              </select>
              <input className={`${fieldClass} md:col-span-1`} type="number" min={1} value={cta.order || 1} onChange={(e) => updateHeaderCta(cta.id, { order: Number(e.target.value) })} title="Display order" />
              <label className="md:col-span-1 flex items-center justify-center gap-1 text-[10px] text-[#a8a6a1]"><input type="checkbox" checked={cta.visible !== false} onChange={(e) => updateHeaderCta(cta.id, { visible: e.target.checked })} /> Show</label>
              <button type="button" onClick={() => updateContent({ headerCtas: (content.headerCtas || []).filter((item) => item.id !== cta.id) })} className="md:col-span-1 p-2 text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="font-bold text-[#f1f2ed]">Hero / Introduction Advanced Media</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Background Type</label>
            <select className={fieldClass} value={content.hero.backgroundType || 'image'} onChange={(e) => setHero({ backgroundType: e.target.value as 'image' | 'video' })}>
              <option value="image">Image</option><option value="video">Video (MP4/WebM URL)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Background Video URL</label>
            <input className={fieldClass} value={content.hero.backgroundVideoUrl || ''} onChange={(e) => setHero({ backgroundVideoUrl: e.target.value })} placeholder="https://.../background.mp4" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Dynamic Typing Strings (one per line)</label>
            <textarea rows={4} className={fieldClass} value={(content.hero.typingStrings || []).join('\n')} onChange={(e) => setHero({ typingStrings: e.target.value.split('\n').map((v) => v.trim()).filter(Boolean) })} />
          </div>
          <div>
            <label className={labelClass}>Primary CTA Link</label>
            <input className={fieldClass} value={content.hero.primaryCtaLink} onChange={(e) => setHero({ primaryCtaLink: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Secondary CTA Link</label>
            <input className={fieldClass} value={content.hero.secondaryCtaLink} onChange={(e) => setHero({ secondaryCtaLink: e.target.value })} />
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="font-bold text-[#f1f2ed]">About / Profile Assets</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ImageUploadDropzone label="Profile Picture" value={content.about.profileImage} onChange={(url) => setAbout({ profileImage: url })} aspectRatio="aspect-square" />
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Profile Location</label>
              <input className={fieldClass} value={content.about.location || ''} onChange={(e) => setAbout({ location: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Specialties (comma separated)</label>
              <input className={fieldClass} value={(content.about.specialties || []).join(', ')} onChange={(e) => setAbout({ specialties: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} />
            </div>
            <div>
              <label className={labelClass}>Resume URL</label>
              <input className={fieldClass} value={content.about.resumeUrl || ''} onChange={(e) => setAbout({ resumeUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label className={labelClass}>Resume Button Label</label>
              <input className={fieldClass} value={content.about.resumeLabel || ''} onChange={(e) => setAbout({ resumeLabel: e.target.value })} />
            </div>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs cursor-pointer text-[#f1f2ed]">
              <UploadCloud className="w-4 h-4 text-[#38bdf8]" />
              <span>{uploadingResume ? 'Uploading resume...' : 'Upload PDF Resume'}</span>
              <input type="file" accept="application/pdf" className="hidden" disabled={uploadingResume} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadResume(file); }} />
            </label>
            {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
          </div>
        </div>
      </section>

      {(['experience', 'education'] as const).map((key) => (
        <section key={key} className={cardClass}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#f1f2ed] capitalize">{key} Timeline</h3>
            <button
              type="button"
              onClick={() => updateContent({ [key]: [...(content[key] || []), { id: uid(key), type: key, title: '', organization: '', startDate: '', endDate: '', isCurrent: false, description: '', location: '', order: (content[key] || []).length + 1, visible: true }] })}
              className="px-3 py-2 rounded-xl bg-[#2563eb] text-white text-xs flex items-center gap-1"
            ><Plus className="w-3.5 h-3.5" /> Add</button>
          </div>
          <div className="space-y-4">
            {(content[key] || []).map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-[#171717] border border-[#262626] grid md:grid-cols-2 gap-3">
                <input className={fieldClass} value={item.title} onChange={(e) => updateTimeline(key, item.id, { title: e.target.value })} placeholder={key === 'experience' ? 'Role' : 'Degree'} />
                <input className={fieldClass} value={item.organization} onChange={(e) => updateTimeline(key, item.id, { organization: e.target.value })} placeholder={key === 'experience' ? 'Company' : 'Institution'} />
                <input className={fieldClass} value={item.startDate} onChange={(e) => updateTimeline(key, item.id, { startDate: e.target.value })} placeholder="Start date" />
                <input className={fieldClass} value={item.endDate || ''} disabled={item.isCurrent} onChange={(e) => updateTimeline(key, item.id, { endDate: e.target.value })} placeholder="End date" />
                <input className={fieldClass} value={item.location || ''} onChange={(e) => updateTimeline(key, item.id, { location: e.target.value })} placeholder="Location" />
                <label className="flex items-center gap-2 text-xs text-[#a8a6a1]"><input type="checkbox" checked={Boolean(item.isCurrent)} onChange={(e) => updateTimeline(key, item.id, { isCurrent: e.target.checked, endDate: e.target.checked ? '' : item.endDate })} /> Current</label>
                <div><label className={labelClass}>Display Order</label><input className={fieldClass} type="number" min={1} value={item.order || 1} onChange={(e) => updateTimeline(key, item.id, { order: Number(e.target.value) })} /></div>
                <label className="flex items-center gap-2 text-xs text-[#a8a6a1]"><input type="checkbox" checked={item.visible !== false} onChange={(e) => updateTimeline(key, item.id, { visible: e.target.checked })} /> Visible on public site</label>
                <textarea className={`${fieldClass} md:col-span-2`} rows={3} value={item.description} onChange={(e) => updateTimeline(key, item.id, { description: e.target.value })} placeholder="Description" />
                <div className="md:col-span-2 flex justify-end">
                  <button type="button" onClick={() => updateContent({ [key]: (content[key] || []).filter((x) => x.id !== item.id) })} className="text-red-400 text-xs flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#f1f2ed]">Skills / Tech Stack</h3>
          <button type="button" onClick={() => updateContent({ skills: [...(content.skills || []), { id: uid('skill'), name: '', category: 'Tools', proficiency: 80, icon: '', order: (content.skills || []).length + 1, visible: true }] })} className="px-3 py-2 rounded-xl bg-[#2563eb] text-white text-xs flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Skill</button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {(content.skills || []).map((skill) => (
            <div key={skill.id} className="p-3 rounded-xl bg-[#171717] border border-[#262626] grid grid-cols-12 gap-2 items-center">
              <input className={`${fieldClass} col-span-3`} value={skill.name} onChange={(e) => updateSkill(skill.id, { name: e.target.value })} placeholder="Skill" />
              <input className={`${fieldClass} col-span-2`} value={skill.category} onChange={(e) => updateSkill(skill.id, { category: e.target.value })} placeholder="Category" />
              <input className={`${fieldClass} col-span-2`} type="number" min={0} max={100} value={skill.proficiency ?? 0} onChange={(e) => updateSkill(skill.id, { proficiency: Number(e.target.value) })} title="Proficiency %" />
              <input className={`${fieldClass} col-span-2`} value={skill.icon || ''} onChange={(e) => updateSkill(skill.id, { icon: e.target.value })} placeholder="Icon URL/name" />
              <input className={`${fieldClass} col-span-1`} type="number" min={1} value={skill.order || 1} onChange={(e) => updateSkill(skill.id, { order: Number(e.target.value) })} title="Order" />
              <label className="col-span-1 flex items-center justify-center text-[10px] text-[#a8a6a1]"><input type="checkbox" checked={skill.visible !== false} onChange={(e) => updateSkill(skill.id, { visible: e.target.checked })} /></label>
              <button type="button" className="col-span-1 text-red-400" onClick={() => updateContent({ skills: (content.skills || []).filter((x) => x.id !== skill.id) })}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#f1f2ed]">Testimonials / Social Proof</h3>
          <button type="button" onClick={() => updateContent({ testimonials: [...(content.testimonials || []), { id: uid('testimonial'), clientName: '', position: '', company: '', avatar: '', body: '', rating: 5, order: (content.testimonials || []).length + 1, visible: true }] })} className="px-3 py-2 rounded-xl bg-[#2563eb] text-white text-xs flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Testimonial</button>
        </div>
        <div className="space-y-4">
          {(content.testimonials || []).map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-[#171717] border border-[#262626] grid md:grid-cols-2 gap-3">
              <input className={fieldClass} value={item.clientName} onChange={(e) => updateTestimonial(item.id, { clientName: e.target.value })} placeholder="Client name" />
              <input className={fieldClass} value={item.position || ''} onChange={(e) => updateTestimonial(item.id, { position: e.target.value })} placeholder="Position" />
              <input className={fieldClass} value={item.company || ''} onChange={(e) => updateTestimonial(item.id, { company: e.target.value })} placeholder="Company" />
              <input className={fieldClass} type="number" min={1} max={5} value={item.rating || 5} onChange={(e) => updateTestimonial(item.id, { rating: Number(e.target.value) })} />
              <div><label className={labelClass}>Display Order</label><input className={fieldClass} type="number" min={1} value={item.order || 1} onChange={(e) => updateTestimonial(item.id, { order: Number(e.target.value) })} /></div>
              <label className="flex items-center gap-2 text-xs text-[#a8a6a1]"><input type="checkbox" checked={item.visible !== false} onChange={(e) => updateTestimonial(item.id, { visible: e.target.checked })} /> Visible</label>
              <div className="md:col-span-2"><ImageUploadDropzone label="Client Avatar" value={item.avatar || ''} onChange={(url) => updateTestimonial(item.id, { avatar: url })} aspectRatio="aspect-square" compact /></div>
              <textarea className={`${fieldClass} md:col-span-2`} rows={3} value={item.body} onChange={(e) => updateTestimonial(item.id, { body: e.target.value })} placeholder="Testimonial" />
              <div className="md:col-span-2 flex justify-end"><button type="button" onClick={() => updateContent({ testimonials: (content.testimonials || []).filter((x) => x.id !== item.id) })} className="text-red-400 text-xs flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button></div>
            </div>
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="font-bold text-[#f1f2ed]">Contact, Working Hours & Footer Legal</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div><label className={labelClass}>Email</label><input className={fieldClass} value={content.contact.email} onChange={(e) => setContact({ email: e.target.value })} /></div>
          <div><label className={labelClass}>Phone</label><input className={fieldClass} value={content.contact.phone} onChange={(e) => setContact({ phone: e.target.value })} /></div>
          <div><label className={labelClass}>Address</label><input className={fieldClass} value={content.contact.address || ''} onChange={(e) => setContact({ address: e.target.value })} /></div>
          <div><label className={labelClass}>Working Hours</label><input className={fieldClass} value={content.contact.workingHours || ''} onChange={(e) => setContact({ workingHours: e.target.value })} /></div>
          <div><label className={labelClass}>WhatsApp</label><input className={fieldClass} value={content.contact.whatsapp} onChange={(e) => setContact({ whatsapp: e.target.value })} /></div>
          <div><label className={labelClass}>Instagram</label><input className={fieldClass} value={content.contact.instagram} onChange={(e) => setContact({ instagram: e.target.value })} /></div>
          <div><label className={labelClass}>YouTube</label><input className={fieldClass} value={content.contact.youtube} onChange={(e) => setContact({ youtube: e.target.value })} /></div>
          <div><label className={labelClass}>LinkedIn</label><input className={fieldClass} value={content.contact.linkedin} onChange={(e) => setContact({ linkedin: e.target.value })} /></div>
          <div className="md:col-span-2"><label className={labelClass}>Legal Notice</label><textarea rows={3} className={fieldClass} value={content.footer.legalNotice || ''} onChange={(e) => setFooter({ legalNotice: e.target.value })} /></div>
        </div>

        <div className="pt-4 border-t border-[#2b2b2b] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#f1f2ed]">Footer / Legal Links</h4>
            <button type="button" onClick={() => updateContent({ footerLinks: [...(content.footerLinks || []), { id: uid('footer'), label: 'New Link', url: '#', target: '_self', order: (content.footerLinks || []).length + 1, visible: true }] })} className="px-3 py-2 rounded-xl bg-[#232323] text-xs text-[#f1f2ed] flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Link</button>
          </div>
          {(content.footerLinks || []).map((item) => (
            <div key={item.id} className="grid md:grid-cols-12 gap-2">
              <input className={`${fieldClass} md:col-span-3`} value={item.label} onChange={(e) => updateFooterLink(item.id, { label: e.target.value })} />
              <input className={`${fieldClass} md:col-span-4`} value={item.url} onChange={(e) => updateFooterLink(item.id, { url: e.target.value })} />
              <select className={`${fieldClass} md:col-span-2`} value={item.target || '_self'} onChange={(e) => updateFooterLink(item.id, { target: e.target.value as '_self' | '_blank' })}><option value="_self">Same tab</option><option value="_blank">New tab</option></select>
              <input className={`${fieldClass} md:col-span-1`} type="number" min={1} value={item.order || 1} onChange={(e) => updateFooterLink(item.id, { order: Number(e.target.value) })} title="Order" />
              <label className="md:col-span-1 flex items-center justify-center text-[10px] text-[#a8a6a1]"><input type="checkbox" checked={item.visible !== false} onChange={(e) => updateFooterLink(item.id, { visible: e.target.checked })} /></label>
              <button type="button" className="md:col-span-1 text-red-400" onClick={() => updateContent({ footerLinks: (content.footerLinks || []).filter((x) => x.id !== item.id) })}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
