"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-28">
      {/* Background gradient */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-full max-w-2xl">
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-primary/15 via-secondary/10 to-transparent blur-3xl" />
        </div>
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2">
          <Zap className="h-4 w-4 text-secondary" />
          <span className="text-sm font-medium text-secondary">Free to get started</span>
        </div>

        <h2 className="mb-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Ready to level up?
        </h2>

        <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
          Join thousands of developers improving their algorithmic thinking and competing in real-time contests.
          Start your journey with SHASTRA today.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button
              size="lg"
              className="h-12 rounded-full bg-secondary px-8 text-base font-semibold text-secondary-foreground shadow-lg shadow-secondary/25 hover:bg-secondary/85 hover:shadow-xl hover:shadow-secondary/30 active:scale-[0.98] transition-all duration-200"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="#contact">
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-full border-border/60 bg-card/50 px-8 text-base font-medium hover:bg-card hover:border-primary/40 active:scale-[0.98] transition-all duration-200"
            >
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
