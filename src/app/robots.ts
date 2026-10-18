import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard/", "/admin/", "/api/", "/membership-exit"] }],
    sitemap: "https://muaraai.com/sitemap.xml",
    host: "https://muaraai.com",
  };
}
