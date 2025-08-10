import * as React from "react"
import { Bell, Search, LogOut, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { IconButton } from "@/components/ui/icon-button"

export interface UserProfileDropdownProps {
  name: string
  role?: string
  avatarUrl?: string
  onSignOut?: () => void
  className?: string
  showActions?: boolean
}

export function UserProfileDropdown({
  name,
  role = "Cliente",
  avatarUrl,
  onSignOut,
  className,
  showActions = true,
}: UserProfileDropdownProps) {
  const initials = React.useMemo(() => {
    const parts = name.split(" ")
    return parts.length >= 2
      ? `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
      : (name[0] ?? "U").toUpperCase()
  }, [name])

  return (
    <div className={cn("flex items-center gap-2", className)}>
{showActions && (
  <>
    <IconButton ariaLabel="Buscar">
      <Search className="opacity-80" />
    </IconButton>
    <IconButton ariaLabel="Notificações">
      <Bell className="opacity-80" />
    </IconButton>
  </>
)}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-muted/70 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-medium">{name}</span>
              <span className="text-xs text-muted-foreground">{role}</span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
<DropdownMenuLabel className="flex items-center gap-2">
  <User className="h-4 w-4" />
  <span>Minha conta</span>
</DropdownMenuLabel>
<DropdownMenuSeparator />
<DropdownMenuGroup>
  <DropdownMenuItem>
    <Settings className="mr-2 h-4 w-4" />
    <span>Configurações</span>
  </DropdownMenuItem>
</DropdownMenuGroup>
<DropdownMenuSeparator />
<DropdownMenuItem onClick={onSignOut} className="text-destructive focus:text-destructive">
  <LogOut className="mr-2 h-4 w-4" />
  <span>Sair</span>
</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
