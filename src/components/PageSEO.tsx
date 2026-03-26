import { useEffect } from "react";

interface PageSEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
}

const BASE_URL = "https://propatihub.lovable.app";

const PageSEO = ({ title, description, canonical, ogType = "website" }: PageSEOProps) => {
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

    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);

    // Canonical
    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonicalUrl);
    }

    return () => {
      // Reset on unmount
      document.title = "PropatiHub — Buy, Rent & Manage Properties in Nigeria";
    };
  }, [title, description, canonical, ogType]);

  return null;
};

export default PageSEO;
