import { GlobalContent, ProjectItem } from '../types/content';

/**
 * Deduplicates and ensures uniqueness of IDs across projects and other content collections.
 * If two projects have the exact same ID, subsequent projects receive a deterministic unique ID.
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

  return {
    ...rawContent,
    projects: sanitizedProjects
  };
}
