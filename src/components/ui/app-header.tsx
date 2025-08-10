import * as React from "react"
import { cn } from "@/lib/utils"

interface AppHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  left?: React.ReactNode
  right?: React.ReactNode
}

export function AppHeader({ left, right, className, ...props }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b shadow-sm",
        className
      )}
      {...props}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">{left}</div>
        <div className="flex items-center gap-2">{right}</div>
      </nav>
    </header>
  )
}
