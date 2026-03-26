import { useEffect } from "react";

interface PageSEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
}

const BASE_URL = "https://propatihub.lovable.app";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

const PageSEO = ({ title, description, canonical, ogType = "website", ogImage }: PageSEOProps) => {
  useEffect(() => {
    const fullTitle = title.includes("PropatiHub") ? title : `${title} | PropatiHub`;
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const pageUrl = canonical ? `${BASE_URL}${canonical}` : `${BASE_URL}${window.location.pathname}`;
    const imageUrl = ogImage || DEFAULT_OG_IMAGE;

    // Standard meta
    setMeta("name", "description", description);

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:url", pageUrl);
    setMeta("property", "og:image", imageUrl);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:site_name", "PropatiHub");
    setMeta("property", "og:locale", "en_NG");

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", imageUrl);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", pageUrl);

    return () => {
      document.title = "PropatiHub — Buy, Rent & Manage Properties in Nigeria";
    };
  }, [title, description, canonical, ogType, ogImage]);

  return null;
};

export default PageSEO;
