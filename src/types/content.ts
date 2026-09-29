export interface SEOData {
  pageTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  favicon?: string;
  googleSiteVerification?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  metaPixelId?: string;
  sitemapEnabled?: boolean;
}

export interface BrandingData {
  /** The canonical name of the site/studio. Used as the fallback for the navbar
   * wordmark, footer wordmark, footer copyright line, and SEO/meta defaults
   * whenever a more specific field (logoText, seo.pageTitle, footer.copyrightText)
   * hasn't been customized. Change this once in Site Settings to rename the site
   * everywhere it isn't explicitly overridden. */
  siteName: string;
  logoText: string;
  logoSubtext: string;
  logoImage?: string;
  logoLight?: string;
  logoDark?: string;
  favicon?: string;
  accentColor: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  order: number;
  visible: boolean;
  target?: '_self' | '_blank';
  kind?: 'link' | 'cta';
}

export interface HeroData {
  title: string;
  subtitle: string;
  badgeText: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  featuredVideoId: string;
  bgImageUrl: string;
  backgroundType?: 'image' | 'video';
  backgroundVideoUrl?: string;
  typingStrings?: string[];
  marqueeItems: string[];
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  suffix?: string;
}

export interface AboutData {
  badge: string;
  heading: string;
  highlightText: string;
  bioParagraphs: string[];
  profileImage: string;
  stats: StatItem[];
  skills: string[];
  tools: string[];
  experienceYears: number;
  specialties?: string[];
  resumeUrl?: string;
  resumeLabel?: string;
  location?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  icon: string;
  features: string[];
  deliverables?: string[];
  order?: number;
  visible?: boolean;
}

export interface ProjectVideo {
  id: string;
  title: string;
  youtubeUrl: string;
  videoId: string;
  caption?: string;
  platform?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: string;
  client: string;
  year: string;
  coverImage: string;
  slug?: string;
  liveUrl?: string;
  githubUrl?: string;
  techStack?: string[];
  completionDate?: string;
  videos: ProjectVideo[];
  gallery: string[];
  externalLinks: { label: string; url: string }[];
  featured: boolean;
  published: boolean;
  order: number;
}

export interface YouTubeVideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  videoId: string;
  thumbnail: string;
  description: string;
  category: string;
  featured: boolean;
  order: number;
  visible: boolean;
  caption?: string;
  client?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  category: string;
  caption?: string;
  client?: string;
  order?: number;
}

export interface WorkflowStep {
  number: string;
  title: string;
  description: string;
  icon?: string;
}

export interface ClientLogo {
  id: string;
  name: string;
  logoUrl?: string;
  logo?: string;
  websiteUrl?: string;
  website?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  nameAr?: string;
  color?: string;
  icon?: string;
  coverImage?: string;
  description?: string;
  descriptionAr?: string;
}

export interface CategoryDetail {
  coverImage?: string;
  description?: string;
  descriptionAr?: string;
  nameAr?: string;
  color?: string;
}

export interface AdminAuthData {
  passwordHash: string;
  salt: string;
  updatedAt: string;
}

export interface SupabaseConfigData {
  url?: string;
  anonKey?: string;
  autoSync?: boolean;
}

export interface SectionHeaderInfo {
  badge?: string;
  title?: string;
  description?: string;
}

export type SocialPlatform =
  | 'website'
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'snapchat'
  | 'youtube'
  | 'behance'
  | 'linkedin'
  | 'wego'
  | 'custom';

export interface ContactSocialLink {
  id: string;
  platform: SocialPlatform;
  label?: string;
  url: string;
  order?: number;
  visible?: boolean;
}

export interface ContactData {
  email: string;
  phone: string;
  website?: string;
  whatsapp: string;
  facebook?: string;
  instagram: string;
  tiktok: string;
  snapchat?: string;
  youtube: string;
  behance: string;
  linkedin: string;
  wego?: string;
  socialLinks?: ContactSocialLink[];
  location: string;
  address?: string;
  workingHours?: string;
  ctaHeading: string;
  ctaSubtitle: string;
  responseTimeNote: string;
}

export interface FooterLink {
  id: string;
  label: string;
  url: string;
  target?: '_self' | '_blank';
  order?: number;
  visible?: boolean;
}

export interface HeaderCta {
  id: string;
  label: string;
  url: string;
  target?: '_self' | '_blank';
  variant?: 'primary' | 'secondary';
  order?: number;
  visible?: boolean;
}

export interface TimelineItem {
  id: string;
  type: 'experience' | 'education';
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
  location?: string;
  order?: number;
  visible?: boolean;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  proficiency?: number;
  icon?: string;
  order?: number;
  visible?: boolean;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  position?: string;
  company?: string;
  avatar?: string;
  body: string;
  rating?: number;
  order?: number;
  visible?: boolean;
}

export interface FooterData {
  copyrightText: string;
  quote: string;
  disclaimer: string;
  legalNotice?: string;
}

export interface PublicationRecord {
  id: string;
  publishedAt: string;
  version: number;
  publishedBy?: string;
  note?: string;
}

export interface PublicationInfo {
  publishedAt: string;
  version: number;
  publishedBy?: string;
}

export interface GlobalContent {
  sectionVisibility?: Record<string, boolean>;
  showreel?: { caption: string; specs: { label: string; value: string }[] };
  seo: SEOData;
  branding: BrandingData;
  navigation: NavigationItem[];
  hero: HeroData;
  about: AboutData;
  services: ServiceItem[];
  projects: ProjectItem[];
  featuredVideos: YouTubeVideoItem[];
  gallery: GalleryItem[];
  workflow: WorkflowStep[];
  contact: ContactData;
  footer: FooterData;
  headerCtas?: HeaderCta[];
  experience?: TimelineItem[];
  education?: TimelineItem[];
  skills?: SkillItem[];
  testimonials?: TestimonialItem[];
  footerLinks?: FooterLink[];
  categories?: string[];
  categoryDetails?: Record<string, CategoryDetail>;
  adminAuth?: AdminAuthData;
  supabaseConfig?: SupabaseConfigData;
  clientLogos?: ClientLogo[];
  sectionHeaders?: Record<string, SectionHeaderInfo>;
  lastPublished?: string;
  publicationInfo?: PublicationInfo;
  publicationHistory?: PublicationRecord[];
}
