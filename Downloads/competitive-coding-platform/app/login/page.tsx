"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, Phone, AlertCircle } from "lucide-react"
import { useAuthStore, isAdminRole } from "@/lib/stores/auth-store"
import { ApiError } from "@/lib/api"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore((s) => s.login)
  const user = useAuthStore((s) => s.user)
  const hydrated = useAuthStore((s) => s.hydrated)

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  })

  // Already logged in? Go straight to the app.
  useEffect(() => {
    if (hydrated && user) {
      router.replace(isAdminRole(user) ? "/admin" : "/dashboard")
    }
  }, [hydrated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const loggedIn = await login(formData.identifier.trim(), formData.password)
      toast.success(`Welcome back, ${loggedIn.username}!`)
      const redirect = searchParams.get("redirect")
      if (redirect && redirect.startsWith("/")) {
        router.push(redirect)
      } else {
        router.push(isAdminRole(loggedIn) ? "/admin" : "/dashboard")
      }
    } catch (err) {
      setIsLoading(false)
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Something went wrong. Please try again.")
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Branding */}
      <div className="relative hidden w-1/2 overflow-hidden bg-card/30 lg:block">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute inset-0 bg-radial-glow" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/Light.png" alt="SHASTRA Logo" width={44} height={44} className="h-11 w-11 object-contain" />
            <span className="text-xl font-bold">
              <span className="text-primary">SHA</span>
              <span className="text-secondary">STRA</span>
            </span>
          </Link>

          <div className="max-w-md">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
              Master algorithms. <br />
              <span className="text-gradient-shastra">Win competitions.</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Join thousands of developers sharpening their skills on a platform built for speed, precision, and fair
              competition.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary/20 text-xs font-medium text-foreground"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">1000+</span> developers trust SHASTRA
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/Light.png" alt="SHASTRA Logo" width={44} height={44} className="h-11 w-11 object-contain" />
              <span className="text-xl font-bold">
                <span className="text-primary">SHA</span>
                <span className="text-secondary">STRA</span>
              </span>
            </Link>
          </div>

          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-2 text-muted-foreground">Sign in to your account to continue</p>
          </div>



          {/* Login Method Toggle */}
          <div className="mb-4 flex gap-2 rounded-lg bg-card/50 p-1">
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                loginMethod === "email"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="mr-2 inline-block h-4 w-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                loginMethod === "phone"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone className="mr-2 inline-block h-4 w-4" />
              Phone
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium text-foreground">
                {loginMethod === "email" ? "Email or username" : "Phone number"}
              </Label>
              <Input
                id="identifier"
                type={loginMethod === "email" ? "text" : "tel"}
                placeholder={loginMethod === "email" ? "you@example.com" : "+919876543210"}
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                required
                autoComplete="username"
                className="h-11 border-border/50 bg-card/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  className="h-11 border-border/50 bg-card/50 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-lg bg-primary font-medium hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
