"use client"

// Company names with their official domains for fetching logos
const companies = [
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Netflix", domain: "netflix.com" },
  { name: "Stripe", domain: "stripe.com" },
  { name: "Uber", domain: "uber.com" },
  { name: "Airbnb", domain: "airbnb.com" },
  { name: "Spotify", domain: "spotify.com" },
  { name: "LinkedIn", domain: "linkedin.com" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "Razorpay", domain: "razorpay.com" },
]

// Single list to avoid any perceived duplication in the strip
const duplicatedCompanies = companies

export function TrustLogos() {
  return (
    <section className="py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4">
        {/* Large bold heading like the reference */}
        <h2 className="text-center text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-16 md:mb-20">
          Trusted by engineers at
          <br />
          <span className="text-primary">leading tech companies</span>
        </h2>
        
        {/* Scrolling logos container */}
        <div className="relative">
          {/* Gradient fades */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="overflow-hidden">
            <div className="flex items-center gap-12 md:gap-16 animate-scroll-companies hover:[animation-play-state:paused]">
              {duplicatedCompanies.map((company, index) => (
                <div
                  key={`${company.name}-${index}`}
                  className="flex shrink-0 items-center gap-4 rounded-2xl border bg-card/30 px-10 py-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-card/50"
                >
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`}
                    alt={`${company.name} logo`}
                    className="h-8 w-8"
                  />
                  <span className="text-2xl md:text-3xl font-semibold whitespace-nowrap text-foreground/90">
                    {company.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
