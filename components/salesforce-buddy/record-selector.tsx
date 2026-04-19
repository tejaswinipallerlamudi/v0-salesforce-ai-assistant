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
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api-client'
import type { SalesforceRecord, SafetyInfo } from '@/types'

interface RecordSelectorProps {
  objectName: string
  selectedRecordId: string
  onSelect: (recordId: string) => void
  onSafetyInfo?: (info: SafetyInfo) => void
}

// Mock records for demo
const MOCK_RECORDS: Record<string, SalesforceRecord[]> = {
  Case: [
    { id: 'CASE-001', object_name: 'Case', fields: { CaseNumber: '00001234', Status: 'Working', Priority: 'High', Subject: 'Login Issue' } },
    { id: 'CASE-002', object_name: 'Case', fields: { CaseNumber: '00001235', Status: 'New', Priority: 'Critical', Subject: 'Production Outage' } },
    { id: 'CASE-003', object_name: 'Case', fields: { CaseNumber: '00001236', Status: 'Escalated', Priority: 'High', Subject: 'Integration Error' } },
    { id: 'CASE-004', object_name: 'Case', fields: { CaseNumber: '00001237', Status: 'Closed', Priority: 'Medium', Subject: 'Feature Request' } },
  ],
  Opportunity: [
    { id: 'OPP-001', object_name: 'Opportunity', fields: { Name: 'Enterprise Deal Q1', StageName: 'Negotiation', Amount: 150000 } },
    { id: 'OPP-002', object_name: 'Opportunity', fields: { Name: 'SMB Package', StageName: 'Qualification', Amount: 25000 } },
  ],
  Account: [
    { id: 'ACC-001', object_name: 'Account', fields: { Name: 'Acme Corporation', Industry: 'Technology', Type: 'Enterprise' } },
    { id: 'ACC-002', object_name: 'Account', fields: { Name: 'Global Logistics', Industry: 'Transportation', Type: 'Strategic' } },
  ],
  Lead: [
    { id: 'LEAD-001', object_name: 'Lead', fields: { Status: 'Open', Rating: 'Hot', LeadSource: 'Web' } },
    { id: 'LEAD-002', object_name: 'Lead', fields: { Status: 'Working', Rating: 'Warm', LeadSource: 'Referral' } },
  ],
  Task: [
    { id: 'TASK-001', object_name: 'Task', fields: { Subject: 'Follow up call', Status: 'In Progress', Priority: 'High' } },
    { id: 'TASK-002', object_name: 'Task', fields: { Subject: 'Send proposal', Status: 'Not Started', Priority: 'Normal' } },
  ],
}

function getPriorityBadge(priority: string | undefined) {
  if (!priority) return null
  const variant = priority.toLowerCase() === 'critical' || priority.toLowerCase() === 'high' ? 'destructive' : 'secondary'
  return <Badge variant={variant} className="ml-2 text-xs">{priority}</Badge>
}

function getStatusBadge(status: string | undefined) {
  if (!status) return null
  return <Badge variant="outline" className="ml-1 text-xs">{status}</Badge>
}

export function RecordSelector({ objectName, selectedRecordId, onSelect, onSafetyInfo }: RecordSelectorProps) {
  const [records, setRecords] = useState<SalesforceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadRecords() {
      if (!objectName) {
        setRecords([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const data = await apiClient.getRecords(objectName)
        setRecords(data.records)
      } catch {
        // Use mock data for demo
        setRecords(MOCK_RECORDS[objectName] || [])
      } finally {
        setIsLoading(false)
      }
    }

    loadRecords()
  }, [objectName])

  useEffect(() => {
    async function loadRecordDetails() {
      if (!objectName || !selectedRecordId) return

      try {
        const data = await apiClient.getRecord(objectName, selectedRecordId, true)
        if (onSafetyInfo) {
          onSafetyInfo(data.safety_info)
        }
      } catch {
        // Use mock safety info for demo
        if (onSafetyInfo) {
          onSafetyInfo({
            fields_filtered: 8,
            pii_masked: 2,
            allowed_fields_only: true,
            masking_applied: true,
          })
        }
      }
    }

    loadRecordDetails()
  }, [objectName, selectedRecordId, onSafetyInfo])

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Record</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  const getRecordLabel = (record: SalesforceRecord) => {
    const fields = record.fields
    const name = fields.Name || fields.CaseNumber || fields.Subject || record.id
    return String(name)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="record-select">Record (Optional)</Label>
      <Select value={selectedRecordId || '__none__'} onValueChange={(v) => onSelect(v === '__none__' ? '' : v)}>
        <SelectTrigger id="record-select">
          <SelectValue placeholder="Select a record..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">
            <span className="text-muted-foreground">No specific record</span>
          </SelectItem>
          {records.map((record) => (
            <SelectItem key={record.id} value={record.id}>
              <div className="flex items-center">
                <span>{getRecordLabel(record)}</span>
                {getStatusBadge(record.fields.Status as string)}
                {getPriorityBadge(record.fields.Priority as string)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
