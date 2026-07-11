"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuthStore, isAdminRole } from "@/lib/stores/auth-store"

/** Wrap admin pages: redirects guests to /login and non-admins to /dashboard. */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const hydrated = useAuthStore((s) => s.hydrated)
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  const allowed = hydrated && token && isAdminRole(user)

  useEffect(() => {
    if (!hydrated) return
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname ?? "/admin")}`)
    } else if (!isAdminRole(user)) {
      router.replace("/dashboard")
    }
  }, [hydrated, token, user, router, pathname])

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
