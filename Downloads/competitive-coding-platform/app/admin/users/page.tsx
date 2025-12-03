"use client"

import { useState } from "react"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { mockUser, mockUsers, type User } from "@/lib/mock-data"
import { Search, MoreVertical, Shield, Ban, UserCog, Users, TrendingUp, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminUsersPage() {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState(mockUsers)
  const [actionDialog, setActionDialog] = useState<{
    type: "ban" | "promote" | null
    user: User | null
  }>({ type: null, user: null })

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.fullName.toLowerCase().includes(search.toLowerCase()),
  )

  const adminCount = users.filter((u) => u.role === "ADMIN").length
  const candidateCount = users.filter((u) => u.role === "CANDIDATE").length

  const handleBanUser = (user: User) => {
    setUsers((prev) => prev.filter((u) => u.id !== user.id))
    setActionDialog({ type: null, user: null })
  }

  const handlePromoteUser = (user: User) => {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: "ADMIN" as const } : u)))
    setActionDialog({ type: null, user: null })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={mockUser} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
            <p className="mt-2 text-muted-foreground">Manage platform users, roles, and permissions</p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Shield className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{adminCount}</p>
                  <p className="text-sm text-muted-foreground">Administrators</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{candidateCount}</p>
                  <p className="text-sm text-muted-foreground">Candidates</p>
                </div>
              </div>
            </div>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-card/50">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      User
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Role
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Stats
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Joined
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-card/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          className={cn(
                            "border font-medium",
                            user.role === "ADMIN"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border-slate-500/30 bg-slate-500/10 text-slate-400",
                          )}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-foreground">{user.stats.problemsSolved} solved</p>
                          <p className="text-muted-foreground">Rating: {user.stats.rating}</p>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                              <UserCog className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {user.role === "CANDIDATE" && (
                              <DropdownMenuItem onClick={() => setActionDialog({ type: "promote", user })}>
                                <Shield className="mr-2 h-4 w-4" />
                                Promote to Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-400 focus:text-red-400"
                              onClick={() => setActionDialog({ type: "ban", user })}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Ban User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.type !== null}
        onOpenChange={(open) => !open && setActionDialog({ type: null, user: null })}
      >
        <DialogContent className="border-border/50 bg-card">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  actionDialog.type === "ban" ? "bg-red-500/10" : "bg-emerald-500/10",
                )}
              >
                {actionDialog.type === "ban" ? (
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                ) : (
                  <Shield className="h-5 w-5 text-emerald-400" />
                )}
              </div>
              <DialogTitle className="text-foreground">
                {actionDialog.type === "ban" ? "Ban User" : "Promote User"}
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {actionDialog.type === "ban"
                ? `Are you sure you want to ban ${actionDialog.user?.username}? This action cannot be undone and will remove their access to the platform.`
                : `Are you sure you want to promote ${actionDialog.user?.username} to Administrator? They will gain access to admin features.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setActionDialog({ type: null, user: null })}>
              Cancel
            </Button>
            <Button
              variant={actionDialog.type === "ban" ? "destructive" : "default"}
              onClick={() =>
                actionDialog.type === "ban" && actionDialog.user
                  ? handleBanUser(actionDialog.user)
                  : actionDialog.user && handlePromoteUser(actionDialog.user)
              }
            >
              {actionDialog.type === "ban" ? "Ban User" : "Promote to Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
