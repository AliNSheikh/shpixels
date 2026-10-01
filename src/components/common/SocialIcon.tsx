import {
  Ghost,
  Globe2,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Youtube
} from 'lucide-react';
import type { ContactData, ContactSocialLink, SocialPlatform } from '../../types/content';

export const SOCIAL_PLATFORM_OPTIONS: Array<{ value: SocialPlatform; label: string }> = [
  { value: 'website', label: 'Website' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'snapchat', label: 'Snapchat' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'behance', label: 'Behance' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'wego', label: 'WeGo' },
  { value: 'custom', label: 'Custom Link' }
];

export function getPlatformLabel(platform: SocialPlatform, customLabel?: string): string {
  const label = String(customLabel || '').trim();
  if (label) return label;
  return SOCIAL_PLATFORM_OPTIONS.find((item) => item.value === platform)?.label || 'Link';
}

export function normalizeWhatsAppUrl(value: unknown): string {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const digits = raw.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : raw;
}

export function normalizePublicUrl(value: unknown, platform?: SocialPlatform): string {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (platform === 'whatsapp') return normalizeWhatsAppUrl(raw);
  if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) return raw;
  return `https://${raw}`;
}

export function getConfiguredSocialLinks(contact: ContactData): ContactSocialLink[] {
  const safeContact = contact && typeof contact === 'object' ? contact : ({} as ContactData);
  const preset: ContactSocialLink[] = [
    { id: 'social-website', platform: 'website', label: 'Website', url: String(safeContact.website || ''), order: 1, visible: true },
    { id: 'social-whatsapp', platform: 'whatsapp', label: 'WhatsApp', url: String(safeContact.whatsapp || ''), order: 2, visible: true },
    { id: 'social-facebook', platform: 'facebook', label: 'Facebook', url: String(safeContact.facebook || ''), order: 3, visible: true },
    { id: 'social-instagram', platform: 'instagram', label: 'Instagram', url: String(safeContact.instagram || ''), order: 4, visible: true },
    { id: 'social-tiktok', platform: 'tiktok', label: 'TikTok', url: String(safeContact.tiktok || ''), order: 5, visible: true },
    { id: 'social-snapchat', platform: 'snapchat', label: 'Snapchat', url: String(safeContact.snapchat || ''), order: 6, visible: true },
    { id: 'social-youtube', platform: 'youtube', label: 'YouTube', url: String(safeContact.youtube || ''), order: 7, visible: true },
    { id: 'social-behance', platform: 'behance', label: 'Behance', url: String(safeContact.behance || ''), order: 8, visible: true },
    { id: 'social-linkedin', platform: 'linkedin', label: 'LinkedIn', url: String(safeContact.linkedin || ''), order: 9, visible: true },
    { id: 'social-wego', platform: 'wego', label: 'WeGo', url: String(safeContact.wego || ''), order: 10, visible: true }
  ];

  const custom: ContactSocialLink[] = (Array.isArray(safeContact.socialLinks) ? safeContact.socialLinks : [])
    .filter((item): item is ContactSocialLink => Boolean(item && typeof item === 'object'))
    .map((item, index) => ({
      id: String(item.id || `custom-social-${index + 1}`),
      platform: SOCIAL_PLATFORM_OPTIONS.some((option) => option.value === item.platform) ? item.platform : 'custom',
      label: String(item.label || ''),
      url: String(item.url || ''),
      order: typeof item.order === 'number' && Number.isFinite(item.order) ? item.order : 100 + index,
      visible: item.visible !== false
    }));

  return [...preset, ...custom]
    .filter((item) => item.visible !== false && Boolean(String(item.url || '').trim()))
    .map((item) => ({ ...item, url: normalizePublicUrl(item.url, item.platform) }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

function LetterIcon({ letter, className = '' }: { letter: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <text x="12" y="15.6" textAnchor="middle" fontSize="10" fontWeight="800" fontFamily="Arial, sans-serif" fill="currentColor">
        {letter}
      </text>
    </svg>
  );
}

export function SocialIcon({ platform, className = 'w-5 h-5' }: { platform: SocialPlatform; className?: string }) {
  switch (platform) {
    case 'website': return <Globe2 className={className} />;
    case 'whatsapp': return <MessageCircle className={className} />;
    case 'instagram': return <Instagram className={className} />;
    case 'youtube': return <Youtube className={className} />;
    case 'linkedin': return <Linkedin className={className} />;
    case 'tiktok': return <Music2 className={className} />;
    case 'snapchat': return <Ghost className={className} />;
    case 'facebook': return <LetterIcon letter="f" className={className} />;
    case 'behance': return <LetterIcon letter="Bē" className={className} />;
    case 'wego': return <LetterIcon letter="W" className={className} />;
    default: return <Globe2 className={className} />;
  }
}
