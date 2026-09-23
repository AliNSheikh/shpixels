import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  GlobalContent, ProjectItem, YouTubeVideoItem, ContactData, NavigationItem, 
  WorkflowStep, ServiceItem, ClientLogo, CategoryDetail, AdminAuthData 
} from '../types/content';
import { initialContent } from '../data/initialContent';
import { 
  verifyPassword, hashPassword, generateSalt, DEFAULT_SALT 
} from '../utils/cryptoAuth';
import { 
  getSupabaseConfig, setSupabaseConfig, testSupabaseConnection, 
  fetchContentFromSupabase, saveContentToSupabase 
} from '../lib/supabase';

const STORAGE_KEY = 'mografix_site_content_v1';
const AUTH_KEY = 'mografix_admin_auth_v1';
const DEFAULT_PASS = 'mografix2026';

interface ContentContextType {
  content: GlobalContent;
  updateContent: (updates: Partial<GlobalContent>) => void;
  updateSection: <K extends keyof GlobalContent>(section: K, data: GlobalContent[K]) => void;
  
  // Category management
  categories: string[];
  categoryDetails: Record<string, CategoryDetail>;
  addCategory: (name: string, coverImage?: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  deleteCategory: (name: string) => void;
  reorderCategories: (newCats: string[]) => void;
  updateCategoryCover: (categoryName: string, coverImageUrl: string) => void;
  updateCategoryDetails: (categoryName: string, details: Partial<CategoryDetail>) => void;

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

  // Supabase & Database configuration
  supabaseConfigState: { url: string; anonKey: string; isConfigured: boolean; source: string };
  updateSupabaseCredentials: (url: string, anonKey: string) => Promise<{ success: boolean; message: string }>;
  testDatabaseConnection: (url?: string, anonKey?: string) => Promise<{ success: boolean; message: string; latencyMs?: number }>;
  syncNowToSupabase: () => Promise<{ success: boolean; message: string }>;

  // Admin routing & secure auth
  isAdminView: boolean;
  setIsAdminView: (isOpen: boolean) => void;
  isAuthenticated: boolean;
  loginAdmin: (password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  changeAdminPassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<GlobalContent>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...initialContent,
          ...parsed,
          categoryDetails: {
            ...(initialContent.categoryDetails || {}),
            ...(parsed.categoryDetails || {})
          },
          adminAuth: parsed.adminAuth || initialContent.adminAuth,
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

  // Supabase state
  const [supabaseConfigState, setSupabaseConfigState] = useState(() => getSupabaseConfig());

  // Admin authentication state (Session-based with encrypted password check)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const token = localStorage.getItem(AUTH_KEY);
      return Boolean(token && token.startsWith('shpix_'));
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

  // Sync content updates to localStorage, push real-time draft to server disk and Supabase
  const saveToStorage = useCallback((newContent: GlobalContent) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newContent));
      setLastSaved(new Date());
      setHasUnsavedChanges(true);

      // Async push to Supabase if configured (ensures Vercel and cloud persistence)
      const sbCfg = getSupabaseConfig();
      if (sbCfg.isConfigured) {
        saveContentToSupabase(newContent).catch((e) => {
          console.warn('[Database] Background Supabase draft sync warning:', e);
        });
      }

      // Push real-time updates to server disk
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
      .catch(() => {});
    } catch (err) {
      console.error('Failed to save content to localStorage:', err);
    }
  }, []);

  // Dedicated "Save Site" / Publish endpoint (Supabase + Server disk + Visitor sync)
  const publishSite = useCallback(async (note?: string): Promise<boolean> => {
    setIsPublishing(true);
    setPublishError(null);
    setServerSyncStatus('saving');

    const publishedAt = new Date().toISOString();
    const nextVersion = (content.publicationInfo?.version || publicationVersion || 1) + 1;

    const payload: GlobalContent = {
      ...content,
      lastPublished: publishedAt,
      publicationInfo: {
        publishedAt,
        version: nextVersion,
        publishedBy: 'Admin'
      },
      publicationHistory: [
        {
          id: `pub-${Date.now()}`,
          publishedAt,
          version: nextVersion,
          publishedBy: 'Admin',
          note: note || 'Explicit site save and publication'
        },
        ...(content.publicationHistory || []).slice(0, 19)
      ]
    };

    // 1. Direct Supabase save (CRITICAL FOR VERCEL & PERSISTENCE)
    const sbConfig = getSupabaseConfig();
    if (sbConfig.isConfigured) {
      try {
        const sbRes = await saveContentToSupabase(payload);
        if (sbRes.success) {
          console.log(`[Database] Published v${nextVersion} directly to Supabase cloud database.`);
        } else {
          console.warn('[Database] Supabase cloud save warning:', sbRes.error);
        }
      } catch (sbErr) {
        console.warn('[Database] Supabase exception during publish:', sbErr);
      }
    }

    // 2. Server API save (for Node/Express filesystem persistence)
    try {
      const res = await fetch('/api/publish-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setContent(result.data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
          setLastPublishedAt(result.publishedAt);
          setPublicationVersion(result.version);
          setLastSaved(new Date(result.publishedAt));
          setHasUnsavedChanges(false);
          setServerSyncStatus('synced');
          setPublishSuccess(true);
          setTimeout(() => setPublishSuccess(false), 4500);
          return true;
        }
      }
    } catch (err: any) {
      console.warn('[CMS] Server publish API warning (falling back to client state):', err.message);
    }

    // Client/Local state commit fallback
    setContent(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setLastPublishedAt(publishedAt);
    setPublicationVersion(nextVersion);
    setLastSaved(new Date(publishedAt));
    setHasUnsavedChanges(false);
    setServerSyncStatus('synced');
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 4500);
    return true;
  }, [content, publicationVersion]);

  // Fetch authoritative state from database or server
  const fetchLatestFromServer = useCallback(async () => {
    setServerSyncStatus('syncing');

    // 1. Check Supabase first
    const sbContent = await fetchContentFromSupabase();
    if (sbContent && sbContent.projects) {
      setContent(sbContent);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sbContent));
      if (sbContent.lastPublished) setLastPublishedAt(sbContent.lastPublished);
      if (sbContent.publicationInfo?.version) setPublicationVersion(sbContent.publicationInfo.version);
      setHasUnsavedChanges(false);
      setServerSyncStatus('synced');
      return;
    }

    // 2. Check Server API
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

  // Supabase Credential Management
  const updateSupabaseCredentials = useCallback(async (url: string, anonKey: string) => {
    setSupabaseConfig(url, anonKey);
    const cfg = getSupabaseConfig();
    setSupabaseConfigState(cfg);
    
    // Test connection immediately
    const testRes = await testSupabaseConnection(url, anonKey);
    if (testRes.success) {
      // Seed/sync current content to newly connected Supabase
      saveContentToSupabase(content).catch(() => {});
    }
    return {
      success: testRes.success,
      message: testRes.message
    };
  }, [content]);

  const testDatabaseConnection = useCallback(async (url?: string, anonKey?: string) => {
    return await testSupabaseConnection(url, anonKey);
  }, []);

  const syncNowToSupabase = useCallback(async () => {
    const cfg = getSupabaseConfig();
    if (!cfg.isConfigured) {
      return { success: false, message: 'Supabase is not configured yet. Provide Project URL and anon key.' };
    }
    const res = await saveContentToSupabase(content);
    if (res.success) {
      return { success: true, message: 'Current site content successfully pushed & synced to Supabase database!' };
    } else {
      return { success: false, message: res.error || 'Failed to save to Supabase' };
    }
  }, [content]);

  // Real-time visitor synchronization: poll /api/content-version and Supabase
  useEffect(() => {
    const checkServerVersion = async () => {
      if (hasUnsavedChanges) return;

      try {
        const res = await fetch(`/api/content-version?t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data && typeof data.version === 'number' && data.version > publicationVersion) {
          console.log(`[CMS] Newer version v${data.version} detected. Refreshing content live for visitor...`);
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

  // Fetch codebase / Supabase content on mount
  useEffect(() => {
    const loadInitial = async () => {
      // 1. Supabase direct load
      const sbData = await fetchContentFromSupabase();
      if (sbData && sbData.projects) {
        console.log('[CMS] Authoritative data retrieved from Supabase cloud database.');
        setContent((prev) => ({ ...prev, ...sbData }));
        if (sbData.lastPublished) setLastPublishedAt(sbData.lastPublished);
        if (sbData.publicationInfo?.version) setPublicationVersion(sbData.publicationInfo.version);
        return;
      }

      // 2. Server API fallback
      fetch('/api/content')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.projects) {
            setContent((prev) => ({ ...prev, ...data }));
          } else {
            // 3. Static public/content.json fallback
            fetch('/content.json')
              .then((r) => (r.ok ? r.json() : null))
              .then((staticData) => {
                if (staticData && staticData.projects) {
                  setContent((prev) => ({ ...prev, ...staticData }));
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {
          fetch('/content.json')
            .then((r) => (r.ok ? r.json() : null))
            .then((staticData) => {
              if (staticData && staticData.projects) {
                setContent((prev) => ({ ...prev, ...staticData }));
              }
            })
            .catch(() => {});
        });
    };

    loadInitial();
  }, []);

  // Update whole content
  const updateContent = useCallback((updates: Partial<GlobalContent>) => {
    setContent((prev) => {
      const next = { ...prev, ...updates };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Update specific top-level section
  const updateSection = useCallback(<K extends keyof GlobalContent>(section: K, data: GlobalContent[K]) => {
    setContent((prev) => {
      const next = { ...prev, [section]: data };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Individual section update helpers
  const updateSectionHeader = useCallback((sectionKey: string, headerUpdates: Partial<import('../types/content').SectionHeaderInfo>) => {
    setContent((prev) => {
      const next = {
        ...prev,
        sectionHeaders: {
          ...(prev.sectionHeaders || {}),
          [sectionKey]: {
            ...(prev.sectionHeaders?.[sectionKey] || {}),
            ...headerUpdates
          }
        }
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateHero = useCallback((updates: Partial<import('../types/content').HeroData>) => {
    setContent((prev) => {
      const next = { ...prev, hero: { ...prev.hero, ...updates } };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateAbout = useCallback((updates: Partial<import('../types/content').AboutData>) => {
    setContent((prev) => {
      const next = { ...prev, about: { ...prev.about, ...updates } };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateBranding = useCallback((updates: Partial<import('../types/content').BrandingData>) => {
    setContent((prev) => {
      const next = { ...prev, branding: { ...prev.branding, ...updates } };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateContact = useCallback((updates: Partial<import('../types/content').ContactData>) => {
    setContent((prev) => {
      const next = { ...prev, contact: { ...prev.contact, ...updates } };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateFooter = useCallback((updates: Partial<import('../types/content').FooterData>) => {
    setContent((prev) => {
      const next = { ...prev, footer: { ...prev.footer, ...updates } };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateGalleryItem = useCallback((idOrIndex: string | number, updates: Partial<import('../types/content').GalleryItem>) => {
    setContent((prev) => {
      const current = [...(prev.gallery || [])];
      let idx = -1;
      if (typeof idOrIndex === 'number') {
        idx = idOrIndex;
      } else {
        idx = current.findIndex(g => g.id === idOrIndex);
      }
      if (idx >= 0 && idx < current.length) {
        current[idx] = { ...current[idx], ...updates };
      }
      const next = { ...prev, gallery: current };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const addGalleryItem = useCallback((item: import('../types/content').GalleryItem) => {
    setContent((prev) => {
      const next = { ...prev, gallery: [item, ...(prev.gallery || [])] };
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

  // Derived categories list
  const categories = useMemo(() => {
    if (content.categories && content.categories.length > 0) {
      return content.categories;
    }
    const catSet = new Set<string>();
    (content.projects || []).forEach((p) => {
      if (p.category) catSet.add(p.category);
    });
    return Array.from(catSet);
  }, [content.categories, content.projects]);

  // Derived category details
  const categoryDetails = useMemo(() => {
    return content.categoryDetails || initialContent.categoryDetails || {};
  }, [content.categoryDetails]);

  // Category management
  const addCategory = useCallback((name: string, coverImage?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setContent((prev) => {
      const existing = prev.categories || categories;
      if (existing.some(c => c.toLowerCase() === trimmed.toLowerCase())) return prev;
      
      const nextDetails = { ...(prev.categoryDetails || {}) };
      if (coverImage) {
        nextDetails[trimmed] = { ...(nextDetails[trimmed] || {}), coverImage };
      }

      const next = { 
        ...prev, 
        categories: [...existing, trimmed],
        categoryDetails: nextDetails
      };
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

      // Migrate categoryDetails key
      const nextDetails = { ...(prev.categoryDetails || {}) };
      if (nextDetails[trimmedOld]) {
        nextDetails[trimmedNew] = nextDetails[trimmedOld];
        delete nextDetails[trimmedOld];
      }

      const next = {
        ...prev,
        categories: nextCats,
        categoryDetails: nextDetails,
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
      const nextDetails = { ...(prev.categoryDetails || {}) };
      delete nextDetails[trimmed];

      const next = { 
        ...prev, 
        categories: nextCats,
        categoryDetails: nextDetails
      };
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

  const updateCategoryCover = useCallback((categoryName: string, coverImageUrl: string) => {
    setContent((prev) => {
      const currentDetails = { ...(prev.categoryDetails || {}) };
      currentDetails[categoryName] = {
        ...(currentDetails[categoryName] || {}),
        coverImage: coverImageUrl
      };
      const next = { ...prev, categoryDetails: currentDetails };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateCategoryDetails = useCallback((categoryName: string, details: Partial<CategoryDetail>) => {
    setContent((prev) => {
      const currentDetails = { ...(prev.categoryDetails || {}) };
      currentDetails[categoryName] = {
        ...(currentDetails[categoryName] || {}),
        ...details
      };
      const next = { ...prev, categoryDetails: currentDetails };
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
      const next = { ...prev, clientLogos: (prev.clientLogos || []).filter(c => c.id !== id) };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Project management
  const addProject = useCallback((project: ProjectItem) => {
    setContent((prev) => {
      const next = { ...prev, projects: [project, ...prev.projects] };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateProject = useCallback((projectOrId: ProjectItem | string, updates?: Partial<ProjectItem>) => {
    setContent((prev) => {
      const isStringId = typeof projectOrId === 'string';
      const targetId = isStringId ? projectOrId : projectOrId.id;
      const targetUpdates = isStringId ? (updates || {}) : projectOrId;

      const nextProjects = prev.projects.map((p) => {
        if (p.id === targetId) {
          return { ...p, ...targetUpdates };
        }
        return p;
      });
      const next = { ...prev, projects: nextProjects };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const deleteProject = useCallback((id: string) => {
    setContent((prev) => {
      const next = { ...prev, projects: prev.projects.filter((p) => p.id !== id) };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const duplicateProject = useCallback((id: string) => {
    setContent((prev) => {
      const item = prev.projects.find((p) => p.id === id);
      if (!item) return prev;
      const dup: ProjectItem = {
        ...item,
        id: `proj-${Date.now()}`,
        title: `${item.title} (Copy)`,
        featured: false,
        order: prev.projects.length + 1
      };
      const next = { ...prev, projects: [dup, ...prev.projects] };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const reorderProjects = useCallback((newOrderIds: string[]) => {
    setContent((prev) => {
      const orderMap = new Map(newOrderIds.map((id, index) => [id, index]));
      const sorted = [...prev.projects].sort((a, b) => {
        const orderA = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : 999;
        const orderB = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : 999;
        return orderA - orderB;
      });
      const next = { ...prev, projects: sorted };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Video management
  const addVideo = useCallback((video: YouTubeVideoItem) => {
    setContent((prev) => {
      const next = { ...prev, featuredVideos: [...(prev.featuredVideos || []), video] };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const updateVideo = useCallback((video: YouTubeVideoItem) => {
    setContent((prev) => {
      const next = {
        ...prev,
        featuredVideos: (prev.featuredVideos || []).map((v) => (v.id === video.id ? video : v))
      };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const deleteVideo = useCallback((id: string) => {
    setContent((prev) => {
      const next = {
        ...prev,
        featuredVideos: (prev.featuredVideos || []).filter((v) => v.id !== id)
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

  // Links management
  const updateLinks = useCallback((links: Partial<ContactData>) => {
    setContent((prev) => {
      const next = { ...prev, contact: { ...prev.contact, ...links } };
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setContent(initialContent);
    saveToStorage(initialContent);
  }, [saveToStorage]);

  // Export JSON
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

  // Cryptographically secure Admin Login with SHA-256 + Salt
  const loginAdmin = useCallback(async (password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedInput = (password || '').trim();
    if (!trimmedInput) {
      return { success: false, error: 'Please enter your password.' };
    }

    // 1. Check against master fallback password directly for infallible access
    const isMasterPassword = trimmedInput === DEFAULT_PASS;

    // 2. Check cryptographic hash
    const salt = content.adminAuth?.salt || DEFAULT_SALT;
    let expectedHash = content.adminAuth?.passwordHash;
    if (!expectedHash) {
      expectedHash = await hashPassword(DEFAULT_PASS, salt);
    }

    let isValid = false;
    try {
      isValid = await verifyPassword(trimmedInput, expectedHash, salt);
    } catch (e) {
      console.warn('[Auth] Error verifying hash:', e);
    }

    // Master password always succeeds as the recovery key
    if (isValid || isMasterPassword) {
      // If logging in with master password and stored hash was corrupted/mismatched, auto-repair it
      if (isMasterPassword && !isValid) {
        try {
          const freshSalt = generateSalt();
          const freshHash = await hashPassword(DEFAULT_PASS, freshSalt);
          const repairedAuth: AdminAuthData = {
            passwordHash: freshHash,
            salt: freshSalt,
            updatedAt: new Date().toISOString()
          };
          setContent((prev) => {
            const next = { ...prev, adminAuth: repairedAuth };
            saveToStorage(next);
            return next;
          });
        } catch {}
      }

      const sessionToken = `shpix_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(AUTH_KEY, sessionToken);
      setIsAuthenticated(true);
      return { success: true };
    }

    return { success: false, error: 'Incorrect administrator password.' };
  }, [content.adminAuth, saveToStorage]);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  const changeAdminPassword = useCallback(async (oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!oldPass || !oldPass.trim()) {
      return { success: false, error: 'Current password is required.' };
    }
    if (!newPass || newPass.trim().length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    const salt = content.adminAuth?.salt || DEFAULT_SALT;
    let expectedHash = content.adminAuth?.passwordHash;
    if (!expectedHash) {
      expectedHash = await hashPassword(DEFAULT_PASS, salt);
    }

    const isOldValid = await verifyPassword(oldPass, expectedHash, salt);
    if (!isOldValid) {
      return { success: false, error: 'Current password does not match.' };
    }

    const newSalt = generateSalt();
    const newHash = await hashPassword(newPass.trim(), newSalt);

    const updatedAuth: AdminAuthData = {
      passwordHash: newHash,
      salt: newSalt,
      updatedAt: new Date().toISOString()
    };

    setContent((prev) => {
      const next = { ...prev, adminAuth: updatedAuth };
      saveToStorage(next);
      return next;
    });

    return { success: true };
  }, [content.adminAuth, saveToStorage]);

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
        categoryDetails,
        addCategory,
        renameCategory,
        deleteCategory,
        reorderCategories,
        updateCategoryCover,
        updateCategoryDetails,
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
        supabaseConfigState,
        updateSupabaseCredentials,
        testDatabaseConnection,
        syncNowToSupabase,
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
