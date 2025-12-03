import Image from "next/image"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-secondary/20" />
          <Image
            src="/Light.png"
            alt="SHASTRA"
            width={56}
            height={56}
            className="relative h-14 w-14 object-contain animate-pulse"
            priority
          />
        </div>
        
        {/* Loading text */}
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-muted-foreground">Loading</span>
          <span className="flex gap-1">
            <span className="h-1 w-1 animate-bounce rounded-full bg-secondary [animation-delay:-0.3s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-secondary [animation-delay:-0.15s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-secondary" />
          </span>
        </div>
      </div>
    </div>
  )
}
