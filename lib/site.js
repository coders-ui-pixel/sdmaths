"use strict";
exports.__esModule = true;
exports.SITE_URL = exports.SITE_NAME = void 0;
exports.SITE_NAME = "SOM";
// Follows whatever domain the app is actually deployed on (set via NEXTAUTH_URL),
// so SEO metadata/canonical URLs are correct on a test domain too, not just prod.
exports.SITE_URL = process.env.NEXTAUTH_URL || "https://sdmaths.com";
