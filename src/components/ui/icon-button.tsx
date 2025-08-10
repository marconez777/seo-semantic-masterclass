import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface IconButtonProps extends Omit<ButtonProps, "children"> {
  ariaLabel: string
  icon?: React.ReactNode
  children?: React.ReactNode
}

export function IconButton({ ariaLabel, icon, children, className, ...props }: IconButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={ariaLabel}
      className={cn("hover:bg-muted/70", className)}
      {...props}
    >
      {icon ?? children}
    </Button>
  )
}
