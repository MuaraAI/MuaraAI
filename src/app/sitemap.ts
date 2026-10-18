import type { MetadataRoute } from "next";

const baseUrl = "https://muaraai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/members", "/onboarding", "/terms", "/privacy", "/code-of-conduct"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
