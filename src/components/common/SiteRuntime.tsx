import { useEffect } from 'react';
import { useContent } from '../../context/ContentContext';

function upsertMeta(selector: string, attributes: Record<string, string>, content: string | undefined) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!content) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function upsertLink(selector: string, rel: string, href: string | undefined) {
  let element = document.head.querySelector(selector) as HTMLLinkElement | null;

  if (!href) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }

  element.href = href;
}

function removeScript(id: string) {
  document.getElementById(id)?.remove();
}

export function SiteRuntime() {
  const { content } = useContent();

  useEffect(() => {
    const { seo, branding } = content;

    document.documentElement.style.setProperty('--site-accent', branding.accentColor || '#2563eb');
    document.title = seo.pageTitle || branding.siteName || 'SHPIXELS';

    upsertMeta('meta[name="description"]', { name: 'description' }, seo.metaDescription);
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, seo.ogTitle || seo.pageTitle);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, seo.ogDescription || seo.metaDescription);
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, seo.ogImage);
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, seo.canonicalUrl);
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, seo.ogTitle || seo.pageTitle);
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, seo.ogDescription || seo.metaDescription);
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, seo.ogImage);
    upsertMeta('meta[name="google-site-verification"]', { name: 'google-site-verification' }, seo.googleSiteVerification);

    upsertLink('link[rel="canonical"]', 'canonical', seo.canonicalUrl);
    upsertLink('link[rel="icon"]', 'icon', branding.favicon || seo.favicon);

    const gaId = (seo.googleAnalyticsId || '').trim();
    removeScript('shpixels-ga-src');
    removeScript('shpixels-ga-config');
    if (/^G-[A-Z0-9]+$/i.test(gaId)) {
      const source = document.createElement('script');
      source.id = 'shpixels-ga-src';
      source.async = true;
      source.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(source);

      const config = document.createElement('script');
      config.id = 'shpixels-ga-config';
      config.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = window.gtag || gtag;
        gtag('js', new Date());
        gtag('config', ${JSON.stringify(gaId)});
      `;
      document.head.appendChild(config);
    }

    const gtmId = (seo.googleTagManagerId || '').trim();
    removeScript('shpixels-gtm');
    if (/^GTM-[A-Z0-9]+$/i.test(gtmId)) {
      const script = document.createElement('script');
      script.id = 'shpixels-gtm';
      script.textContent = `
        (function(w,d,s,l,i){
          w[l]=w[l]||[];
          w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
          var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),
              dl=l!='dataLayer'?'&l='+l:'';
          j.async=true;
          j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
          f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer',${JSON.stringify(gtmId)});
      `;
      document.head.appendChild(script);
    }

    const pixelId = (seo.metaPixelId || '').trim();
    removeScript('shpixels-meta-pixel');
    if (/^[0-9]{5,30}$/.test(pixelId)) {
      const script = document.createElement('script');
      script.id = 'shpixels-meta-pixel';
      script.textContent = `
        !function(f,b,e,v,n,t,s){
          if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)
        }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', ${JSON.stringify(pixelId)});
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }
  }, [content.seo, content.branding]);

  return null;
}
