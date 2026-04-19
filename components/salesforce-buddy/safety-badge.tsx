'use client'

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { SafetyInfo } from '@/types'
import { Shield, EyeOff, Filter } from 'lucide-react'

interface SafetyBadgeProps {
  safetyInfo: SafetyInfo
}

export function SafetyBadge({ safetyInfo }: SafetyBadgeProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {safetyInfo.allowed_fields_only && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 text-success border-success/30 bg-success/10">
                <Shield className="size-3" />
                Safe Fields
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Only approved metadata fields are used - no sensitive data</p>
            </TooltipContent>
          </Tooltip>
        )}

        {safetyInfo.fields_filtered > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1">
                <Filter className="size-3" />
                {safetyInfo.fields_filtered} filtered
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{safetyInfo.fields_filtered} sensitive fields were excluded from AI context</p>
            </TooltipContent>
          </Tooltip>
        )}

        {safetyInfo.pii_masked > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1">
                <EyeOff className="size-3" />
                {safetyInfo.pii_masked} masked
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{safetyInfo.pii_masked} potential PII items were masked (emails, phones, IDs)</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
