import { GlobalContent, ProjectItem } from '../types/content';

/**
 * Deduplicates and ensures uniqueness of IDs across projects and other content collections.
<<<<<<< HEAD
<<<<<<< HEAD
 * If two projects have the exact same ID, subsequent projects receive a deterministic unique ID.
=======
 * Preserves categories, categoryDetails, and cleans duplicate categories without dropping user-created categories.
>>>>>>> 85bd45e (claude commit)
=======
 * If two projects have the exact same ID, subsequent projects receive a deterministic unique ID.
>>>>>>> 6a8ac5bbb249fa1ebdce82d7677f56ff3780b673
 */
export function sanitizeGlobalContent(rawContent: GlobalContent): GlobalContent {
  if (!rawContent) return rawContent;

  const seenProjectIds = new Set<string>();
  const sanitizedProjects: ProjectItem[] = [];

  for (let i = 0; i < (rawContent.projects || []).length; i++) {
    const proj = rawContent.projects[i];
    let uniqueId = proj.id;

    if (!uniqueId || seenProjectIds.has(uniqueId)) {
      // Generate a collision-free unique id
      uniqueId = `${uniqueId || 'proj'}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}-${i}`;
    }

    seenProjectIds.add(uniqueId);
    sanitizedProjects.push(uniqueId === proj.id ? proj : { ...proj, id: uniqueId });
  }

<<<<<<< HEAD
<<<<<<< HEAD
  return {
    ...rawContent,
=======
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
    categories: cleanCategories.length > 0 ? cleanCategories : rawContent.categories,
>>>>>>> 85bd45e (claude commit)
=======
  return {
    ...rawContent,
>>>>>>> 6a8ac5bbb249fa1ebdce82d7677f56ff3780b673
    projects: sanitizedProjects
  };
}
