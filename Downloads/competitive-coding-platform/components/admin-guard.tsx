"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuthStore, isAdminRole, isStaffRole } from "@/lib/stores/auth-store"

function useGuard(allowed: boolean) {
  const router = useRouter()
  const pathname = usePathname()
  const hydrated = useAuthStore((s) => s.hydrated)
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!hydrated) return
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname ?? "/admin")}`)
    } else if (!allowed) {
      router.replace("/dashboard")
    }
  }, [hydrated, token, user, allowed, router, pathname])

  return hydrated && !!token && allowed
}

function GuardSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

/** Any signed-in user. Redirects guests to login with a return path. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const ok = useGuard(true)
  if (!ok) return <GuardSpinner />
  return <>{children}</>
}

/** Super-admin pages (analytics, user management, colleges). */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const ok = useGuard(isAdminRole(user))
  if (!ok) return <GuardSpinner />
  return <>{children}</>
}

/** Staff pages (problem CMS, contests, student import) — includes teachers
 *  and college admins. */
export function StaffGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const ok = useGuard(isStaffRole(user))
  if (!ok) return <GuardSpinner />
  return <>{children}</>
}
