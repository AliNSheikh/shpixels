import { GlobalContent, ProjectItem } from '../types/content';
import { ensureUniqueProjectSlug } from './projectRoutes';
import { initialContent } from '../data/initialContent';

/**
 * Deduplicates and ensures uniqueness of IDs across projects and other content collections.
 * Preserves categories, categoryDetails, and cleans duplicate categories without dropping user-created categories.
 */
export function sanitizeGlobalContent(rawContent: GlobalContent): GlobalContent {
  if (!rawContent || typeof rawContent !== 'object') return initialContent;

  const { adminAuth, supabaseConfig, ...publicContent } = rawContent;
  rawContent = publicContent as GlobalContent;

  const safeProjects = Array.isArray(rawContent.projects) ? rawContent.projects : [];
  const safeCategories = Array.isArray(rawContent.categories) ? rawContent.categories : [];
  const seenProjectIds = new Set<string>();
  const projectsWithUniqueIds: ProjectItem[] = [];

  for (let i = 0; i < safeProjects.length; i++) {
    const proj = safeProjects[i];
    let uniqueId = proj.id;

    if (!uniqueId || seenProjectIds.has(uniqueId)) {
      // Generate a collision-free unique id.
      uniqueId = `${uniqueId || 'proj'}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}-${i}`;
    }

    seenProjectIds.add(uniqueId);
    projectsWithUniqueIds.push(uniqueId === proj.id ? proj : { ...proj, id: uniqueId });
  }

  // Every project receives a stable, URL-safe slug. Existing custom slugs are
  // preserved; missing or colliding slugs are generated deterministically.
  const sanitizedProjects: ProjectItem[] = [];
  for (const project of projectsWithUniqueIds) {
    const slug = ensureUniqueProjectSlug(project, [
      ...sanitizedProjects,
      ...projectsWithUniqueIds.filter((item) => item.id !== project.id)
    ]);
    sanitizedProjects.push(project.slug === slug ? project : { ...project, slug });
  }

  // Deduplicate categories while preserving order and casing
  const cleanCategories: string[] = [];
  const seenCats = new Set<string>();
  for (const cat of safeCategories) {
    const trimmed = typeof cat === 'string' ? cat.trim() : '';
    if (trimmed && !seenCats.has(trimmed.toLowerCase())) {
      seenCats.add(trimmed.toLowerCase());
      cleanCategories.push(trimmed);
    }
  }

  // Backfill fields introduced after older rows were saved to Supabase, so the
  // admin form never flips from an uncontrolled to a controlled input and the
  // public site always has a name to display.
  const branding = {
    ...initialContent.branding,
    ...(rawContent.branding || {}),
    siteName: rawContent.branding?.siteName || rawContent.branding?.logoText || initialContent.branding.siteName
  };

  const hero = {
    ...initialContent.hero,
    ...(rawContent.hero || {}),
    typingStrings: Array.isArray(rawContent.hero?.typingStrings) ? rawContent.hero.typingStrings : (initialContent.hero.typingStrings || []),
    marqueeItems: Array.isArray(rawContent.hero?.marqueeItems) ? rawContent.hero.marqueeItems : []
  };

  const about = {
    ...initialContent.about,
    ...(rawContent.about || {}),
    bioParagraphs: Array.isArray(rawContent.about?.bioParagraphs) ? rawContent.about.bioParagraphs : [],
    stats: Array.isArray(rawContent.about?.stats) ? rawContent.about.stats : [],
    skills: Array.isArray(rawContent.about?.skills) ? rawContent.about.skills : [],
    tools: Array.isArray(rawContent.about?.tools) ? rawContent.about.tools : [],
    specialties: Array.isArray(rawContent.about?.specialties) ? rawContent.about.specialties : []
  };

  const contact = {
    ...initialContent.contact,
    ...(rawContent.contact || {}),
    website: rawContent.contact?.website || '',
    facebook: rawContent.contact?.facebook || '',
    snapchat: rawContent.contact?.snapchat || '',
    wego: rawContent.contact?.wego || '',
    socialLinks: Array.isArray(rawContent.contact?.socialLinks) ? rawContent.contact.socialLinks : []
  };

  const seo = {
    ...initialContent.seo,
    ...(rawContent.seo || {})
  };

  const footer = {
    ...initialContent.footer,
    ...(rawContent.footer || {})
  };

  return {
    ...rawContent,
    seo,
    branding,
    navigation: Array.isArray(rawContent.navigation) ? rawContent.navigation : initialContent.navigation,
    hero,
    about,
    services: Array.isArray(rawContent.services) ? rawContent.services : [],
    projects: sanitizedProjects,
    featuredVideos: Array.isArray(rawContent.featuredVideos) ? rawContent.featuredVideos : [],
    gallery: Array.isArray(rawContent.gallery) ? rawContent.gallery : [],
    workflow: Array.isArray(rawContent.workflow) ? rawContent.workflow : [],
    contact,
    footer,
    sectionVisibility: rawContent.sectionVisibility && typeof rawContent.sectionVisibility === 'object' ? rawContent.sectionVisibility : {},
    showreel: rawContent.showreel && typeof rawContent.showreel === 'object'
      ? {
          caption: rawContent.showreel.caption || '',
          specs: Array.isArray(rawContent.showreel.specs) ? rawContent.showreel.specs : []
        }
      : { caption: '', specs: [] },
    headerCtas: Array.isArray(rawContent.headerCtas) ? rawContent.headerCtas : [],
    experience: Array.isArray(rawContent.experience) ? rawContent.experience : [],
    education: Array.isArray(rawContent.education) ? rawContent.education : [],
    skills: Array.isArray(rawContent.skills) ? rawContent.skills : [],
    testimonials: Array.isArray(rawContent.testimonials) ? rawContent.testimonials : [],
    footerLinks: Array.isArray(rawContent.footerLinks) ? rawContent.footerLinks : [],
    categories: cleanCategories,
    categoryDetails: rawContent.categoryDetails && typeof rawContent.categoryDetails === 'object' ? rawContent.categoryDetails : {},
    clientLogos: Array.isArray(rawContent.clientLogos) ? rawContent.clientLogos : [],
    sectionHeaders: rawContent.sectionHeaders && typeof rawContent.sectionHeaders === 'object' ? rawContent.sectionHeaders : {}
  };
}
