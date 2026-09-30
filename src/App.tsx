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

function AppContent() {
  const { isAdminView, isAuthenticated, content, serverSyncStatus } = useContent();
  const { theme } = useTheme();

  if (isAdminView) {
    if (!isAuthenticated) {
      return <AdminAuthModal />;
    }
    return <AdminLayout />;
  }

  const projectRoute = typeof window !== 'undefined'
    ? window.location.pathname.match(/^\/projects\/([^/]+)\/?$/)
    : null;

  if (projectRoute) {
    const project = findProjectBySlug(
      (content.projects || []).filter((item) => item.published),
      projectRoute[1]
    );

    return (
      <div data-theme={theme} className="public-site min-h-screen bg-[#171717] text-[#f1f2ed] selection:bg-[#2563eb] selection:text-white">
        <PublicSiteErrorBoundary>
          <SiteRuntime project={project || null} />
          {content.sectionVisibility?.header !== false && <Header />}
          {serverSyncStatus === 'syncing' ? (
            <main className="min-h-[75vh] pt-32 flex items-center justify-center">
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#706e6a]">Loading project…</div>
            </main>
          ) : project ? (
            <ProjectPage project={project} />
          ) : (
            <ProjectNotFound />
          )}
          {content.sectionVisibility?.footer !== false && <Footer />}
          <WhatsAppFloatingButton />
        </PublicSiteErrorBoundary>
      </div>
    );
  }

  return (
    <div data-theme={theme} className="public-site min-h-screen bg-[#171717] text-[#f1f2ed] selection:bg-[#2563eb] selection:text-white">
      <PublicSiteErrorBoundary>
        <SiteRuntime />
        {content.sectionVisibility?.header !== false && <Header />}
        <main>
          {content.sectionVisibility?.hero !== false && <Hero />}
          {content.sectionVisibility?.showreel !== false && <Showreel />}
          {content.sectionVisibility?.clientlogos !== false && <ClientLogos />}
          {content.sectionVisibility?.about !== false && <About />}
          {content.sectionVisibility?.services !== false && <Services />}
          {content.sectionVisibility?.portfolio !== false && <Portfolio />}
          {content.sectionVisibility?.process !== false && <Process />}
          {content.sectionVisibility?.gallery !== false && <Gallery />}
          {content.sectionVisibility?.experience !== false && <Experience />}
          {content.sectionVisibility?.skills !== false && <Skills />}
          {content.sectionVisibility?.testimonials !== false && <Testimonials />}
          {content.sectionVisibility?.contact !== false && <Contact />}
        </main>
        {content.sectionVisibility?.footer !== false && <Footer />}
        <WhatsAppFloatingButton />
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

