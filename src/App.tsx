/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from 'react';
import { ContentProvider, useContent } from './context/ContentContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/public/Header';
import { Hero } from './components/public/Hero';
import { Showreel } from './components/public/Showreel';
import { About } from './components/public/About';
import { Services } from './components/public/Services';
import { ClientLogos } from './components/public/ClientLogos';
import { Portfolio } from './components/public/Portfolio';
import { Process } from './components/public/Process';
import { Gallery } from './components/public/Gallery';
import { Contact } from './components/public/Contact';
import { Experience } from './components/public/Experience';
import { Skills } from './components/public/Skills';
import { Testimonials } from './components/public/Testimonials';
import { Footer } from './components/public/Footer';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { SiteRuntime } from './components/common/SiteRuntime';
import { ProjectNotFound, ProjectPage } from './components/public/ProjectPage';
import { CategoryNotFound, CategoryPage } from './components/public/CategoryPage';
import { findCategoryBySlug, findProjectBySlug } from './utils/projectRoutes';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { PublicSiteErrorBoundary } from './components/common/PublicSiteErrorBoundary';
import { PublicSectionBoundary } from './components/common/PublicSectionBoundary';

function PublicShell({ children }: { children: ReactNode }) {
  const { content } = useContent();
  const { theme } = useTheme();

  return (
    <div data-theme={theme} className="public-site min-h-screen bg-[#171717] text-[#f1f2ed] selection:bg-[#2563eb] selection:text-white">
      <PublicSiteErrorBoundary>
        {children}
        {content.sectionVisibility?.footer !== false && (
          <PublicSectionBoundary name="footer"><Footer /></PublicSectionBoundary>
        )}
        <PublicSectionBoundary name="whatsapp"><WhatsAppFloatingButton /></PublicSectionBoundary>
      </PublicSiteErrorBoundary>
    </div>
  );
}

