'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'
import type { SalesforceObject } from '@/types'
import { Database, FileText, Briefcase, Users, CheckSquare } from 'lucide-react'

interface ObjectSelectorProps {
  selectedObject: string
  onSelect: (object: string) => void
}

const objectIcons: Record<string, typeof Database> = {
  Case: FileText,
  Opportunity: Briefcase,
  Account: Users,
  Lead: Users,
  Task: CheckSquare,
}

// Mock data for demo when backend is not available
const MOCK_OBJECTS: SalesforceObject[] = [
  { name: 'Case', label: 'Case', label_plural: 'Cases', description: 'Customer support cases', allowed_field_count: 12, fields: [] },
  { name: 'Opportunity', label: 'Opportunity', label_plural: 'Opportunities', description: 'Sales opportunities', allowed_field_count: 14, fields: [] },
  { name: 'Account', label: 'Account', label_plural: 'Accounts', description: 'Company accounts', allowed_field_count: 10, fields: [] },
  { name: 'Lead', label: 'Lead', label_plural: 'Leads', description: 'Sales leads', allowed_field_count: 11, fields: [] },
  { name: 'Task', label: 'Task', label_plural: 'Tasks', description: 'Activities and tasks', allowed_field_count: 9, fields: [] },
]

export function ObjectSelector({ selectedObject, onSelect }: ObjectSelectorProps) {
  const [objects, setObjects] = useState<SalesforceObject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadObjects() {
      try {
        const data = await apiClient.getObjects()
        setObjects(data.objects)
        setError(null)
      } catch {
        // Use mock data for demo
        setObjects(MOCK_OBJECTS)
        setError(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadObjects()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Salesforce Object</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="object-select">Salesforce Object</Label>
      <Select value={selectedObject} onValueChange={onSelect}>
        <SelectTrigger id="object-select">
          <SelectValue placeholder="Select an object..." />
        </SelectTrigger>
        <SelectContent>
          {objects.map((obj) => {
            const Icon = objectIcons[obj.name] || Database
            return (
              <SelectItem key={obj.name} value={obj.name}>
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">{obj.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({obj.allowed_field_count} fields)
                    </span>
                  </div>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
