import type { MetadataRoute } from "next";

const site =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://ononno-two.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register"],
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
