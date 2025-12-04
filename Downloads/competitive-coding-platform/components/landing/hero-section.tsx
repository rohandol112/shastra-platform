"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

// Code templates for the moving strip
const codeTemplates = [
  {
    name: "two_sum.py",
    language: "Python",
    code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        if target - num in seen:
            return [seen[target-num], i]
        seen[num] = i`,
    status: "Accepted",
    runtime: "4ms",
  },
  {
    name: "binary_search.cpp",
    language: "C++",
    code: `int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        arr[mid] < target ? left = mid + 1 : right = mid - 1;
    }
    return -1;
}`,
    status: "Accepted",
    runtime: "2ms",
  },
  {
    name: "merge_sort.java",
    language: "Java",
    code: `void mergeSort(int[] arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`,
    status: "Accepted",
    runtime: "8ms",
  },
  {
    name: "dfs.js",
    language: "JavaScript",
    code: `function dfs(graph, node, visited = new Set()) {
    if (visited.has(node)) return;
    visited.add(node);
    console.log(node);
    for (const neighbor of graph[node]) {
        dfs(graph, neighbor, visited);
    }
}`,
    status: "Accepted",
    runtime: "5ms",
  },
  {
    name: "dp_fibonacci.rs",
    language: "Rust",
    code: `fn fibonacci(n: usize) -> u64 {
    let mut dp = vec![0u64; n + 1];
    dp[1] = 1;
    for i in 2..=n {
        dp[i] = dp[i-1] + dp[i-2];
    }
    dp[n]
}`,
    status: "Accepted",
    runtime: "1ms",
  },
  {
    name: "quick_sort.go",
    language: "Go",
    code: `func quickSort(arr []int, low, high int) {
    if low < high {
        pi := partition(arr, low, high)
        quickSort(arr, low, pi-1)
        quickSort(arr, pi+1, high)
    }
}`,
    status: "Accepted",
    runtime: "3ms",
  },
]

// Duplicate for seamless loop
const duplicatedTemplates = [...codeTemplates, ...codeTemplates]

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

      {/* Large watermark logo in background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="relative w-[800px] h-[800px] opacity-[0.03]">
          <Image
            src="/Light.png"
            alt=""
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

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

        {/* Moving Code Templates Strip */}
        <div
          className={`mt-20 transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {/* Gradient fade on edges */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            {/* Scrolling container */}
            <div className="overflow-hidden">
              <div className="flex gap-6 animate-scroll-left hover:[animation-play-state:paused]">
                {duplicatedTemplates.map((template, index) => (
                  <div
                    key={`${template.name}-${index}`}
                    className="flex-shrink-0 w-[420px] group"
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-xl transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-2xl group-hover:scale-[1.02]">
                      {/* Window header */}
                      <div className="flex items-center justify-between border-b border-border/50 bg-background/60 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-red-500/70" />
                            <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                            <div className="h-3 w-3 rounded-full bg-green-500/70" />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">{template.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-xs text-green-400 font-medium">
                            {template.status}
                          </span>
                          <span className="text-xs text-muted-foreground">{template.runtime}</span>
                        </div>
                      </div>

                      {/* Code content */}
                      <div className="p-4 font-mono text-sm leading-relaxed overflow-hidden h-[200px]">
                        <pre className="text-foreground/80">
                          <code>{template.code}</code>
                        </pre>
                      </div>

                      {/* Language badge */}
                      <div className="absolute bottom-3 right-3">
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {template.language}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Caption */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Solve problems in <span className="text-primary font-medium">Python</span>, <span className="text-primary font-medium">C++</span>, <span className="text-primary font-medium">Java</span>, <span className="text-primary font-medium">JavaScript</span>, <span className="text-primary font-medium">Rust</span>, <span className="text-primary font-medium">Go</span> and more
          </p>
        </div>
      </div>
    </section>
  )
}
