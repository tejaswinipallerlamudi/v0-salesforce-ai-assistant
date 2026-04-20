'use client'

import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserRole } from '@/types'
import { Shield, User, Users } from 'lucide-react'

interface HeaderProps {
  userRole: UserRole
  onRoleChange: (role: UserRole) => void
}

const roleConfig: Record<UserRole, { label: string; icon: typeof User; description: string }> = {
  intern: {
    label: 'Intern',
    icon: User,
    description: 'Learning mode with detailed explanations',
  },
  lead: {
    label: 'Team Lead',
    icon: Users,
    description: 'Strategic insights and risk analysis',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    description: 'Full access with audit visibility',
  },
}

export function Header({ userRole, onRoleChange }: HeaderProps) {
  const config = roleConfig[userRole]
  const RoleIcon = config.icon

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

          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80">Role:</span>
            <Select value={userRole} onValueChange={(v) => onRoleChange(v as UserRole)}>
              <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white hover:bg-white/30">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <RoleIcon className="size-4" />
                    <span>{config.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleConfig).map(([role, cfg]) => {
                  const Icon = cfg.icon
                  return (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <Icon className="size-4" />
                        <div>
                          <div className="font-medium">{cfg.label}</div>
                          <div className="text-xs text-muted-foreground">{cfg.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  )
}
