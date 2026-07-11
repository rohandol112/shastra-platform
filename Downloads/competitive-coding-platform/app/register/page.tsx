"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, ArrowLeft, Check, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { ApiError, type FieldError } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const register = useAuthStore((s) => s.register)
  const user = useAuthStore((s) => s.user)
  const hydrated = useAuthStore((s) => s.hydrated)

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (hydrated && user) router.replace("/dashboard")
  }, [hydrated, user, router])

  // Backend requires: 8+ chars with lowercase, uppercase and a digit
  const passwordChecks = {
    length: formData.password.length >= 8,
    lower: /[a-z]/.test(formData.password),
    upper: /[A-Z]/.test(formData.password),
    digit: /\d/.test(formData.password),
  }
  const passwordValid = Object.values(passwordChecks).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords don't match" })
      return
    }
    if (!passwordValid) {
      setFieldErrors({ password: "Password must be 8+ characters with uppercase, lowercase and a number" })
      return
    }

    setIsLoading(true)
    try {
      const created = await register({
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim() ? formData.username.trim().toLowerCase() : undefined,
        phone: formData.phone.trim() ? formData.phone.trim().replace(/[\s()-]/g, "") : undefined,
      })
      toast.success(`Welcome to SHASTRA, ${created.username}!`)
      router.push("/dashboard")
    } catch (err) {
      setIsLoading(false)
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.errors) {
          const mapped: Record<string, string> = {}
          err.errors.forEach((fe: FieldError) => {
            mapped[fe.field] = fe.message
          })
          setFieldErrors(mapped)
        }
      } else {
        setError("Something went wrong. Please try again.")
      }
    }
  }

  const fieldError = (name: string) =>
    fieldErrors[name] ? <p className="text-xs text-destructive">{fieldErrors[name]}</p> : null

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
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground">Start your coding journey today</h1>

            <div className="space-y-4">
              {[
                "Access a growing library of coding problems",
                "Compete in live contests",
                "Track your progress with detailed analytics",
                "Climb the global leaderboard",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20">
                    <Check className="h-3.5 w-3.5 text-success" />
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">Built for students, campuses and competitive programmers.</p>
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
            <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
            <p className="mt-2 text-muted-foreground">Join thousands of developers on SHASTRA</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  minLength={2}
                  className="h-11 border-border/50 bg-card/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
                {fieldError("firstName")}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  minLength={2}
                  className="h-11 border-border/50 bg-card/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
                {fieldError("lastName")}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">
                Username <span className="text-muted-foreground">(letters &amp; numbers only)</span>
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9]*"
                title="Letters and numbers only"
                className="h-11 border-border/50 bg-card/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
              {fieldError("username")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
                className="h-11 border-border/50 bg-card/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
              {fieldError("email")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone Number <span className="text-muted-foreground">(optional, e.g. +919876543210)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+919876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-11 border-border/50 bg-card/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
              {fieldError("phone")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-11 border-border/50 bg-card/50 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary"
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
              {formData.password && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <PasswordRule ok={passwordChecks.length} label="8+ characters" />
                  <PasswordRule ok={passwordChecks.upper} label="Uppercase" />
                  <PasswordRule ok={passwordChecks.lower} label="Lowercase" />
                  <PasswordRule ok={passwordChecks.digit} label="Number" />
                </div>
              )}
              {fieldError("password")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                autoComplete="new-password"
                className="h-11 border-border/50 bg-card/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive">Passwords don't match</p>
              )}
              {fieldError("confirmPassword")}
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-lg bg-primary font-medium hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={ok ? "text-success" : "text-muted-foreground"}>
      {ok ? "✓" : "○"} {label}
    </span>
  )
}
