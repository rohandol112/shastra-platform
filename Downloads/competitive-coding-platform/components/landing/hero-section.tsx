"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Terminal, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-[100px] animate-pulse" />

      <div className="relative mx-auto max-w-6xl px-4 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div
            className={`mb-8 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Sparkles className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-foreground/80 italic">&quot;Caliber isn&apos;t claimed; it&apos;s conquered.&quot;</span>
          </div>

          {/* Main heading */}
          <h1
            className={`mb-6 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <span className="block">Master Algorithms.</span>
            <span className="block mt-2">
              Win <span className="text-gradient-shastra">Competitions.</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`mb-10 max-w-2xl text-base text-muted-foreground sm:text-lg transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            Join thousands of developers sharpening their skills on a platform built for speed, precision, and fair
            competition. No fluff, just code.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col gap-4 sm:flex-row sm:gap-3 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 rounded-full bg-secondary px-8 text-base font-semibold text-secondary-foreground shadow-lg shadow-secondary/25 hover:bg-secondary/85 hover:shadow-xl hover:shadow-secondary/30 active:scale-[0.98] transition-all duration-200"
              >
                Start Coding Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-border/60 bg-card/50 px-8 text-base font-medium hover:bg-card hover:border-primary/40 active:scale-[0.98] transition-all duration-200"
              >
                <Play className="mr-2 h-4 w-4" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>

        {/* Code Preview Card */}
        <div
          className={`mx-auto mt-16 max-w-4xl transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-xl opacity-60" />

            {/* Main card */}
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
              {/* Window header */}
              <div className="flex items-center justify-between border-b border-border/50 bg-background/80 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>two-sum.py</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-green-400 font-medium">Accepted</span>
                  <span className="text-muted-foreground">Runtime: 4ms</span>
                </div>
              </div>

              {/* Code content */}
              <div className="flex">
                {/* Line numbers */}
                <div className="border-r border-border/30 bg-background/50 px-4 py-5 text-right font-mono text-sm text-muted-foreground/40 select-none">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <div key={n} className="leading-7">{n}</div>
                  ))}
                </div>

                {/* Code */}
                <div className="flex-1 overflow-x-auto p-5 font-mono text-sm">
                  <pre className="leading-7">
                    <code>
                      <span className="text-primary">def</span> <span className="text-green-400">two_sum</span>
                      <span className="text-foreground">(nums, target):</span>
                      {"\n"}
                      {"    "}
                      <span className="text-muted-foreground">{"# Hash map for O(n) lookup"}</span>
                      {"\n"}
                      {"    "}seen = {"{}"}
                      {"\n\n"}
                      {"    "}
                      <span className="text-primary">for</span>
                      <span className="text-foreground"> i, num </span>
                      <span className="text-primary">in</span>
                      <span className="text-secondary"> enumerate</span>
                      <span className="text-foreground">(nums):</span>
                      {"\n"}
                      {"        "}complement = target - num{"\n"}
                      {"        "}
                      <span className="text-primary">if</span>
                      <span className="text-foreground"> complement </span>
                      <span className="text-primary">in</span>
                      <span className="text-foreground"> seen:</span>
                      {"\n"}
                      {"            "}
                      <span className="text-primary">return</span>
                      <span className="text-foreground"> [seen[complement], i]</span>
                      {"\n"}
                      {"        "}seen[num] = i
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
