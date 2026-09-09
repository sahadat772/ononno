import type { MetadataRoute } from "next";

const site =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://ononno-two.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/login", changeFrequency: "monthly", priority: 0.6 },
    { path: "/register", changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/free-access", changeFrequency: "weekly", priority: 0.7 },
  ];

  return paths.map(({ path, changeFrequency, priority }) => ({
    url: `${site}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
