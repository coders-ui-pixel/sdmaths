import { SITE_NAME, SITE_URL } from "./site"

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": `${SITE_URL}/favicon.ico`,
    "sameAs": [],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kathmandu",
      "addressRegion": "Bagmati Province",
      "addressCountry": "NP"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Nepal"
    }
  }
}

export function generateCourseSchema(course: {
  title: string
  description: string
  price: number
  slug: string
  thumbnail?: string | null
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "EducationalOrganization",
      "name": SITE_NAME,
      "sameAs": SITE_URL
    },
    "offers": {
      "@type": "Offer",
      "price": course.price,
      "priceCurrency": "NPR",
      "availability": "https://schema.org/InStock",
      "category": course.price === 0 ? "Free" : "Paid"
    },
    "image": course.thumbnail || `${SITE_URL}/default-course.jpg`,
    "url": `${SITE_URL}/courses/${course.slug}`
  }
}

export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item
    }))
  }
}

export function generateFAQSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }
}
