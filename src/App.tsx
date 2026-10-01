/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
import { findProjectBySlug } from './utils/projectRoutes';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { PublicSiteErrorBoundary } from './components/common/PublicSiteErrorBoundary';
import { PublicSectionBoundary } from './components/common/PublicSectionBoundary';

function AppContent() {
  const { isAdminView, isAuthenticated, content, serverSyncStatus } = useContent();
  const { theme } = useTheme();

  if (isAdminView) {
    if (!isAuthenticated) return <AdminAuthModal />;
    return <AdminLayout />;
  }

  const projectRoute = typeof window !== 'undefined'
    ? window.location.pathname.match(/^\/projects\/([^/]+)\/?$/)
    : null;

  if (projectRoute) {
    const project = findProjectBySlug(
      (Array.isArray(content.projects) ? content.projects : []).filter((item) => item?.published),
      projectRoute[1]
    );

    return (
      <div data-theme={theme} className="public-site min-h-screen bg-[#171717] text-[#f1f2ed] selection:bg-[#2563eb] selection:text-white">
        <PublicSiteErrorBoundary>
          <PublicSectionBoundary name="site-runtime">
            <SiteRuntime project={project || null} />
          </PublicSectionBoundary>

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

          {content.sectionVisibility?.footer !== false && (
            <PublicSectionBoundary name="footer"><Footer /></PublicSectionBoundary>
          )}
          <PublicSectionBoundary name="whatsapp"><WhatsAppFloatingButton /></PublicSectionBoundary>
        </PublicSiteErrorBoundary>
      </div>
    );
  }

  return (
    <div data-theme={theme} className="public-site min-h-screen bg-[#171717] text-[#f1f2ed] selection:bg-[#2563eb] selection:text-white">
      <PublicSiteErrorBoundary>
        <PublicSectionBoundary name="site-runtime"><SiteRuntime /></PublicSectionBoundary>
        {content.sectionVisibility?.header !== false && (
          <PublicSectionBoundary name="header"><Header /></PublicSectionBoundary>
        )}

        <main>
          {content.sectionVisibility?.hero !== false && (
            <PublicSectionBoundary name="hero"><Hero /></PublicSectionBoundary>
          )}
          {content.sectionVisibility?.showreel !== false && (
            <PublicSectionBoundary name="showreel"><Showreel /></PublicSectionBoundary>
          )}
          {content.sectionVisibility?.clientlogos !== false && (
            <PublicSectionBoundary name="client-logos"><ClientLogos /></PublicSectionBoundary>
          )}
          {content.sectionVisibility?.about !== false && (
            <PublicSectionBoundary name="about"><About /></PublicSectionBoundary>
          )}
          {content.sectionVisibility?.services !== false && (
            <PublicSectionBoundary name="services"><Services /></PublicSectionBoundary>
          )}
          {content.sectionVisibility?.portfolio !== false && (
            <PublicSectionBoundary name="portfolio"><Portfolio /></PublicSectionBoundary>
          )}
          {content.sectionVisibility?.process !== false && (
            <PublicSectionBoundary name="process"><Process /></PublicSectionBoundary>
          )}
          {content.sectionVisibility?.gallery !== false && (
            <PublicSectionBoundary name="gallery"><Gallery /></PublicSectionBoundary>
          )}
          {content.sectionVisibility?.experience !== false && (
            <PublicSectionBoundary name="experience"><Experience /></PublicSectionBoundary>
          )}
          {content.sectionVisibility?.skills !== false && (
            <PublicSectionBoundary name="skills"><Skills /></PublicSectionBoundary>
          )}
          {content.sectionVisibility?.testimonials !== false && (
            <PublicSectionBoundary name="testimonials"><Testimonials /></PublicSectionBoundary>
          )}
          {content.sectionVisibility?.contact !== false && (
            <PublicSectionBoundary name="contact"><Contact /></PublicSectionBoundary>
          )}
        </main>

        {content.sectionVisibility?.footer !== false && (
          <PublicSectionBoundary name="footer"><Footer /></PublicSectionBoundary>
        )}
        <PublicSectionBoundary name="whatsapp"><WhatsAppFloatingButton /></PublicSectionBoundary>
      </PublicSiteErrorBoundary>
    </div>
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
