import type {
  CategoryDetail,
  ClientLogo,
  ContactSocialLink,
  FooterLink,
  GlobalContent,
  HeaderCta,
  ProjectItem,
  SectionHeaderInfo,
  ServiceItem,
  SkillItem,
  TestimonialItem,
  TimelineItem,
  WorkflowStep,
  YouTubeVideoItem,
  GalleryItem,
  NavigationItem,
  StatItem
} from '../types/content';
import { ensureUniqueProjectSlug } from './projectRoutes';
import { initialContent } from '../data/initialContent';

type AnyRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is AnyRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const text = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const numberValue = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const booleanValue = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return fallback;
};

const objectArray = (value: unknown): AnyRecord[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];

const stringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map((item) => text(item).trim()).filter(Boolean)
    : [];

const safeId = (value: unknown, prefix: string, index: number): string =>
  text(value).trim() || `${prefix}-${index + 1}`;

/**
 * Converts CMS/Supabase data from any historical schema into the current public
 * rendering shape. A malformed/null item must never be able to take the public
 * website offline.
 */
export function sanitizeGlobalContent(input: GlobalContent): GlobalContent {
  if (!isRecord(input)) return initialContent;

  const { adminAuth: _adminAuth, supabaseConfig: _supabaseConfig, ...raw } = input as unknown as AnyRecord;

  const rawBranding = isRecord(raw.branding) ? raw.branding : {};
  const branding = {
    ...initialContent.branding,
    ...rawBranding,
    siteName: text(rawBranding.siteName, text(rawBranding.logoText, initialContent.branding.siteName)),
    logoText: text(rawBranding.logoText, initialContent.branding.logoText),
    logoSubtext: text(rawBranding.logoSubtext, initialContent.branding.logoSubtext),
    logoImage: text(rawBranding.logoImage, initialContent.branding.logoImage || ''),
    logoLight: text(rawBranding.logoLight, initialContent.branding.logoLight || ''),
    logoDark: text(rawBranding.logoDark, initialContent.branding.logoDark || ''),
    favicon: text(rawBranding.favicon, initialContent.branding.favicon || ''),
    accentColor: text(rawBranding.accentColor, initialContent.branding.accentColor)
  };

  const rawSeo = isRecord(raw.seo) ? raw.seo : {};
  const seo = {
    ...initialContent.seo,
    ...rawSeo,
    pageTitle: text(rawSeo.pageTitle, initialContent.seo.pageTitle),
    metaDescription: text(rawSeo.metaDescription, initialContent.seo.metaDescription),
    ogTitle: text(rawSeo.ogTitle, initialContent.seo.ogTitle),
    ogDescription: text(rawSeo.ogDescription, initialContent.seo.ogDescription),
    ogImage: text(rawSeo.ogImage, initialContent.seo.ogImage),
    canonicalUrl: text(rawSeo.canonicalUrl, initialContent.seo.canonicalUrl),
    favicon: text(rawSeo.favicon, initialContent.seo.favicon || ''),
    googleSiteVerification: text(rawSeo.googleSiteVerification),
    googleAnalyticsId: text(rawSeo.googleAnalyticsId),
    googleTagManagerId: text(rawSeo.googleTagManagerId),
    metaPixelId: text(rawSeo.metaPixelId),
    sitemapEnabled: booleanValue(rawSeo.sitemapEnabled, initialContent.seo.sitemapEnabled !== false)
  };

  const navigation: NavigationItem[] = objectArray(raw.navigation).map((item, index) => ({
    id: safeId(item.id, 'nav', index),
    label: text(item.label, `Link ${index + 1}`),
    href: text(item.href, '#'),
    order: numberValue(item.order, index + 1),
    visible: booleanValue(item.visible, true),
    target: item.target === '_blank' ? '_blank' : '_self',
    kind: item.kind === 'cta' ? 'cta' : 'link'
  }));

  const rawHero = isRecord(raw.hero) ? raw.hero : {};
  const hero = {
    ...initialContent.hero,
    ...rawHero,
    title: text(rawHero.title, initialContent.hero.title),
    subtitle: text(rawHero.subtitle, initialContent.hero.subtitle),
    badgeText: text(rawHero.badgeText, initialContent.hero.badgeText),
    primaryCtaText: text(rawHero.primaryCtaText, initialContent.hero.primaryCtaText),
    primaryCtaLink: text(rawHero.primaryCtaLink, initialContent.hero.primaryCtaLink),
    secondaryCtaText: text(rawHero.secondaryCtaText, initialContent.hero.secondaryCtaText),
    secondaryCtaLink: text(rawHero.secondaryCtaLink, initialContent.hero.secondaryCtaLink),
    featuredVideoId: text(rawHero.featuredVideoId, initialContent.hero.featuredVideoId),
    bgImageUrl: text(rawHero.bgImageUrl, initialContent.hero.bgImageUrl),
    backgroundType: rawHero.backgroundType === 'video' ? 'video' as const : 'image' as const,
    backgroundVideoUrl: text(rawHero.backgroundVideoUrl),
    typingStrings: stringArray(rawHero.typingStrings),
    marqueeItems: stringArray(rawHero.marqueeItems)
  };

  const rawAbout = isRecord(raw.about) ? raw.about : {};
  const stats: StatItem[] = objectArray(rawAbout.stats).map((item, index) => ({
    id: safeId(item.id, 'stat', index),
    value: text(item.value),
    label: text(item.label),
    suffix: text(item.suffix)
  }));
  const about = {
    ...initialContent.about,
    ...rawAbout,
    badge: text(rawAbout.badge, initialContent.about.badge),
    heading: text(rawAbout.heading, initialContent.about.heading),
    highlightText: text(rawAbout.highlightText, initialContent.about.highlightText),
    bioParagraphs: stringArray(rawAbout.bioParagraphs),
    profileImage: text(rawAbout.profileImage, initialContent.about.profileImage),
    stats,
    skills: stringArray(rawAbout.skills),
    tools: stringArray(rawAbout.tools),
    experienceYears: numberValue(rawAbout.experienceYears, initialContent.about.experienceYears),
    specialties: stringArray(rawAbout.specialties),
    resumeUrl: text(rawAbout.resumeUrl),
    resumeLabel: text(rawAbout.resumeLabel, initialContent.about.resumeLabel || 'Download Resume'),
    location: text(rawAbout.location)
  };

  const services: ServiceItem[] = objectArray(raw.services).map((item, index) => ({
    id: safeId(item.id, 'service', index),
    title: text(item.title, `Service ${index + 1}`),
    subtitle: text(item.subtitle),
    description: text(item.description),
    category: text(item.category),
    icon: text(item.icon, 'Film'),
    features: stringArray(item.features),
    deliverables: stringArray(item.deliverables),
    order: numberValue(item.order, index + 1),
    visible: booleanValue(item.visible, true)
  }));

  const normalizedProjects: ProjectItem[] = objectArray(raw.projects).map((item, index) => {
    const videos = objectArray(item.videos).map((video, videoIndex) => ({
      id: safeId(video.id, `project-${index + 1}-video`, videoIndex),
      title: text(video.title),
      youtubeUrl: text(video.youtubeUrl),
      videoId: text(video.videoId, text(video.youtubeUrl)),
      caption: text(video.caption),
      platform: text(video.platform, 'youtube')
    }));
    const externalLinks = objectArray(item.externalLinks)
      .map((link) => ({ label: text(link.label, 'Link'), url: text(link.url) }))
      .filter((link) => Boolean(link.url));

    return {
      id: safeId(item.id, 'project', index),
      title: text(item.title, `Project ${index + 1}`),
      description: text(item.description),
      category: text(item.category, 'Other'),
      client: text(item.client),
      year: text(item.year),
      coverImage: text(item.coverImage),
      slug: text(item.slug),
      liveUrl: text(item.liveUrl),
      githubUrl: text(item.githubUrl),
      techStack: stringArray(item.techStack),
      completionDate: text(item.completionDate),
      videos,
      gallery: stringArray(item.gallery),
      externalLinks,
      featured: booleanValue(item.featured, false),
      published: booleanValue(item.published, true),
      order: numberValue(item.order, index + 1)
    };
  });

  const seenProjectIds = new Set<string>();
  const projectsWithUniqueIds = normalizedProjects.map((project, index) => {
    let id = project.id;
    if (seenProjectIds.has(id)) id = `${id}-${index + 1}`;
    seenProjectIds.add(id);
    return id === project.id ? project : { ...project, id };
  });

  const projects: ProjectItem[] = [];
  for (const project of projectsWithUniqueIds) {
    const slug = ensureUniqueProjectSlug(project, [...projects, ...projectsWithUniqueIds.filter((item) => item.id !== project.id)]);
    projects.push({ ...project, slug });
  }

  const featuredVideos: YouTubeVideoItem[] = objectArray(raw.featuredVideos).map((item, index) => ({
    id: safeId(item.id, 'video', index),
    title: text(item.title, `Video ${index + 1}`),
    youtubeUrl: text(item.youtubeUrl),
    videoId: text(item.videoId, text(item.youtubeUrl)),
    thumbnail: text(item.thumbnail),
    description: text(item.description),
    category: text(item.category),
    featured: booleanValue(item.featured, false),
    order: numberValue(item.order, index + 1),
    visible: booleanValue(item.visible, true),
    caption: text(item.caption),
    client: text(item.client)
  }));

  const gallery: GalleryItem[] = objectArray(raw.gallery).map((item, index) => ({
    id: safeId(item.id, 'gallery', index),
    title: text(item.title),
    image: text(item.image),
    category: text(item.category),
    caption: text(item.caption),
    client: text(item.client),
    order: numberValue(item.order, index + 1)
  }));

  const workflow: WorkflowStep[] = objectArray(raw.workflow).map((item, index) => ({
    number: text(item.number, String(index + 1).padStart(2, '0')),
    title: text(item.title),
    description: text(item.description),
    icon: text(item.icon, 'Workflow')
  }));

  const rawContact = isRecord(raw.contact) ? raw.contact : {};
  const socialLinks: ContactSocialLink[] = objectArray(rawContact.socialLinks)
    .map((item, index) => ({
      id: safeId(item.id, 'social', index),
      platform: ['website', 'whatsapp', 'facebook', 'instagram', 'tiktok', 'snapchat', 'youtube', 'behance', 'linkedin', 'wego', 'custom'].includes(text(item.platform))
        ? text(item.platform) as ContactSocialLink['platform']
        : 'custom',
      label: text(item.label),
      url: text(item.url),
      order: numberValue(item.order, index + 100),
      visible: booleanValue(item.visible, true)
    }))
    .filter((item) => Boolean(item.url));
  const contact = {
    ...initialContent.contact,
    ...rawContact,
    email: text(rawContact.email),
    phone: text(rawContact.phone),
    website: text(rawContact.website),
    whatsapp: text(rawContact.whatsapp),
    facebook: text(rawContact.facebook),
    instagram: text(rawContact.instagram),
    tiktok: text(rawContact.tiktok),
    snapchat: text(rawContact.snapchat),
    youtube: text(rawContact.youtube),
    behance: text(rawContact.behance),
    linkedin: text(rawContact.linkedin),
    wego: text(rawContact.wego),
    socialLinks,
    location: text(rawContact.location),
    address: text(rawContact.address),
    workingHours: text(rawContact.workingHours),
    ctaHeading: text(rawContact.ctaHeading),
    ctaSubtitle: text(rawContact.ctaSubtitle),
    responseTimeNote: text(rawContact.responseTimeNote)
  };

  const rawFooter = isRecord(raw.footer) ? raw.footer : {};
  const footer = {
    ...initialContent.footer,
    ...rawFooter,
    copyrightText: text(rawFooter.copyrightText, initialContent.footer.copyrightText),
    quote: text(rawFooter.quote, initialContent.footer.quote),
    disclaimer: text(rawFooter.disclaimer, initialContent.footer.disclaimer),
    legalNotice: text(rawFooter.legalNotice)
  };

  const headerCtas: HeaderCta[] = objectArray(raw.headerCtas).map((item, index) => ({
    id: safeId(item.id, 'cta', index),
    label: text(item.label),
    url: text(item.url, '#contact'),
    target: item.target === '_blank' ? '_blank' : '_self',
    variant: item.variant === 'secondary' ? 'secondary' : 'primary',
    order: numberValue(item.order, index + 1),
    visible: booleanValue(item.visible, true)
  }));

  const timeline = (value: unknown, type: 'experience' | 'education'): TimelineItem[] =>
    objectArray(value).map((item, index) => ({
      id: safeId(item.id, type, index),
      type,
      title: text(item.title),
      organization: text(item.organization),
      startDate: text(item.startDate),
      endDate: text(item.endDate),
      isCurrent: booleanValue(item.isCurrent, false),
      description: text(item.description),
      location: text(item.location),
      order: numberValue(item.order, index + 1),
      visible: booleanValue(item.visible, true)
    }));

  const skills: SkillItem[] = objectArray(raw.skills).map((item, index) => ({
    id: safeId(item.id, 'skill', index),
    name: text(item.name),
    category: text(item.category),
    proficiency: Math.max(0, Math.min(100, numberValue(item.proficiency, 0))),
    icon: text(item.icon),
    order: numberValue(item.order, index + 1),
    visible: booleanValue(item.visible, true)
  }));

  const testimonials: TestimonialItem[] = objectArray(raw.testimonials).map((item, index) => ({
    id: safeId(item.id, 'testimonial', index),
    clientName: text(item.clientName),
    position: text(item.position),
    company: text(item.company),
    avatar: text(item.avatar),
    body: text(item.body),
    rating: Math.max(0, Math.min(5, numberValue(item.rating, 0))),
    order: numberValue(item.order, index + 1),
    visible: booleanValue(item.visible, true)
  }));

  const footerLinks: FooterLink[] = objectArray(raw.footerLinks).map((item, index) => ({
    id: safeId(item.id, 'footer-link', index),
    label: text(item.label),
    url: text(item.url),
    target: item.target === '_blank' ? '_blank' : '_self',
    order: numberValue(item.order, index + 1),
    visible: booleanValue(item.visible, true)
  }));

  const categories: string[] = [];
  const seenCategories = new Set<string>();
  for (const category of stringArray(raw.categories)) {
    const key = category.toLowerCase();
    if (!seenCategories.has(key)) {
      seenCategories.add(key);
      categories.push(category);
    }
  }

  const categoryDetails: Record<string, CategoryDetail> = {};
  if (isRecord(raw.categoryDetails)) {
    for (const [key, value] of Object.entries(raw.categoryDetails)) {
      if (!isRecord(value)) continue;
      categoryDetails[key] = {
        coverImage: text(value.coverImage),
        description: text(value.description),
        descriptionAr: text(value.descriptionAr),
        nameAr: text(value.nameAr),
        color: text(value.color)
      };
    }
  }

  const clientLogos: ClientLogo[] = objectArray(raw.clientLogos).map((item, index) => ({
    id: safeId(item.id, 'brand', index),
    name: text(item.name, `Brand ${index + 1}`),
    logoUrl: text(item.logoUrl, text(item.logo)),
    logo: text(item.logo, text(item.logoUrl)),
    websiteUrl: text(item.websiteUrl, text(item.website)),
    website: text(item.website, text(item.websiteUrl)),
    order: numberValue(item.order, index + 1),
    visible: booleanValue(item.visible, true)
  }));

  const sectionVisibility: Record<string, boolean> = {};
  if (isRecord(raw.sectionVisibility)) {
    for (const [key, value] of Object.entries(raw.sectionVisibility)) {
      sectionVisibility[key] = booleanValue(value, true);
    }
  }

  const sectionHeaders: Record<string, SectionHeaderInfo> = {};
  if (isRecord(raw.sectionHeaders)) {
    for (const [key, value] of Object.entries(raw.sectionHeaders)) {
      if (!isRecord(value)) continue;
      sectionHeaders[key] = {
        badge: text(value.badge),
        title: text(value.title),
        description: text(value.description)
      };
    }
  }

  const rawShowreel = isRecord(raw.showreel) ? raw.showreel : {};
  const specs = Array.isArray(rawShowreel.specs)
    ? rawShowreel.specs.map((spec, index) =>
        isRecord(spec)
          ? { label: text(spec.label, `Spec ${index + 1}`), value: text(spec.value) }
          : { label: text(spec), value: '' }
      ).filter((spec) => Boolean(spec.label || spec.value))
    : [];

  return {
    ...(raw as unknown as GlobalContent),
    seo,
    branding,
    navigation: navigation.length ? navigation : initialContent.navigation,
    hero,
    about,
    services,
    projects,
    featuredVideos,
    gallery,
    workflow,
    contact,
    footer,
    sectionVisibility,
    showreel: { caption: text(rawShowreel.caption), specs },
    headerCtas,
    experience: timeline(raw.experience, 'experience'),
    education: timeline(raw.education, 'education'),
    skills,
    testimonials,
    footerLinks,
    categories,
    categoryDetails,
    clientLogos,
    sectionHeaders
  };
}
