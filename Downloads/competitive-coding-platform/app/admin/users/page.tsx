"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AdminGuard } from "@/components/admin-guard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, MoreVertical, Shield, Ban, Users, TrendingUp, AlertTriangle, CheckCircle2, Trash2, Loader2, KeyRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { adminApi, ApiError, displayName, type AdminUser } from "@/lib/api"
import { useAuthStore } from "@/lib/stores/auth-store"

type DialogAction = "deactivate" | "activate" | "promote" | "demote" | "delete" | "reset_password" | null

export default function AdminUsersPageWrapper() {
  return (
    <AdminGuard>
      <AdminUsersPage />
    </AdminGuard>
  )
}

function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user)
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [actionDialog, setActionDialog] = useState<{ type: DialogAction; user: AdminUser | null }>({
    type: null,
    user: null,
  })
  const [newPassword, setNewPassword] = useState("")

  const loadUsers = async (searchTerm = search) => {
    setLoading(true)
    try {
      const data = await adminApi.users({ limit: 100, search: searchTerm || undefined })
      setUsers(data.users)
      setTotal(data.pagination?.total ?? data.total ?? data.users.length)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced server-side search
  useEffect(() => {
    const t = setTimeout(() => loadUsers(search), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const adminCount = users.filter((u) => u.role === "ADMIN" || u.role === "MODERATOR").length
  const activeCount = users.filter((u) => u.isActive).length

  const closeDialog = () => {
    setActionDialog({ type: null, user: null })
    setNewPassword("")
  }

  const performAction = async () => {
    const { type, user } = actionDialog
    if (!type || !user) return
    setBusy(true)
    try {
      if (type === "deactivate") {
        await adminApi.deactivateUser(user.id)
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: false } : u)))
        toast.success(`${user.username} deactivated`)
      } else if (type === "activate") {
        await adminApi.activateUser(user.id)
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: true } : u)))
        toast.success(`${user.username} activated`)
      } else if (type === "promote") {
        await adminApi.updateUserRole(user.id, "ADMIN")
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: "ADMIN" } : u)))
        toast.success(`${user.username} promoted to admin`)
      } else if (type === "demote") {
        await adminApi.updateUserRole(user.id, "USER")
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: "USER" } : u)))
        toast.success(`${user.username} demoted to user`)
      } else if (type === "delete") {
        await adminApi.deleteUser(user.id)
        setUsers((prev) => prev.filter((u) => u.id !== user.id))
        toast.success(`${user.username} deleted`)
      } else if (type === "reset_password") {
        if (!newPassword || newPassword.length < 6) {
          toast.error("Password must be at least 6 characters")
          setBusy(false)
          return
        }
        await adminApi.resetPassword(user.id, newPassword)
        toast.success(`Password reset for ${user.username}`)
      }
      closeDialog()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Action failed")
    } finally {
      setBusy(false)
    }
  }

  const dialogCopy: Record<Exclude<DialogAction, null>, { title: string; description: (u: AdminUser) => string; cta: string; destructive?: boolean }> = {
    deactivate: {
      title: "Deactivate User",
      description: (u) => `${u.username} will no longer be able to sign in. You can reactivate them later.`,
      cta: "Deactivate",
      destructive: true,
    },
    activate: {
      title: "Activate User",
      description: (u) => `${u.username} will regain access to the platform.`,
      cta: "Activate",
    },
    promote: {
      title: "Promote to Admin",
      description: (u) => `${u.username} will gain full access to the admin dashboard.`,
      cta: "Promote",
    },
    demote: {
      title: "Demote to User",
      description: (u) => `${u.username} will lose admin access.`,
      cta: "Demote",
      destructive: true,
    },
    delete: {
      title: "Delete User",
      description: (u) => `This permanently deletes ${u.username} and all their submissions. This cannot be undone.`,
      cta: "Delete Permanently",
      destructive: true,
    },
    reset_password: {
      title: "Reset Password",
      description: (u) => `Enter a new password for ${u.username}. They can use this to sign in immediately.`,
      cta: "Reset Password",
    },
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
            <p className="mt-2 text-muted-foreground">Manage platform users, roles, and permissions</p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <StatCard icon={Users} iconClass="bg-primary/10 text-primary" value={total} label="Total Users" />
            <StatCard icon={Shield} iconClass="bg-emerald-500/10 text-emerald-500" value={adminCount} label="Admins & Moderators" />
            <StatCard icon={TrendingUp} iconClass="bg-amber-500/10 text-amber-500" value={activeCount} label="Active Accounts" />
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, username, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 border-border/50 bg-card/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-card/50">
                      <Th>User</Th>
                      <Th>Email</Th>
                      <Th>Role</Th>
                      <Th>Status</Th>
                      <Th>Activity</Th>
                      <Th>Joined</Th>
                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {users.map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-card/50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{displayName(user)}</p>
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-muted-foreground">{user.email ?? "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <Badge
                            className={cn(
                              "border font-medium",
                              user.role === "ADMIN"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : user.role === "MODERATOR"
                                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                                  : "border-slate-500/30 bg-slate-500/10 text-slate-400",
                            )}
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <Badge
                            className={cn(
                              "border font-medium",
                              user.isActive
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-red-500/30 bg-red-500/10 text-red-400",
                            )}
                          >
                            {user.isActive ? "Active" : "Deactivated"}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-foreground">{user.submissionCount ?? 0} submissions</p>
                            <p className="text-muted-foreground">{user.contestCount ?? 0} contests</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {user.id !== currentUser?.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                {user.role === "USER" ? (
                                  <DropdownMenuItem onClick={() => setActionDialog({ type: "promote", user })}>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Promote to Admin
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => setActionDialog({ type: "demote", user })}>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Demote to User
                                  </DropdownMenuItem>
                                )}
                                {user.isActive ? (
                                  <DropdownMenuItem onClick={() => setActionDialog({ type: "deactivate", user })}>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => setActionDialog({ type: "activate", user })}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setActionDialog({ type: "reset_password", user })}
                                >
                                  <KeyRound className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-400 focus:text-red-400"
                                  onClick={() => setActionDialog({ type: "delete", user })}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.type !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="border-border/50 bg-card">
          {actionDialog.type && actionDialog.user && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      dialogCopy[actionDialog.type].destructive ? "bg-red-500/10" : "bg-emerald-500/10",
                    )}
                  >
                    {dialogCopy[actionDialog.type].destructive ? (
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    ) : (
                      <Shield className="h-5 w-5 text-emerald-400" />
                    )}
                  </div>
                  <DialogTitle className="text-foreground">{dialogCopy[actionDialog.type].title}</DialogTitle>
                </div>
                <DialogDescription className="pt-2">
                  {dialogCopy[actionDialog.type].description(actionDialog.user)}
                </DialogDescription>
              </DialogHeader>
              {actionDialog.type === "reset_password" && (
                <div className="py-4">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="mt-1"
                  />
                </div>
              )}
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={closeDialog} disabled={busy}>
                  Cancel
                </Button>
                <Button
                  variant={dialogCopy[actionDialog.type].destructive ? "destructive" : "default"}
                  onClick={performAction}
                  disabled={busy}
                >
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {dialogCopy[actionDialog.type].cta}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({
  icon: Icon,
  iconClass,
  value,
  label,
}: {
  icon: any
  iconClass: string
  value: number
  label: string
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-5">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  )
}
