import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  GlobalContent, ProjectItem, YouTubeVideoItem, ContactData, NavigationItem, 
  WorkflowStep, ServiceItem, ClientLogo 
} from '../types/content';
import { initialContent } from '../data/initialContent';

const STORAGE_KEY = 'mografix_site_content_v1';
const AUTH_KEY = 'mografix_admin_auth_v1';
const ADMIN_PASS_KEY = 'mografix_admin_pass_v1';
const DEFAULT_PASS = 'mografix2026';

interface ContentContextType {
  content: GlobalContent;
  updateContent: (updates: Partial<GlobalContent>) => void;
  updateSection: <K extends keyof GlobalContent>(section: K, data: GlobalContent[K]) => void;
  
  // Category management
  categories: string[];
  addCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  deleteCategory: (name: string) => void;
  reorderCategories: (newCats: string[]) => void;

  // Pipeline / Workflow management
  updateWorkflow: (steps: WorkflowStep[]) => void;
  addWorkflowStep: (step: WorkflowStep) => void;
  updateWorkflowStep: (index: number, stepOrUpdates: WorkflowStep | Partial<WorkflowStep>) => void;
  deleteWorkflowStep: (index: number) => void;

  // Services management
  updateServices: (services: ServiceItem[]) => void;
  addService: (service: ServiceItem) => void;
  updateService: (serviceOrId: ServiceItem | string, updates?: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;

  // Client Logos management
  updateClientLogos: (logos: ClientLogo[]) => void;
  addClientLogo: (logo: ClientLogo) => void;
  deleteClientLogo: (id: string) => void;

  // Project management
  addProject: (project: ProjectItem) => void;
  updateProject: (projectOrId: ProjectItem | string, updates?: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  reorderProjects: (newOrderIds: string[]) => void;
  
  // Video management
  addVideo: (video: YouTubeVideoItem) => void;
  updateVideo: (video: YouTubeVideoItem) => void;
  deleteVideo: (id: string) => void;
  
  // Navigation management
  updateNavigation: (nav: NavigationItem[]) => void;
  
  // Links management
  updateLinks: (links: Partial<ContactData>) => void;

  // Section updates (admin)
  updateSectionHeader: (sectionKey: string, headerUpdates: Partial<import('../types/content').SectionHeaderInfo>) => void;
  updateHero: (updates: Partial<import('../types/content').HeroData>) => void;
  updateAbout: (updates: Partial<import('../types/content').AboutData>) => void;
  updateBranding: (updates: Partial<import('../types/content').BrandingData>) => void;
  updateContact: (updates: Partial<import('../types/content').ContactData>) => void;
  updateFooter: (updates: Partial<import('../types/content').FooterData>) => void;
  updateGalleryItem: (idOrIndex: string | number, updates: Partial<import('../types/content').GalleryItem>) => void;
  addGalleryItem: (item: import('../types/content').GalleryItem) => void;
  deleteGalleryItem: (id: string) => void;

  // Persistence & Backup
  resetToDefaults: () => void;
  exportJson: () => void;
  importJson: (jsonString: string) => { success: boolean; error?: string };
  lastSaved: Date | null;

  // Server publication & real-time sync
  publishSite: (note?: string) => Promise<boolean>;
  isPublishing: boolean;
  publishSuccess: boolean;
  publishError: string | null;
  hasUnsavedChanges: boolean;
  lastPublishedAt: string | null;
  publicationVersion: number;
  serverSyncStatus: 'synced' | 'saving' | 'error' | 'syncing';
  fetchLatestFromServer: () => Promise<void>;

  // Admin routing & auth
  isAdminView: boolean;
  setIsAdminView: (isOpen: boolean) => void;
  isAuthenticated: boolean;
  loginAdmin: (password?: string) => boolean;
  logoutAdmin: () => void;
  changeAdminPassword: (newPass: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<GlobalContent>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with initialContent to ensure any newly added fields exist
        return {
          ...initialContent,
          ...parsed,
          seo: { ...initialContent.seo, ...(parsed.seo || {}) },
          branding: { ...initialContent.branding, ...(parsed.branding || {}) },
          hero: { ...initialContent.hero, ...(parsed.hero || {}) },
          about: { ...initialContent.about, ...(parsed.about || {}) },
          contact: { ...initialContent.contact, ...(parsed.contact || {}) },
          footer: { ...initialContent.footer, ...(parsed.footer || {}) }
        };
      }
    } catch (err) {
      console.error('Failed to read content from localStorage:', err);
    }
    return initialContent;
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lastPublished) return new Date(parsed.lastPublished);
      }
    } catch {}
    return null;
  });

  // Server publication and synchronization states
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [serverSyncStatus, setServerSyncStatus] = useState<'synced' | 'saving' | 'error' | 'syncing'>('synced');
  
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(() => {
    return content.lastPublished || content.publicationInfo?.publishedAt || null;
  });
  const [publicationVersion, setPublicationVersion] = useState<number>(() => {
    return content.publicationInfo?.version || 1;
  });

  // Admin authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Admin view toggle (sync with hash/URL)
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const path = window.location.pathname;
      return hash === '#admin' || hash === '#/admin' || path.startsWith('/admin');
    }
    return false;
  });

  // Dedicated "Save Site" / Publish endpoint to the server
  const publishSite = useCallback(async (note?: string): Promise<boolean> => {
    setIsPublishing(true);
    setPublishError(null);
    setServerSyncStatus('saving');

    try {
      const res = await fetch('/api/publish-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...content,
          note: note || 'Explicit site save and publication'
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}: ${res.statusText}`);
      }

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to publish to server');
      }

      const publishedData = result.data || {
        ...content,
        lastPublished: result.publishedAt,
        publicationInfo: {
          publishedAt: result.publishedAt,
          version: result.version,
          publishedBy: 'Admin'
        }
      };

      setContent(publishedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(publishedData));
      setLastPublishedAt(result.publishedAt);
      setPublicationVersion(result.version);
      setLastSaved(new Date(result.publishedAt));
      setHasUnsavedChanges(false);
      setServerSyncStatus('synced');
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 4500);
      return true;
    } catch (err: any) {
      console.error('[CMS] Error publishing site to server:', err);
      setPublishError(err.message || 'Failed to publish to server');
      setServerSyncStatus('error');
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [content]);

  // Fetch authoritative state directly from server
  const fetchLatestFromServer = useCallback(async () => {
    setServerSyncStatus('syncing');
    try {
      const res = await fetch(`/api/content?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.projects) {
          setContent(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          if (data.lastPublished) setLastPublishedAt(data.lastPublished);
          if (data.publicationInfo?.version) setPublicationVersion(data.publicationInfo.version);
          setHasUnsavedChanges(false);
          setServerSyncStatus('synced');
        }
      }
    } catch (err) {
      console.warn('Failed to fetch latest content from server:', err);
      setServerSyncStatus('error');
    }
  }, []);

  // Sync content updates to localStorage & push real-time draft to codebase
  const saveToStorage = useCallback((newContent: GlobalContent) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newContent));
      setLastSaved(new Date());
      setHasUnsavedChanges(true);

      // Push real-time updates directly to the codebase on disk
      fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContent)
      })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.publishedAt) setLastPublishedAt(data.publishedAt);
          if (data.version) setPublicationVersion(data.version);
        }
      })
      .catch((err) => {
        console.warn('Real-time codebase push:', err);
      });
    } catch (err) {
      console.error('Failed to save content to localStorage:', err);
    }
  }, []);

  // Real-time visitor synchronization: poll /api/content-version so all visitors see updates immediately
  useEffect(() => {
    const checkServerVersion = async () => {
      // Don't overwrite if admin has uncommitted local draft changes
      if (hasUnsavedChanges) return;

      try {
        const res = await fetch(`/api/content-version?t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data && typeof data.version === 'number' && data.version > publicationVersion) {
          console.log(`[CMS] Newer server version v${data.version} detected. Refreshing content live for visitor...`);
          const contentRes = await fetch(`/api/content?t=${Date.now()}`);
          if (contentRes.ok) {
            const freshContent = await contentRes.json();
            if (freshContent && freshContent.projects) {
              setContent(freshContent);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(freshContent));
              setPublicationVersion(data.version);
              setLastPublishedAt(data.lastPublished || freshContent.lastPublished);
              setServerSyncStatus('synced');
            }
          }
        }
      } catch {
        // Ignore offline/transient fetch issues
      }
    };

    const interval = setInterval(checkServerVersion, 12000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkServerVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasUnsavedChanges, publicationVersion]);

  // Fetch codebase content on mount if available (with fallback to /content.json for static deployment)
  useEffect(() => {
    fetch('/api/content')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.projects) {
          setContent((prev) => ({
            ...prev,
            ...data
          }));
        } else {
          // Fallback to static public/content.json (useful for static Vercel / GitHub Pages)
          fetch('/content.json')
            .then((r) => (r.ok ? r.json() : null))
            .then((staticData) => {
              if (staticData && staticData.projects) {
                setContent((prev) => ({
                  ...prev,
                  ...staticData
                }));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        // Fallback to static public/content.json if API is unavailable
        fetch('/content.json')
          .then((r) => (r.ok ? r.json() : null))
          .then((staticData) => {
            if (staticData && staticData.projects) {
              setContent((prev) => ({
                ...prev,
                ...staticData
              }));
            }
          })
          .catch(() => {});
      });
  }, []);

  // Sync document title, meta tags, Google Search Console, and Google Analytics
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (content.seo?.pageTitle) {
      document.title = content.seo.pageTitle;
    }

    const updateMetaTag = (name: string, contentVal: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = contentVal;
    };

    const updateOgTag = (property: string, contentVal: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = contentVal;
    };

    if (content.seo?.metaDescription) {
      updateMetaTag('description', content.seo.metaDescription);
    }
    if (content.seo?.ogTitle) {
      updateOgTag('og:title', content.seo.ogTitle);
    }
    if (content.seo?.ogDescription) {
      updateOgTag('og:description', content.seo.ogDescription);
    }
    if (content.seo?.ogImage) {
      updateOgTag('og:image', content.seo.ogImage);
    }

    // Google Search Console verification tag
    if (content.seo?.googleSiteVerification) {
      updateMetaTag('google-site-verification', content.seo.googleSiteVerification);
    }

    // Google Analytics 4 (GA4) Tracking Script
    if (content.seo?.googleAnalyticsId && content.seo.googleAnalyticsId.startsWith('G-')) {
      const gaId = content.seo.googleAnalyticsId;
      const scriptId = 'google-analytics-gtag';
      if (!document.getElementById(scriptId)) {
        const gaScript = document.createElement('script');
        gaScript.id = scriptId;
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(gaScript);

        const inlineScript = document.createElement('script');
        inlineScript.id = 'google-analytics-init';
        inlineScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `;
        document.head.appendChild(inlineScript);
      }
    }
  }, [content.seo]);

  // URL hash listener for #admin
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin' || hash === '#/admin') {
        setIsAdminView(true);
      } else if (isAdminView && !hash.startsWith('#admin') && !hash.startsWith('#/admin')) {
        // Only turn off if deliberately navigated away
        setIsAdminView(false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAdminView]);

  const updateContent = useCallback((updates: Partial<GlobalContent>) => {
    setContent((prev) => {
      const next = { ...prev, ...updates };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateSection = useCallback(<K extends keyof GlobalContent>(section: K, data: GlobalContent[K]) => {
    setContent((prev) => {
      const next = { ...prev, [section]: data };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Project CRUD
  const addProject = useCallback((project: ProjectItem) => {
    setContent((prev) => {
      const next = {
        ...prev,
        projects: [project, ...prev.projects]
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateProject = useCallback((projectOrId: ProjectItem | string, updates?: Partial<ProjectItem>) => {
    setContent((prev) => {
      const isStringId = typeof projectOrId === 'string';
      const targetId = isStringId ? projectOrId : projectOrId.id;
      const targetUpdates = isStringId ? (updates || {}) : projectOrId;
      const next = {
        ...prev,
        projects: prev.projects.map((p) => (p.id === targetId ? { ...p, ...targetUpdates } : p))
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const deleteProject = useCallback((id: string) => {
    setContent((prev) => {
      const next = {
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id)
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const duplicateProject = useCallback((id: string) => {
    setContent((prev) => {
      const target = prev.projects.find((p) => p.id === id);
      if (!target) return prev;
      const duplicated: ProjectItem = {
        ...target,
        id: `proj-${Date.now()}`,
        title: `${target.title} (Copy)`,
        order: prev.projects.length + 1
      };
      const next = {
        ...prev,
        projects: [duplicated, ...prev.projects]
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const reorderProjects = useCallback((newOrderIds: string[]) => {
    setContent((prev) => {
      const map = new Map(prev.projects.map((p) => [p.id, p]));
      const reordered: ProjectItem[] = [];
      newOrderIds.forEach((id, idx) => {
        const item = map.get(id);
        if (item) {
          reordered.push({ ...item, order: idx + 1 });
        }
      });
      // Append any missing
      prev.projects.forEach((p) => {
        if (!newOrderIds.includes(p.id)) {
          reordered.push(p);
        }
      });
      const next = { ...prev, projects: reordered };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Video CRUD
  const addVideo = useCallback((video: YouTubeVideoItem) => {
    setContent((prev) => {
      const next = {
        ...prev,
        featuredVideos: [video, ...prev.featuredVideos]
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateVideo = useCallback((video: YouTubeVideoItem) => {
    setContent((prev) => {
      const next = {
        ...prev,
        featuredVideos: prev.featuredVideos.map((v) => (v.id === video.id ? video : v))
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const deleteVideo = useCallback((id: string) => {
    setContent((prev) => {
      const next = {
        ...prev,
        featuredVideos: prev.featuredVideos.filter((v) => v.id !== id)
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Navigation management
  const updateNavigation = useCallback((nav: NavigationItem[]) => {
    setContent((prev) => {
      const next = { ...prev, navigation: nav };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Category management
  const categories = useMemo(() => {
    if (content.categories && content.categories.length > 0) {
      return content.categories;
    }
    const set = new Set<string>();
    (content.projects || []).forEach(p => { if (p.category) set.add(p.category); });
    (content.services || []).forEach(s => { if (s.category) set.add(s.category); });
    return Array.from(set);
  }, [content.categories, content.projects, content.services]);

  const addCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setContent((prev) => {
      const existing = prev.categories || categories;
      if (existing.includes(trimmed)) return prev;
      const nextCats = [...existing, trimmed];
      const next = { ...prev, categories: nextCats };
      saveToStorage(next);
      return next;
    });
  }, [categories, saveToStorage]);

  const renameCategory = useCallback((oldName: string, newName: string) => {
    const trimmedOld = oldName.trim();
    const trimmedNew = newName.trim();
    if (!trimmedOld || !trimmedNew || trimmedOld === trimmedNew) return;
    setContent((prev) => {
      const existing = prev.categories || categories;
      const nextCats = existing.map(c => c === trimmedOld ? trimmedNew : c);
      const nextProjects = (prev.projects || []).map(p => 
        p.category === trimmedOld ? { ...p, category: trimmedNew } : p
      );
      const nextServices = (prev.services || []).map(s => 
        s.category === trimmedOld ? { ...s, category: trimmedNew } : s
      );
      const nextGallery = (prev.gallery || []).map(g => 
        g.category === trimmedOld ? { ...g, category: trimmedNew } : g
      );
      const next = {
        ...prev,
        categories: nextCats,
        projects: nextProjects,
        services: nextServices,
        gallery: nextGallery
      };
      saveToStorage(next);
      return next;
    });
  }, [categories, saveToStorage]);

  const deleteCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setContent((prev) => {
      const existing = prev.categories || categories;
      const nextCats = existing.filter(c => c !== trimmed);
      const next = { ...prev, categories: nextCats };
      saveToStorage(next);
      return next;
    });
  }, [categories, saveToStorage]);

  const reorderCategories = useCallback((newCats: string[]) => {
    setContent((prev) => {
      const next = { ...prev, categories: newCats };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Workflow / Pipeline management
  const updateWorkflow = useCallback((steps: WorkflowStep[]) => {
    setContent((prev) => {
      const next = { ...prev, workflow: steps };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const addWorkflowStep = useCallback((step: WorkflowStep) => {
    setContent((prev) => {
      const next = { ...prev, workflow: [...(prev.workflow || []), step] };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateWorkflowStep = useCallback((index: number, stepOrUpdates: WorkflowStep | Partial<WorkflowStep>) => {
    setContent((prev) => {
      const current = [...(prev.workflow || [])];
      if (index >= 0 && index < current.length) {
        current[index] = { ...current[index], ...stepOrUpdates };
      }
      const next = { ...prev, workflow: current };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const deleteWorkflowStep = useCallback((index: number) => {
    setContent((prev) => {
      const current = [...(prev.workflow || [])];
      if (index >= 0 && index < current.length) {
        current.splice(index, 1);
      }
      const next = { ...prev, workflow: current };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Services management
  const updateServices = useCallback((services: ServiceItem[]) => {
    setContent((prev) => {
      const next = { ...prev, services };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const addService = useCallback((service: ServiceItem) => {
    setContent((prev) => {
      const next = { ...prev, services: [...(prev.services || []), service] };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateService = useCallback((serviceOrId: ServiceItem | string, updates?: Partial<ServiceItem>) => {
    setContent((prev) => {
      const isStringId = typeof serviceOrId === 'string';
      const targetId = isStringId ? serviceOrId : serviceOrId.id;
      const targetUpdates = isStringId ? (updates || {}) : serviceOrId;
      const next = {
        ...prev,
        services: (prev.services || []).map(s => s.id === targetId ? { ...s, ...targetUpdates } : s)
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const deleteService = useCallback((id: string) => {
    setContent((prev) => {
      const next = {
        ...prev,
        services: (prev.services || []).filter(s => s.id !== id)
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Client Logos
  const updateClientLogos = useCallback((logos: ClientLogo[]) => {
    setContent((prev) => {
      const next = { ...prev, clientLogos: logos };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const addClientLogo = useCallback((logo: ClientLogo) => {
    setContent((prev) => {
      const next = { ...prev, clientLogos: [...(prev.clientLogos || []), logo] };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const deleteClientLogo = useCallback((id: string) => {
    setContent((prev) => {
      const next = {
        ...prev,
        clientLogos: (prev.clientLogos || []).filter(l => l.id !== id)
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Links management
  const updateLinks = useCallback((links: Partial<ContactData>) => {
    setContent((prev) => {
      const next = {
        ...prev,
        contact: {
          ...prev.contact,
          ...links
        }
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Section & Element live updates
  const updateSectionHeader = useCallback((sectionKey: string, headerUpdates: Partial<import('../types/content').SectionHeaderInfo>) => {
    setContent((prev) => {
      const current = prev.sectionHeaders || {};
      const nextHeaders = {
        ...current,
        [sectionKey]: {
          ...(current[sectionKey] || {}),
          ...headerUpdates
        }
      };
      const next = { ...prev, sectionHeaders: nextHeaders };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateHero = useCallback((updates: Partial<import('../types/content').HeroData>) => {
    setContent((prev) => {
      const next = {
        ...prev,
        hero: { ...prev.hero, ...updates }
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateAbout = useCallback((updates: Partial<import('../types/content').AboutData>) => {
    setContent((prev) => {
      const next = {
        ...prev,
        about: { ...prev.about, ...updates }
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateBranding = useCallback((updates: Partial<import('../types/content').BrandingData>) => {
    setContent((prev) => {
      const next = {
        ...prev,
        branding: { ...prev.branding, ...updates }
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateContact = useCallback((updates: Partial<import('../types/content').ContactData>) => {
    setContent((prev) => {
      const next = {
        ...prev,
        contact: { ...prev.contact, ...updates }
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateFooter = useCallback((updates: Partial<import('../types/content').FooterData>) => {
    setContent((prev) => {
      const next = {
        ...prev,
        footer: { ...prev.footer, ...updates }
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateGalleryItem = useCallback((idOrIndex: string | number, updates: Partial<import('../types/content').GalleryItem>) => {
    setContent((prev) => {
      const current = [...(prev.gallery || [])];
      if (typeof idOrIndex === 'number') {
        if (idOrIndex >= 0 && idOrIndex < current.length) {
          current[idOrIndex] = { ...current[idOrIndex], ...updates };
        }
      } else {
        const idx = current.findIndex(g => g.id === idOrIndex);
        if (idx !== -1) {
          current[idx] = { ...current[idx], ...updates };
        }
      }
      const next = { ...prev, gallery: current };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const addGalleryItem = useCallback((item: import('../types/content').GalleryItem) => {
    setContent((prev) => {
      const next = { ...prev, gallery: [...(prev.gallery || []), item] };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const deleteGalleryItem = useCallback((id: string) => {
    setContent((prev) => {
      const next = { ...prev, gallery: (prev.gallery || []).filter(g => g.id !== id) };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setContent(initialContent);
    saveToStorage(initialContent);
  }, [saveToStorage]);

  // Export JSON (for GitHub Pages deployment)
  const exportJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(content, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'shpixels-content.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [content]);

  // Import JSON
  const importJson = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.hero || !parsed.projects) {
        return { success: false, error: 'Invalid SHPIXELS content JSON format.' };
      }
      setContent(parsed);
      saveToStorage(parsed);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to parse JSON' };
    }
  }, [saveToStorage]);

  // Auth management (Password field removed per user requirement)
  const loginAdmin = useCallback((_password?: string): boolean => {
    localStorage.setItem(AUTH_KEY, 'true');
    setIsAuthenticated(true);
    return true;
  }, []);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  const changeAdminPassword = useCallback((newPass: string) => {
    localStorage.setItem(ADMIN_PASS_KEY, newPass);
  }, []);

  // Dynamic favicon & page title synchronization
  useEffect(() => {
    const faviconUrl = content.branding?.favicon || content.seo?.favicon || '/assets/shpixels-icon.svg';
    if (faviconUrl) {
      let iconLink: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = faviconUrl;
      if (faviconUrl.startsWith('data:image/svg') || faviconUrl.endsWith('.svg')) {
        iconLink.type = 'image/svg+xml';
      } else if (faviconUrl.startsWith('data:image/png') || faviconUrl.endsWith('.png')) {
        iconLink.type = 'image/png';
      } else if (faviconUrl.startsWith('data:image/x-icon') || faviconUrl.endsWith('.ico')) {
        iconLink.type = 'image/x-icon';
      }
    }

    if (content.seo?.pageTitle) {
      document.title = content.seo.pageTitle;
    }
  }, [content.branding?.favicon, content.seo?.favicon, content.seo?.pageTitle]);

  return (
    <ContentContext.Provider
      value={{
        content,
        updateContent,
        updateSection,
        categories,
        addCategory,
        renameCategory,
        deleteCategory,
        reorderCategories,
        updateWorkflow,
        addWorkflowStep,
        updateWorkflowStep,
        deleteWorkflowStep,
        updateServices,
        addService,
        updateService,
        deleteService,
        updateClientLogos,
        addClientLogo,
        deleteClientLogo,
        addProject,
        updateProject,
        deleteProject,
        duplicateProject,
        reorderProjects,
        addVideo,
        updateVideo,
        deleteVideo,
        updateNavigation,
        updateLinks,
        resetToDefaults,
        exportJson,
        importJson,
        lastSaved,
        publishSite,
        isPublishing,
        publishSuccess,
        publishError,
        hasUnsavedChanges,
        lastPublishedAt,
        publicationVersion,
        serverSyncStatus,
        fetchLatestFromServer,
        updateSectionHeader,
        updateHero,
        updateAbout,
        updateBranding,
        updateContact,
        updateFooter,
        updateGalleryItem,
        addGalleryItem,
        deleteGalleryItem,
        isAdminView,
        setIsAdminView,
        isAuthenticated,
        loginAdmin,
        logoutAdmin,
        changeAdminPassword
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
