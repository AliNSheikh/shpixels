import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large base64 image uploads pushed directly to codebase
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes FIRST
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  const contentFilePath = path.join(process.cwd(), "src", "data", "content.json");
  const publicContentFilePath = path.join(process.cwd(), "public", "content.json");

  // In-memory cache for ultra-fast synchronization
  let inMemoryContent: any = null;
  let serverVersion = 1;
  let lastPublishedAt = new Date().toISOString();

  // Initialize in-memory cache from disk
  try {
    if (fs.existsSync(contentFilePath)) {
      const raw = fs.readFileSync(contentFilePath, "utf-8");
      inMemoryContent = JSON.parse(raw);
      if (inMemoryContent?.publicationInfo?.version) {
        serverVersion = inMemoryContent.publicationInfo.version;
      }
      if (inMemoryContent?.lastPublished) {
        lastPublishedAt = inMemoryContent.lastPublished;
      }
    }
  } catch (initErr) {
    console.warn("[CMS] Notice initializing cache:", initErr);
  }

  // Helper to set aggressive no-cache headers so all visitors see updates immediately
  const setNoCacheHeaders = (res: express.Response) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
  };

  // Lightweight version check for real-time visitor synchronization
  app.get("/api/content-version", (_req, res) => {
    setNoCacheHeaders(res);
    return res.json({
      version: serverVersion,
      lastPublished: lastPublishedAt,
      serverTime: new Date().toISOString()
    });
  });

  // Read content saved in codebase
  app.get("/api/content", async (_req, res) => {
    setNoCacheHeaders(res);
    try {
      if (inMemoryContent) {
        return res.json(inMemoryContent);
      }
      if (fs.existsSync(contentFilePath)) {
        const raw = await fs.promises.readFile(contentFilePath, "utf-8");
        inMemoryContent = JSON.parse(raw);
        return res.json(inMemoryContent);
      }
      return res.json({ status: "not_found" });
    } catch (err: any) {
      console.error("[CMS] Error reading content:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Central publisher function
  const handlePublishContent = async (req: express.Request, res: express.Response) => {
    try {
      const data = req.body;
      if (!data || typeof data !== "object") {
        return res.status(400).json({ success: false, error: "Invalid content payload" });
      }

      const publishedAt = new Date().toISOString();
      serverVersion += 1;
      lastPublishedAt = publishedAt;

      // Construct publication metadata
      const publicationRecord = {
        id: `pub-${Date.now()}`,
        publishedAt,
        version: serverVersion,
        publishedBy: data.publicationInfo?.publishedBy || "Admin",
        note: req.body.note || "Site published directly to server"
      };

      const existingHistory = Array.isArray(data.publicationHistory) 
        ? data.publicationHistory 
        : (inMemoryContent?.publicationHistory || []);

      const updatedHistory = [publicationRecord, ...existingHistory].slice(0, 20);

      // Mutate payload with official server timestamp and version
      const finalPayload = {
        ...data,
        lastPublished: publishedAt,
        publicationInfo: {
          publishedAt,
          version: serverVersion,
          publishedBy: publicationRecord.publishedBy
        },
        publicationHistory: updatedHistory
      };

      inMemoryContent = finalPayload;
      const jsonStr = JSON.stringify(finalPayload, null, 2);

      // Ensure target folders exist
      await fs.promises.mkdir(path.dirname(contentFilePath), { recursive: true });
      await fs.promises.mkdir(path.dirname(publicContentFilePath), { recursive: true });

      // Save directly to the codebase on server disk
      await fs.promises.writeFile(contentFilePath, jsonStr, "utf-8");
      await fs.promises.writeFile(publicContentFilePath, jsonStr, "utf-8");

      console.log(`[CMS] Published version ${serverVersion} at ${publishedAt} to ${contentFilePath}`);

      setNoCacheHeaders(res);
      return res.json({ 
        success: true, 
        message: "Site successfully saved and published on server",
        publishedAt,
        version: serverVersion,
        data: finalPayload
      });
    } catch (err: any) {
      console.error("[CMS] Error writing to codebase:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  };

  // Dedicated "Save Site" / Publish endpoint
  app.post("/api/publish-site", handlePublishContent);

  // Backward-compatible save endpoint
  app.post("/api/save-content", handlePublishContent);

  // Dynamic Sitemap XML Endpoint for Google Search Console & archiving
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      let contentData: any = null;
      if (fs.existsSync(contentFilePath)) {
        const raw = await fs.promises.readFile(contentFilePath, "utf-8");
        contentData = JSON.parse(raw);
      }

      const baseUrl = (contentData?.seo?.canonicalUrl || "https://shpixels.vercel.app").replace(/\/$/, "");
      const now = new Date().toISOString().split("T")[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#portfolio</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#showreel</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#about</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#services</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#process</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/#gallery</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/#contact</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

      if (contentData?.projects && Array.isArray(contentData.projects)) {
        for (const p of contentData.projects) {
          if (p.published) {
            xml += `
  <url>
    <loc>${baseUrl}/#project-${p.id}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.featured ? "0.8" : "0.6"}</priority>
  </url>`;
          }
        }
      }

      xml += `\n</urlset>`;
      res.header("Content-Type", "application/xml");
      return res.send(xml);
    } catch (e: any) {
      console.error("[Sitemap] Error generating sitemap.xml:", e);
      return res.status(500).send("Error generating sitemap");
    }
  });

  // Dynamic robots.txt
  app.get("/robots.txt", async (_req, res) => {
    let baseUrl = "https://shpixels.vercel.app";
    if (fs.existsSync(contentFilePath)) {
      try {
        const raw = await fs.promises.readFile(contentFilePath, "utf-8");
        const c = JSON.parse(raw);
        if (c?.seo?.canonicalUrl) baseUrl = c.seo.canonicalUrl.replace(/\/$/, "");
      } catch {
        // ignore
      }
    }
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
