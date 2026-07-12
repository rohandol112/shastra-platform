"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { Badge } from "@/components/ui/badge"
import { StaffGuard } from "@/components/admin-guard"
import {
  Users,
  Code2,
  Trophy,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  FileCode2,
  Loader2,
  Building2,
} from "lucide-react"
import { adminApi, API_ORIGIN, type AdminAnalytics } from "@/lib/api"
import { useAuthStore } from "@/lib/stores/auth-store"

export default function AdminDashboardPage() {
  return (
    <StaffGuard>
      <AdminDashboard />
    </StaffGuard>
  )
}

function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const hydrated = useAuthStore((s) => s.hydrated)
  const user = useAuthStore((s) => s.user)
  const isSuperAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR"
  const [error, setError] = useState<string | null>(null)
  const [health, setHealth] = useState<{ api: boolean | null; db: boolean | null }>({ api: null, db: null })

  useEffect(() => {
    if (isSuperAdmin) {
      adminApi
        .analytics()
        .then(setAnalytics)
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load analytics"))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }

    // Health checks against the backend
    fetch(`${API_ORIGIN}/health`)
      .then((r) => setHealth((h) => ({ ...h, api: r.ok })))
      .catch(() => setHealth((h) => ({ ...h, api: false })))
    fetch(`${API_ORIGIN}/health/ready`)
      .then((r) => setHealth((h) => ({ ...h, db: r.ok })))
      .catch(() => setHealth((h) => ({ ...h, db: false })))
  }, [])

  const stats = analytics
    ? [
        {
          label: "Total Users",
          value: analytics.users.total,
          sub: `${analytics.users.active} active`,
          icon: Users,
          gradient: "from-primary/20 to-primary/5",
          iconBg: "bg-primary/10",
          iconColor: "text-primary",
        },
        {
          label: "Problems",
          value: analytics.problems.total,
          sub: `${analytics.problems.published} published`,
          icon: Code2,
          gradient: "from-success/20 to-success/5",
          iconBg: "bg-success/10",
          iconColor: "text-success",
        },
        {
          label: "Contests",
          value: analytics.contests.total,
          sub: `${analytics.contests.active} active`,
          icon: Trophy,
          gradient: "from-warning/20 to-warning/5",
          iconBg: "bg-warning/10",
          iconColor: "text-warning",
        },
        {
          label: "Submissions",
          value: analytics.submissions.total,
          sub: `${analytics.submissions.today} today`,
          icon: FileCode2,
          gradient: "from-destructive/20 to-destructive/5",
          iconBg: "bg-destructive/10",
          iconColor: "text-destructive",
        },
      ]
    : []

  const services = [
    { name: "API Server", status: health.api },
    { name: "Database", status: health.db },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 lg:px-6 lg:pt-28">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isSuperAdmin
              ? "Admin Dashboard"
              : user?.role === "COLLEGE_ADMIN"
                ? `Welcome ${user.collegeName || "College Admin"}`
                : user?.role === "TEACHER"
                  ? `Welcome ${user.firstName || user.username} ${user.gender?.toLowerCase() === "female" ? "Ma'am" : "Sir"}`
                  : "College Dashboard"}
          </h1>
          <p className="mt-2 text-muted-foreground">Platform overview and system health monitoring</p>
        </div>

        {isSuperAdmin && loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-foreground">Couldn't load analytics</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : (isSuperAdmin ? (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 transition-all hover:border-border hover:bg-card"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg}`}>
                        <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                      </div>
                      <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                        {stat.sub}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null)}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* System Health */}
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">System Health</h3>
                  <p className="text-sm text-muted-foreground">Live backend status</p>
                </div>
              </div>
              {health.api && health.db && (
                <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                  All Systems Operational
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        service.status === null ? "bg-muted" : service.status ? "bg-success" : "bg-destructive"
                      }`}
                    />
                    <span className="font-medium text-foreground">{service.name}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      service.status === null
                        ? "border-border/50 bg-muted/20 text-muted-foreground"
                        : service.status
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                    }
                  >
                    {service.status === null ? (
                      "checking…"
                    ) : service.status ? (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        healthy
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        unreachable
                      </>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Recent Signups</h3>
                <p className="text-sm text-muted-foreground">Latest users on the platform</p>
              </div>
            </div>

            <div className="space-y-3">
              {(analytics?.recentUsers ?? []).slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-start gap-4 rounded-xl border border-border/50 bg-background/50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-foreground">@{u.username}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {analytics && analytics.recentUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">No users yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Popular problems */}
        {analytics && analytics.popularProblems.length > 0 && (
          <div className="mt-8 rounded-2xl border border-border/50 bg-card/50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Popular Problems</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {analytics.popularProblems.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  href={`/problems/${p.slug}`}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-4 transition-colors hover:bg-card"
                >
                  <span className="truncate font-medium text-foreground">{p.title}</span>
                  <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                    {p.submissionCount} subs
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Manage Users", href: "/admin/users", icon: Users, adminOnly: true },
            { label: "Manage Colleges", href: "/admin/colleges", icon: Building2, adminOnly: true },
            { label: "Manage Students", href: "/admin/students", icon: Users },
            { label: "Problem CMS", href: "/admin/problems", icon: Code2 },
            { label: "Contests", href: "/admin/contests", icon: Trophy },
            { label: "Submissions", href: "/admin/submissions", icon: FileCode2 },
            { label: "Plagiarism Center", href: "/admin/plagiarism", icon: AlertTriangle },
          ]
          .filter((action) => !action.adminOnly || isSuperAdmin)
          .map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-4 transition-all hover:border-primary/30 hover:bg-card"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{action.label}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
