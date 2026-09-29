import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ensureUniqueProjectSlug,
  findProjectBySlug,
  getProjectPath,
  normalizeProjectSlug
} from '../src/utils/projectRoutes.ts';

test('project slugs are URL-safe and project paths are stable', () => {
  const project: any = {
    id: 'proj-123',
    title: 'Luxury Wedding Film — Dubai 2026',
    slug: '',
    published: true
  };

  const slug = ensureUniqueProjectSlug(project, [project]);
  assert.equal(slug, 'luxury-wedding-film-dubai-2026');
  assert.equal(getProjectPath({ ...project, slug }), '/projects/luxury-wedding-film-dubai-2026');
});

test('duplicate project slugs receive unique stable suffixes', () => {
  const first: any = { id: 'proj-alpha-111', title: 'Brand Film', slug: '' };
  const second: any = { id: 'proj-beta-222', title: 'Brand Film', slug: '' };

  const firstSlug = ensureUniqueProjectSlug(first, [first, second]);
  const secondSlug = ensureUniqueProjectSlug(second, [first, second]);

  assert.notEqual(firstSlug, secondSlug);
  assert.equal(normalizeProjectSlug(firstSlug), firstSlug);
  assert.equal(normalizeProjectSlug(secondSlug), secondSlug);
});

test('project lookup resolves the public slug', () => {
  const projects: any[] = [
    { id: 'proj-one', title: 'First Project', slug: 'first-project', published: true }
  ];

  assert.equal(findProjectBySlug(projects, 'first-project')?.id, 'proj-one');
});
