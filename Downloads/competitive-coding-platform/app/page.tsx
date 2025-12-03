import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { TrustLogos } from "@/components/landing/trust-logos"
import { FeaturesSection as ContactSection } from "@/components/landing/features-section"
import { FAQSection } from "@/components/landing/faq-section"
import { CTASection } from "@/components/landing/cta-section"

// JSON-LD Structured Data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SHASTRA",
  description:
    "SHASTRA is the ultimate competitive coding platform. Practice algorithm problems, compete in live contests, and prepare for technical interviews.",
  url: "https://shastra.dev",
  applicationCategory: "Education",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "2500",
  },
  creator: {
    "@type": "Organization",
    name: "SHASTRA",
    url: "https://shastra.dev",
  },
}

export default function LandingPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main id="main-content" className="flex-1">
          <HeroSection />
          <TrustLogos />
          <ContactSection />
          <FAQSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  )
}
