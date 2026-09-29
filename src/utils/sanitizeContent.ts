import { GlobalContent, ProjectItem } from '../types/content';
import { ensureUniqueProjectSlug } from './projectRoutes';

/**
 * Deduplicates and ensures uniqueness of IDs across projects and other content collections.
 * Preserves categories, categoryDetails, and cleans duplicate categories without dropping user-created categories.
 */
export function sanitizeGlobalContent(rawContent: GlobalContent): GlobalContent {
  if (!rawContent) return rawContent;

  const { adminAuth, supabaseConfig, ...publicContent } = rawContent;
  rawContent = publicContent;
  const seenProjectIds = new Set<string>();
  const projectsWithUniqueIds: ProjectItem[] = [];

  for (let i = 0; i < (rawContent.projects || []).length; i++) {
    const proj = rawContent.projects[i];
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
  for (const cat of rawContent.categories || []) {
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
    ...rawContent.branding,
    siteName: rawContent.branding?.siteName || rawContent.branding?.logoText || 'My Site'
  };

  return {
    ...rawContent,
    branding,
    sectionVisibility: rawContent.sectionVisibility || {},
    showreel: rawContent.showreel || { caption: '', specs: [] },
    headerCtas: rawContent.headerCtas || [],
    experience: rawContent.experience || [],
    education: rawContent.education || [],
    skills: rawContent.skills || [],
    testimonials: rawContent.testimonials || [],
    footerLinks: rawContent.footerLinks || [],
    categories: cleanCategories.length > 0 ? cleanCategories : (rawContent.categories || []),
    categoryDetails: rawContent.categoryDetails || {},
    clientLogos: rawContent.clientLogos || [],
    sectionHeaders: rawContent.sectionHeaders || {},
    projects: sanitizedProjects
  };
}
