/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentProvider, useContent } from './context/ContentContext';
import { LanguageProvider } from './context/LanguageContext';
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

function AppContent() {
  const { isAdminView, isAuthenticated, content } = useContent();

  const runtime = <SiteRuntime />;

  if (isAdminView) {
    if (!isAuthenticated) {
      return <>{runtime}<AdminAuthModal /></>;
    }
    return <>{runtime}<AdminLayout /></>;
  }

  return (
    <div className="min-h-screen bg-[#171717] text-[#f1f2ed] selection:bg-[#2563eb] selection:text-white">
      {runtime}
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
    </div>
  );
}

export default function App() {
  return (
    <ContentProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ContentProvider>
  );
}

