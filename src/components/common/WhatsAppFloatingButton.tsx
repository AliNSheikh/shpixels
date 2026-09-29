import { useContent } from '../../context/ContentContext';
import { normalizeWhatsAppUrl, SocialIcon } from './SocialIcon';

export function WhatsAppFloatingButton() {
  const { content, isAdminView } = useContent();
  const url = normalizeWhatsAppUrl(content.contact.whatsapp || '');

  if (isAdminView || !url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      title="WhatsApp"
      className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl shadow-black/40 hover:scale-105 active:scale-95 transition-transform border border-white/15"
    >
      <SocialIcon platform="whatsapp" className="w-6 h-6 sm:w-7 sm:h-7" />
    </a>
  );
}
