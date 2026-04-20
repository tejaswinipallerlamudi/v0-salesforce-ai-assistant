'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import type { UserRole } from '@/types'
import { Shield, User, Users, LogOut, ChevronDown } from 'lucide-react'

interface HeaderProps {
  userRole: UserRole
  userName?: string
}

const roleConfig: Record<UserRole, { label: string; icon: typeof User; badgeColor: string }> = {
  intern: {
    label: 'Intern',
    icon: User,
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  lead: {
    label: 'Team Lead',
    icon: Users,
    badgeColor: 'bg-green-100 text-green-700',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    badgeColor: 'bg-purple-100 text-purple-700',
  },
}

export function Header({ userRole, userName }: HeaderProps) {
  const router = useRouter()
  const { logout } = useAuth()
  const config = roleConfig[userRole]
  const RoleIcon = config.icon

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-primary shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-white/20">
              <span className="text-lg font-bold text-white">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">CSX AI Fabric</h1>
              <p className="text-xs text-white/70">Salesforce Buddy & Project Intelligence</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-1.5 px-3 py-1 bg-white/20 text-white border-white/30">
            <div className="size-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs">Safe Metadata Only</span>
          </Badge>

          {/* Role Badge */}
          <Badge className={`gap-1.5 px-3 py-1 ${config.badgeColor}`}>
            <RoleIcon className="size-3" />
            <span className="text-xs font-medium">{config.label}</span>
          </Badge>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 bg-white/20 text-white hover:bg-white/30 hover:text-white">
                <div className="flex size-7 items-center justify-center rounded-full bg-white/30">
                  <User className="size-4" />
                </div>
                <span className="hidden sm:inline">{userName || 'User'}</span>
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{userName || 'User'}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {config.label} Account
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="size-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
