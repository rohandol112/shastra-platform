"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, LayoutDashboard, User, Shield, LogOut, Code2, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore, isAdminRole } from "@/lib/stores/auth-store"
import { displayName } from "@/lib/api"

const appLinks = [
  { href: "/problems", label: "Problems", icon: Code2 },
  { href: "/contests", label: "Contests", icon: Trophy },
]

const marketingLinks = [
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
]

export function Navbar(_props: { user?: unknown }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const user = useAuthStore((s) => s.user)
  const hydrated = useAuthStore((s) => s.hydrated)
  const logout = useAuthStore((s) => s.logout)

  const isLoggedIn = hydrated && !!user
  const isAdmin = isLoggedIn && isAdminRole(user)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navLinks = isLoggedIn ? appLinks : [...appLinks, ...marketingLinks]

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", scrolled ? "py-3" : "py-5")}>
      <nav
        className={cn(
          "mx-auto flex items-center justify-between px-6 transition-all duration-300",
          scrolled
            ? "max-w-5xl rounded-full border border-border/50 bg-card/80 backdrop-blur-xl shadow-lg mx-4 lg:mx-auto py-2 px-4"
            : "max-w-6xl",
        )}
      >
        {/* Logo */}
        <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <Image
            src="/Light.png"
            alt="SHASTRA - Competitive Coding Platform"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-primary">SHA</span>
            <span className="text-secondary">STRA</span>
          </span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden absolute left-1/2 -translate-x-1/2 items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname?.startsWith(link.href) && link.href !== "/"
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname?.startsWith("/dashboard") ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname?.startsWith("/admin") ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Admin
            </Link>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full border border-border/50 bg-card/50 py-1 pl-1 pr-3 transition-colors hover:bg-card"
                  aria-label="Open user menu"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground">
                    {(user!.username || "U").charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[120px] truncate text-sm font-medium text-foreground sm:block">
                    {user!.username}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="truncate font-medium text-foreground">{displayName(user!)}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">{user!.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="rounded-full bg-secondary px-5 text-secondary-foreground shadow-md shadow-secondary/20 hover:bg-secondary/85 hover:shadow-lg hover:shadow-secondary/25 active:scale-[0.98] transition-all duration-200"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 border-b border-border bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {isLoggedIn && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
              <hr className="border-border my-2" />
              {isLoggedIn ? (
                <Button variant="ghost" className="w-full justify-start text-red-400" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/85 active:scale-[0.98] transition-all duration-200">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
