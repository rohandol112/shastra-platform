"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setShowBanner(false)
  }

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined")
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-500">
      <div className="mx-auto max-w-4xl rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 pr-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">
              🍪 We value your privacy
            </h3>
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your browsing experience and analyze site traffic. 
              By clicking &quot;Accept&quot;, you consent to our use of cookies.
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={declineCookies}
              className="rounded-full border-border/60 hover:bg-muted active:scale-[0.98] transition-all duration-200"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={acceptCookies}
              className="rounded-full bg-secondary text-secondary-foreground shadow-md shadow-secondary/20 hover:bg-secondary/85 active:scale-[0.98] transition-all duration-200"
            >
              Accept Cookies
            </Button>
          </div>

          {/* Close button */}
          <button
            onClick={declineCookies}
            className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors sm:hidden"
            aria-label="Close cookie banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
