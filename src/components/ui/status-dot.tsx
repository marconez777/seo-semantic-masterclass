import * as React from "react"
import { cn } from "@/lib/utils"

export type StatusDotVariant = "success" | "warning" | "danger"

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusDotVariant
}

const variantMap: Record<StatusDotVariant, string> = {
  success: "bg-secondary",
  warning: "bg-accent",
  danger: "bg-destructive",
}

export function StatusDot({ variant = "success", className, ...props }: StatusDotProps) {
  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full", variantMap[variant], className)}
      {...props}
    />
  )
}
