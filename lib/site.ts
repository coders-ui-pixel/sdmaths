export const SITE_NAME = "SOM"
// Follows whatever domain the app is actually deployed on (set via NEXTAUTH_URL),
// so SEO metadata/canonical URLs are correct on a test domain too, not just prod.
export const SITE_URL = process.env.NEXTAUTH_URL || "https://sdmaths.com"
