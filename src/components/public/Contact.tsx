import {
  Clock,
  Globe2,
  Mail,
  MapPin,
  MessageSquare,
  Phone
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getConfiguredSocialLinks,
  getPlatformLabel,
  normalizePublicUrl,
  SocialIcon
} from '../common/SocialIcon';

export function Contact() {
  const { content } = useContent();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const contact = content.contact;
  const socialLinks = getConfiguredSocialLinks(contact);

  const contactCards = [
    contact.email?.trim()
      ? {
          id: 'email',
          label: isAr ? 'البريد الإلكتروني' : 'Email',
          value: contact.email.trim(),
          href: `mailto:${contact.email.trim()}`,
          icon: Mail
        }
      : null,
    contact.phone?.trim()
      ? {
          id: 'phone',
          label: isAr ? 'رقم الهاتف' : 'Phone',
          value: contact.phone.trim(),
          href: `tel:${contact.phone.replace(/\s+/g, '')}`,
          icon: Phone
        }
      : null,
    contact.website?.trim()
      ? {
          id: 'website',
          label: isAr ? 'الموقع الإلكتروني' : 'Website',
          value: contact.website.trim(),
          href: normalizePublicUrl(contact.website, 'website'),
          icon: Globe2
        }
      : null
  ].filter(Boolean) as Array<{
    id: string;
    label: string;
    value: string;
    href: string;
    icon: typeof Mail;
  }>;

  const hasLocation = Boolean(contact.location?.trim() || contact.address?.trim());
  const hasMeta = Boolean(contact.workingHours?.trim() || contact.responseTimeNote?.trim());
  const hasAnyContact = contactCards.length > 0 || hasLocation || hasMeta || socialLinks.length > 0;

  if (!hasAnyContact && !contact.ctaHeading?.trim() && !contact.ctaSubtitle?.trim()) {
    return null;
  }

  return (
    <section id="contact" className="relative py-16 sm:py-24 bg-[#171717] border-t border-[#2b2b2b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d1d1d] border border-[#2b2b2b] text-[10px] sm:text-[11px] font-mono tracking-widest text-[#a8a6a1] uppercase">
            <MessageSquare className="w-3.5 h-3.5 text-[var(--site-accent)]" />
            <span>{isAr ? 'تواصل معي' : 'CONTACT ME'}</span>
          </div>

          {contact.ctaHeading?.trim() && (
            <h2 className="mt-4 text-2xl sm:text-5xl font-black text-[#f1f2ed] tracking-tight uppercase font-quicksand leading-tight">
              {contact.ctaHeading}
            </h2>
          )}

          {contact.ctaSubtitle?.trim() && (
            <p className="mt-4 max-w-3xl text-xs sm:text-base text-[#a8a6a1] leading-relaxed">
              {contact.ctaSubtitle}
            </p>
          )}
        </div>

        {contactCards.length > 0 && (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {contactCards.map(({ id, label, value, href, icon: Icon }) => (
              <a
                key={id}
                href={href}
                target={id === 'website' ? '_blank' : undefined}
                rel={id === 'website' ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] hover:border-[var(--site-accent)]/60 hover:bg-[#202020] transition-all group min-w-0"
              >
                <div className="w-11 h-11 rounded-xl bg-[#232323] text-[#38bdf8] group-hover:bg-[var(--site-accent)] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#706e6a]">{label}</div>
                  <div className="mt-1 text-xs sm:text-sm font-semibold text-[#f1f2ed] truncate" dir={id === 'phone' ? 'ltr' : undefined}>
                    {value}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {(hasLocation || hasMeta) && (
          <div className="mt-4 grid sm:grid-cols-2 gap-3 sm:gap-4">
            {hasLocation && (
              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b]">
                <div className="w-11 h-11 rounded-xl bg-[#232323] text-[#38bdf8] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#706e6a]">
                    {isAr ? 'الموقع' : 'Location'}
                  </div>
                  {contact.location?.trim() && <div className="mt-1 text-sm font-semibold text-[#f1f2ed]">{contact.location}</div>}
                  {contact.address?.trim() && <div className="mt-1 text-xs text-[#a8a6a1]">{contact.address}</div>}
                </div>
              </div>
            )}

            {hasMeta && (
              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b]">
                <div className="w-11 h-11 rounded-xl bg-[#232323] text-[#38bdf8] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#706e6a]">
                    {isAr ? 'معلومات التواصل' : 'Availability'}
                  </div>
                  {contact.workingHours?.trim() && <div className="mt-1 text-sm font-semibold text-[#f1f2ed]">{contact.workingHours}</div>}
                  {contact.responseTimeNote?.trim() && <div className="mt-1 text-xs text-[#a8a6a1]">{contact.responseTimeNote}</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="mt-8 pt-7 border-t border-[#2b2b2b]">
            <p className="text-xs font-mono uppercase tracking-wider text-[#706e6a] mb-4">
              {isAr ? 'روابط التواصل والمنصات' : 'Social & Online Channels'}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {socialLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={getPlatformLabel(item.platform, item.label)}
                  aria-label={getPlatformLabel(item.platform, item.label)}
                  className="group inline-flex items-center gap-2 px-3.5 py-3 rounded-xl bg-[#1d1d1d] border border-[#2b2b2b] text-[#a8a6a1] hover:text-white hover:border-[var(--site-accent)] hover:bg-[var(--site-accent)] transition-all"
                >
                  <SocialIcon platform={item.platform} className="w-5 h-5" />
                  <span className="text-[11px] font-semibold">
                    {getPlatformLabel(item.platform, item.label)}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
