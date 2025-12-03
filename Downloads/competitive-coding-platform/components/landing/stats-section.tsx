"use client"

import { useEffect, useState, useRef } from "react"

const stats = [
  { value: 50000, suffix: "+", label: "Active Developers", sublabel: "Community" },
  { value: 2500, suffix: "+", label: "Coding Problems", sublabel: "Library" },
  { value: 500, suffix: "+", label: "Contests Hosted", sublabel: "Events" },
  { value: 99.9, suffix: "%", label: "Uptime", sublabel: "Reliability" },
]

function useCountUp(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return

    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [end, duration, start])

  return count
}

export function StatsSection() {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="stats" className="relative overflow-hidden bg-background py-24 lg:py-32">
      {/* Background sphere effect like Juspay */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-[600px] w-[600px]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl" />
          <div className="absolute inset-20 rounded-full border border-border/20" />
          <div className="absolute inset-32 rounded-full border border-border/10" />
        </div>
      </div>

      <div ref={ref} className="relative mx-auto max-w-6xl px-4">
        <p className="mb-16 text-center text-sm font-semibold uppercase tracking-wider text-secondary">By the Numbers</p>

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} inView={inView} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatCard({
  stat,
  inView,
  delay,
}: {
  stat: (typeof stats)[0]
  inView: boolean
  delay: number
}) {
  const count = useCountUp(stat.value, 2000 + delay, inView)

  return (
    <div className="text-center">
      <div className="mb-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
        {stat.value % 1 !== 0 ? count.toFixed(1) : count.toLocaleString()}
        <span className="text-secondary">{stat.suffix}</span>
      </div>
      <div className="text-sm font-medium text-foreground">{stat.label}</div>
      <div className="text-xs text-secondary">{stat.sublabel}</div>
    </div>
  )
}
