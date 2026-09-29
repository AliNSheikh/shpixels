import { ProjectItem } from '../types/content';

export function normalizeProjectSlug(value: string | undefined | null): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '');
}

export function slugifyProjectTitle(title: string): string {
  return normalizeProjectSlug(title) || 'project';
}

function stableIdSuffix(id: string): string {
  const normalized = normalizeProjectSlug(id).replace(/^proj-/, '');
  if (!normalized) return 'work';
  const parts = normalized.split('-').filter(Boolean);
  return parts.slice(-2).join('-').slice(-18) || normalized.slice(-12) || 'work';
}

export function getProjectSlug(project: Pick<ProjectItem, 'id' | 'title' | 'slug'>): string {
  const explicit = normalizeProjectSlug(project.slug);
  if (explicit) return explicit;

  const title = slugifyProjectTitle(project.title);
  return title !== 'project'
    ? title
    : `project-${stableIdSuffix(project.id)}`;
}

export function getProjectPath(project: Pick<ProjectItem, 'id' | 'title' | 'slug'>): string {
  return `/projects/${encodeURIComponent(getProjectSlug(project))}`;
}

export function ensureUniqueProjectSlug(
  project: Pick<ProjectItem, 'id' | 'title' | 'slug'>,
  projects: Array<Pick<ProjectItem, 'id' | 'title' | 'slug'>>
): string {
  const preferred = normalizeProjectSlug(project.slug) || slugifyProjectTitle(project.title);
  const occupied = new Set(
    projects
      .filter((item) => item.id !== project.id)
      .map((item) => getProjectSlug(item))
  );

  if (!occupied.has(preferred)) return preferred;

  const suffix = stableIdSuffix(project.id);
  let candidate = `${preferred}-${suffix}`;
  let attempt = 2;

  while (occupied.has(candidate)) {
    candidate = `${preferred}-${suffix}-${attempt}`;
    attempt += 1;
  }

  return candidate;
}

export function findProjectBySlug(projects: ProjectItem[], rawSlug: string): ProjectItem | undefined {
  let decoded = rawSlug;
  try {
    decoded = decodeURIComponent(rawSlug);
  } catch {}

  const slug = normalizeProjectSlug(decoded);
  return projects.find((project) => getProjectSlug(project) === slug);
}
