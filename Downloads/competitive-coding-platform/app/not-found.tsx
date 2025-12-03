"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.42_0.18_265/0.1),transparent_60%)]" />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo */}
        <Link href="/" className="mb-8 inline-flex items-center gap-2.5">
          <Image
            src="/Light.png"
            alt="SHASTRA Logo"
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
          />
          <span className="text-2xl font-bold">
            <span className="text-primary">SHA</span>
            <span className="text-secondary">STRA</span>
          </span>
        </Link>

        {/* 404 Text */}
        <h1 className="mb-4 text-8xl font-black tracking-tighter text-gradient-shastra sm:text-9xl">
          404
        </h1>
        
        <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
          Page Not Found
        </h2>
        
        <p className="mb-8 max-w-md text-muted-foreground">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved. 
          Let&apos;s get you back on track.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/">
            <Button 
              size="lg" 
              className="h-12 rounded-full bg-secondary px-6 text-secondary-foreground shadow-lg shadow-secondary/25 hover:bg-secondary/85 hover:shadow-xl hover:shadow-secondary/30 active:scale-[0.98] transition-all duration-200"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-full border-border/60 bg-card/50 px-6 hover:bg-card hover:border-primary/40 active:scale-[0.98] transition-all duration-200"
            onClick={() => history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
