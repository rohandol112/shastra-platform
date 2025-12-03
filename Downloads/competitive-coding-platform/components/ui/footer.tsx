import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/20">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/Light.png"
                alt="SHASTRA Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <span className="text-lg font-bold">
                <span className="text-primary">SHA</span><span className="text-secondary">STRA</span>
              </span>
            </Link>
            <p className="max-w-xs text-center sm:text-left text-sm text-muted-foreground">
              The ultimate platform for competitive programming.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link href="#contact" className="text-muted-foreground transition-colors hover:text-foreground">
              Contact
            </Link>
            <Link href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">
              FAQ
            </Link>
            <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
              About
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SHASTRA. All rights reserved.
          </p>
          <p className="text-xs italic text-muted-foreground">&quot;Caliber isn&apos;t claimed; it&apos;s conquered.&quot;</p>
        </div>
      </div>
    </footer>
  )
}
