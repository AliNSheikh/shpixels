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

  // Read content saved in codebase
  app.get("/api/content", async (_req, res) => {
    try {
      if (fs.existsSync(contentFilePath)) {
        const raw = await fs.promises.readFile(contentFilePath, "utf-8");
        return res.json(JSON.parse(raw));
      }
      return res.json({ status: "not_found" });
    } catch (err: any) {
      console.error("[CMS] Error reading content:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Real-time update endpoint: Pushes data directly to the codebase!
  app.post("/api/save-content", async (req, res) => {
    try {
      const data = req.body;
      if (!data || typeof data !== "object") {
        return res.status(400).json({ success: false, error: "Invalid content payload" });
      }

      const jsonStr = JSON.stringify(data, null, 2);

      // Ensure target folders exist
      await fs.promises.mkdir(path.dirname(contentFilePath), { recursive: true });
      await fs.promises.mkdir(path.dirname(publicContentFilePath), { recursive: true });

      // Save directly to the codebase
      await fs.promises.writeFile(contentFilePath, jsonStr, "utf-8");
      await fs.promises.writeFile(publicContentFilePath, jsonStr, "utf-8");

      console.log(`[CMS] Successfully pushed data directly to codebase: ${contentFilePath}`);
      return res.json({ 
        success: true, 
        message: "Content pushed directly to codebase",
        timestamp: new Date().toISOString() 
      });
    } catch (err: any) {
      console.error("[CMS] Error writing to codebase:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Dynamic Sitemap XML Endpoint for Google Search Console & archiving
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      let contentData: any = null;
      if (fs.existsSync(contentFilePath)) {
        const raw = await fs.promises.readFile(contentFilePath, "utf-8");
        contentData = JSON.parse(raw);
      }

      const baseUrl = (contentData?.seo?.canonicalUrl || "https://mografix.com").replace(/\/$/, "");
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
    let baseUrl = "https://mografix.com";
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
