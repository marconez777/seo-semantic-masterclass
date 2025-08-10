import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface FABProps extends ButtonProps {}

export function FAB({ className, children, ...props }: FABProps) {
  return (
    <Button
      variant="destructive"
      size="lg"
      className={cn("fixed bottom-6 right-6 rounded-full px-6 shadow-fab", className)}
      {...props}
    >
      {children}
    </Button>
  )
}
