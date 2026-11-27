import type { MetadataRoute } from "next";

const baseUrl = "https://muaraai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/en", "/projects", "/karya", "/members", "/onboarding", "/en/join", "/en/onboarding", "/en/karya", "/en/terms", "/en/privacy", "/en/code-of-conduct", "/terms", "/privacy", "/code-of-conduct"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
