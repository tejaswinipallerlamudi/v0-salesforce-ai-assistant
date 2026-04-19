'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { UserRole, GuidedStepsResponse } from '@/types'
import { ListChecks, ArrowUpCircle, XCircle, RefreshCw } from 'lucide-react'

interface GuidedStepsPanelProps {
  objectName?: string
  recordId?: string
  userRole: UserRole
  onSteps: (steps: GuidedStepsResponse) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const WORKFLOWS = [
  { id: 'escalation', label: 'Escalation', icon: ArrowUpCircle },
  { id: 'closure', label: 'Closure', icon: XCircle },
  { id: 'reassignment', label: 'Reassignment', icon: RefreshCw },
]

// Mock guided steps for demo
const MOCK_STEPS: Record<string, GuidedStepsResponse> = {
  escalation: {
    workflow_type: 'escalation',
    workflow_title: 'Case Escalation Process',
    description: 'Step-by-step guide for escalating a case to the specialized team',
    steps: [
      { step_number: 1, title: 'Review Case History', description: 'Check all existing notes, communications, and troubleshooting steps documented in the case.', is_optional: false },
      { step_number: 2, title: 'Document Current State', description: 'Add a detailed note summarizing the current issue status and why escalation is needed.', is_optional: false, related_field: 'Notes' },
      { step_number: 3, title: 'Update Status to Escalated', description: 'Change the Status field to "Escalated" to trigger proper routing.', is_optional: false, related_field: 'Status' },
      { step_number: 4, title: 'Notify Escalation Team', description: 'Send notification via the escalation channel or @mention the escalation team.', is_optional: false },
      { step_number: 5, title: 'Inform Customer', description: 'Send a brief update to the customer letting them know the case has been escalated.', is_optional: false },
      { step_number: 6, title: 'Set Follow-up Reminder', description: 'Create a task to follow up within 24 hours if no response from escalation team.', is_optional: true, related_field: 'Task' },
    ],
    prerequisites: ['Case must have documented troubleshooting attempts', 'Must meet escalation criteria per SOP'],
    warnings: ['Ensure customer has been notified before escalating', 'Document all steps taken so far'],
    source_sop: { source_type: 'sop', source_id: 1, title: 'Case Escalation Procedure', relevance_score: 0.98 },
    estimated_time_minutes: 15,
  },
  closure: {
    workflow_type: 'closure',
    workflow_title: 'Case Closure Process',
    description: 'Step-by-step guide for properly closing a resolved case',
    steps: [
      { step_number: 1, title: 'Verify Resolution', description: 'Confirm the issue has been fully resolved and customer has verified.', is_optional: false },
      { step_number: 2, title: 'Document Solution', description: 'Add final resolution notes describing what fixed the issue.', is_optional: false },
      { step_number: 3, title: 'Set Closed Reason', description: 'Select the appropriate closure reason from the picklist.', is_optional: false, related_field: 'Closed Reason' },
      { step_number: 4, title: 'Update Status to Closed', description: 'Change the Status field to "Closed".', is_optional: false, related_field: 'Status' },
      { step_number: 5, title: 'Send Closure Notification', description: 'Send final communication to customer with resolution summary.', is_optional: false },
      { step_number: 6, title: 'Update Knowledge Base', description: 'If this was a new issue/solution, create or update KB article.', is_optional: true },
    ],
    prerequisites: ['Customer must confirm resolution OR 3 days since solution provided with no response'],
    warnings: ['Do not close without proper documentation', 'Ensure customer satisfaction survey is sent'],
    source_sop: { source_type: 'sop', source_id: 2, title: 'Case Closure Procedure', relevance_score: 0.96 },
    estimated_time_minutes: 10,
  },
  reassignment: {
    workflow_type: 'reassignment',
    workflow_title: 'Case Reassignment Process',
    description: 'Step-by-step guide for reassigning a case to another team member',
    steps: [
      { step_number: 1, title: 'Document Reason', description: 'Add notes explaining why the case needs to be reassigned.', is_optional: false },
      { step_number: 2, title: 'Summarize Current State', description: 'Provide a brief summary of what has been done and next steps.', is_optional: false },
      { step_number: 3, title: 'Change Owner', description: 'Update the Owner field to the new assignee.', is_optional: false, related_field: 'OwnerId' },
      { step_number: 4, title: 'Notify New Owner', description: 'Send a direct message or notification to the new case owner.', is_optional: false },
      { step_number: 5, title: 'Update Customer', description: 'If appropriate, inform customer of the new point of contact.', is_optional: true },
    ],
    prerequisites: ['Must have identified an appropriate new owner', 'Current state must be documented'],
    warnings: ['Avoid frequent reassignments - they frustrate customers'],
    estimated_time_minutes: 5,
  },
}

export function GuidedStepsPanel({
  objectName,
  recordId,
  userRole,
  onSteps,
  isLoading,
  setIsLoading,
}: GuidedStepsPanelProps) {
  const handleGetSteps = async (workflowType: string) => {
    setIsLoading(true)
    try {
      // Step 1: First check the local knowledge base (SOPs) for this workflow
      const knowledgeBaseSteps = MOCK_STEPS[workflowType]
      
      // Step 2: If we have documented steps in the knowledge base, use them
      if (knowledgeBaseSteps && knowledgeBaseSteps.source_sop) {
        // Found SOP-documented workflow - use the knowledge base steps
        onSteps(knowledgeBaseSteps)
      } else {
        // No documented workflow found - use OpenAI to generate steps
        try {
          const response = await fetch('/api/guided-steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workflowType, objectName, recordId, userRole }),
          })
          
          if (!response.ok) {
            throw new Error('API request failed')
          }
          
          const aiSteps = await response.json()
          onSteps(aiSteps)
        } catch (error) {
          console.error('[v0] Failed to get AI-generated steps:', error)
          // If OpenAI also fails, return a generic workflow
          onSteps(MOCK_STEPS.escalation)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid gap-2">
        {WORKFLOWS.map((workflow) => {
          const Icon = workflow.icon
          return (
            <Button
              key={workflow.id}
              variant="outline"
              size="sm"
              onClick={() => handleGetSteps(workflow.id)}
              disabled={isLoading}
              className="justify-start gap-2"
            >
              {isLoading ? (
                <Spinner className="size-4" />
              ) : (
                <Icon className="size-4" />
              )}
              {workflow.label} Steps
            </Button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <ListChecks className="size-3" />
        Get step-by-step checklists based on SOPs
      </p>
    </div>
  )
}