function AppContent() {
  const { isAdminView, isAuthenticated, content, serverSyncStatus } = useContent();

  if (isAdminView) {
    if (!isAuthenticated) return <AdminAuthModal />;
    return <AdminLayout />;
  }

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const projectRoute = pathname.match(/^\/projects\/([^/]+)\/?$/);
  const categoryRoute = pathname.match(/^\/categories\/([^/]+)\/?$/);

  if (projectRoute) {
    const project = findProjectBySlug(
      (Array.isArray(content.projects) ? content.projects : []).filter((item) => item?.published),
      projectRoute[1]
    );

    return (
      <PublicShell>
        <PublicSectionBoundary name="site-runtime"><SiteRuntime project={project || null} /></PublicSectionBoundary>
        {content.sectionVisibility?.header !== false && (
          <PublicSectionBoundary name="header"><Header /></PublicSectionBoundary>
        )}
        {serverSyncStatus === 'syncing' ? (
          <main className="min-h-[75vh] pt-32 flex items-center justify-center">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#706e6a]">Loading project…</div>
          </main>
        ) : project ? (
          <PublicSectionBoundary name="project-page" fallback={<ProjectNotFound />}>
            <ProjectPage project={project} />
          </PublicSectionBoundary>
        ) : (
          <ProjectNotFound />
        )}
      </PublicShell>
    );
  }

  if (categoryRoute) {
    const categoryNames: string[] = [];
    const seen = new Set<string>();
    const addCategory = (value: unknown) => {
      const name = String(value || '').trim();
      const key = name.toLowerCase();
      if (!name || seen.has(key)) return;
      seen.add(key);
      categoryNames.push(name);
    };

    (Array.isArray(content.categories) ? content.categories : []).forEach(addCategory);
    (Array.isArray(content.featuredVideos) ? content.featuredVideos : [])
      .filter((item) => item?.visible !== false)
      .forEach((item) => addCategory(item.category));

    const category = findCategoryBySlug(categoryNames, categoryRoute[1]);

    return (
      <PublicShell>
        <PublicSectionBoundary name="site-runtime"><SiteRuntime categoryName={category || null} /></PublicSectionBoundary>
        {content.sectionVisibility?.header !== false && (
          <PublicSectionBoundary name="header"><Header /></PublicSectionBoundary>
        )}
        {serverSyncStatus === 'syncing' ? (
          <main className="min-h-[75vh] pt-32 flex items-center justify-center">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#706e6a]">Loading category…</div>
          </main>
        ) : category ? (
          <PublicSectionBoundary name="category-page" fallback={<CategoryNotFound />}>
            <CategoryPage category={category} />
          </PublicSectionBoundary>
        ) : (
          <CategoryNotFound />
        )}
      </PublicShell>
    );
  }

  const sectionDefinitions = [
    { anchor: 'hero', visibilityKey: 'hero', defaultOrder: 10, element: <Hero /> },
    { anchor: 'brands', visibilityKey: 'brands', legacyVisibilityKey: 'clientlogos', defaultOrder: 20, element: <ClientLogos /> },
    { anchor: 'showreel', visibilityKey: 'showreel', defaultOrder: 30, element: <Showreel /> },
    { anchor: 'portfolio', visibilityKey: 'portfolio', defaultOrder: 40, element: <Portfolio /> },
    { anchor: 'about', visibilityKey: 'about', defaultOrder: 50, element: <About /> },
    { anchor: 'services', visibilityKey: 'services', defaultOrder: 60, element: <Services /> },
    { anchor: 'process', visibilityKey: 'process', defaultOrder: 70, element: <Process /> },
    { anchor: 'gallery', visibilityKey: 'gallery', defaultOrder: 80, element: <Gallery /> },
    { anchor: 'experience', visibilityKey: 'experience', defaultOrder: 90, element: <Experience /> },
    { anchor: 'skills', visibilityKey: 'skills', defaultOrder: 100, element: <Skills /> },
    { anchor: 'testimonials', visibilityKey: 'testimonials', defaultOrder: 110, element: <Testimonials /> },
    { anchor: 'contact', visibilityKey: 'contact', defaultOrder: 120, element: <Contact /> }
  ];

  const navOrder = new Map<string, number>();
  [...(Array.isArray(content.navigation) ? content.navigation : [])]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach((item, index) => {
      const href = String(item.href || '').trim();
      if (!href.startsWith('#')) return;
      const anchor = href.slice(1).toLowerCase();
      if (anchor && !navOrder.has(anchor)) navOrder.set(anchor, index);
    });

  const orderedSections = [...sectionDefinitions].sort((a, b) => {
    const aNav = navOrder.get(a.anchor);
    const bNav = navOrder.get(b.anchor);
    if (aNav !== undefined && bNav !== undefined) return aNav - bNav;
    if (aNav !== undefined) return -1;
    if (bNav !== undefined) return 1;
    return a.defaultOrder - b.defaultOrder;
  });

  return (
    <PublicShell>
      <PublicSectionBoundary name="site-runtime"><SiteRuntime /></PublicSectionBoundary>
      {content.sectionVisibility?.header !== false && (
        <PublicSectionBoundary name="header"><Header /></PublicSectionBoundary>
      )}
      <main className="homepage-sections">
        {orderedSections.map((section) => {
          const hiddenByPrimary = content.sectionVisibility?.[section.visibilityKey] === false;
          const hiddenByLegacy = section.legacyVisibilityKey
            ? content.sectionVisibility?.[section.legacyVisibilityKey] === false
            : false;
          if (hiddenByPrimary || hiddenByLegacy) return null;

          return (
            <PublicSectionBoundary key={section.anchor} name={section.anchor}>
              {section.element}
            </PublicSectionBoundary>
          );
        })}
      </main>
    </PublicShell>
  );
}

export default function App() {
  return (
    <ContentProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </ContentProvider>
  );
}
