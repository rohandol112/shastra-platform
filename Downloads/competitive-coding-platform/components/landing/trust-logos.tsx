"use client"

const companies = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Stripe", "Uber"]

export function TrustLogos() {
  return (
    <section className="border-y border-border/30 bg-card/20 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Trusted by engineers at leading tech companies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {companies.map((company) => (
            <div
              key={company}
              className="text-base font-semibold text-muted-foreground/40 transition-colors hover:text-muted-foreground"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
