import { Navbar } from "@/components/ui/navbar"
import { Badge } from "@/components/ui/badge"
import { mockUser, mockUsers, mockProblems, mockContests, mockPlagiarismReports } from "@/lib/mock-data"
import {
  Users,
  Code2,
  Trophy,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const stats = [
    {
      label: "Total Users",
      value: mockUsers.length,
      icon: Users,
      trend: "+12%",
      trendUp: true,
      gradient: "from-primary/20 to-primary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Problems",
      value: mockProblems.length,
      icon: Code2,
      trend: "+5",
      trendUp: true,
      gradient: "from-success/20 to-success/5",
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      label: "Active Contests",
      value: mockContests.filter((c) => c.status === "RUNNING").length,
      icon: Trophy,
      trend: "Live",
      trendUp: true,
      gradient: "from-warning/20 to-warning/5",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    {
      label: "Pending Reviews",
      value: mockPlagiarismReports.filter((r) => r.status === "PENDING").length,
      icon: Shield,
      trend: "Action needed",
      trendUp: false,
      gradient: "from-destructive/20 to-destructive/5",
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
    },
  ]

  const recentActivity = [
    { type: "user", message: "New user registered: sarah_codes", time: "2 minutes ago", icon: Users },
    { type: "submission", message: "156 submissions in the last hour", time: "5 minutes ago", icon: TrendingUp },
    { type: "contest", message: "Weekly Contest 375 registration opened", time: "1 hour ago", icon: Trophy },
    { type: "plagiarism", message: "2 new plagiarism reports detected", time: "3 hours ago", icon: Shield },
  ]

  const systemHealth = [
    { name: "API Server", status: "healthy", latency: "12ms" },
    { name: "Judge Service", status: "healthy", latency: "45ms" },
    { name: "Database", status: "healthy", latency: "8ms" },
    { name: "Cache Layer", status: "warning", latency: "125ms" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 lg:px-6 lg:pt-28">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Platform overview and system health monitoring</p>
        </div>

        {/* Stats Grid */}
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
                    <Badge
                      variant="outline"
                      className={
                        stat.trendUp
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-warning/30 bg-warning/10 text-warning"
                      }
                    >
                      {stat.trend}
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

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
                  <p className="text-sm text-muted-foreground">Real-time service status</p>
                </div>
              </div>
              <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                All Systems Operational
              </Badge>
            </div>

            <div className="space-y-3">
              {systemHealth.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${service.status === "healthy" ? "bg-success" : "bg-warning"}`}
                    />
                    <span className="font-medium text-foreground">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{service.latency}</span>
                    <Badge
                      variant="outline"
                      className={
                        service.status === "healthy"
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-warning/30 bg-warning/10 text-warning"
                      }
                    >
                      {service.status === "healthy" ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <AlertTriangle className="mr-1 h-3 w-3" />
                      )}
                      {service.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Recent Activity</h3>
                <p className="text-sm text-muted-foreground">Latest platform events</p>
              </div>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-xl border border-border/50 bg-background/50 p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Manage Users", href: "/admin/users", icon: Users },
            { label: "Problem CMS", href: "/admin/problems", icon: Code2 },
            { label: "Contests", href: "/admin/contests", icon: Trophy },
            { label: "Plagiarism Center", href: "/admin/plagiarism", icon: Shield },
          ].map((action) => {
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
