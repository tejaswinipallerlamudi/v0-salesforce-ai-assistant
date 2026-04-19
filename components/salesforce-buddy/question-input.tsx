'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { apiClient } from '@/lib/api-client'
import type { UserRole, QuestionResponse } from '@/types'
import { Send } from 'lucide-react'

interface QuestionInputProps {
  objectName?: string
  recordId?: string
  userRole: UserRole
  onAnswer: (answer: QuestionResponse) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const SAMPLE_QUESTIONS = [
  'How do I escalate this case?',
  'What does the Priority field mean?',
  'When should I close a case?',
  'What are the SLA requirements?',
]

// Mock answers for demo based on question keywords
function getMockAnswer(question: string): QuestionResponse {
  const q = question.toLowerCase()

  if (q.includes('escalat')) {
    return {
      question,
      answer: `Based on the Case Escalation Procedure SOP, here's how to escalate a case:

**When to Escalate:**
- Case has been open for more than 5 business days without resolution
- Customer has explicitly requested escalation
- Priority is Critical and no progress in 24 hours
- Technical issue requires specialized team involvement

**Steps to Escalate:**
1. Review the case history and document all troubleshooting steps taken
2. Update the case Status to "Escalated"
3. Add escalation notes explaining the reason
4. Notify the escalation team via the designated channel
5. Update the customer about the escalation

**After Escalation:**
- Monitor for escalation team response
- Keep customer updated on progress
- Document resolution for knowledge base`,
      confidence: 0.92,
      sources_used: [
        { source_type: 'sop', source_id: 1, title: 'Case Escalation Procedure', relevance_score: 0.95, snippet: 'When to Escalate: Case has been open for more than 5 business days...' },
        { source_type: 'sop', source_id: 4, title: 'High Priority Case Handling', relevance_score: 0.87, snippet: 'High Priority cases involve: Production system outages...' },
      ],
      suggested_actions: ['Update case status to Escalated', 'Add escalation notes', 'Notify escalation team'],
      safety_note: 'Answer based on approved SOPs and metadata only.',
    }
  }

  if (q.includes('priority')) {
    return {
      question,
      answer: `The **Priority** field indicates the urgency level of a case and determines response time SLAs:

**Priority Levels:**
- **Critical (P1)**: Production system down, affecting all users. Response within 1 hour, resolution target 4 hours.
- **High (P2)**: Major functionality impacted, no workaround available. Response within 4 hours, resolution target 1 business day.
- **Medium (P3)**: Partial functionality issue with workaround available. Response within 1 business day, resolution target 3 business days.
- **Low (P4)**: Minor issue, cosmetic, or enhancement request. Response within 2 business days, resolution target 5 business days.

**How Priority is Determined:**
- Business impact (number of users affected)
- Availability of workarounds
- Customer tier (Enterprise customers may have expedited SLAs)
- Revenue impact

**Changing Priority:**
Only Team Leads and above can upgrade priority. Document justification in case notes.`,
      confidence: 0.95,
      sources_used: [
        { source_type: 'sop', source_id: 2, title: 'Case Priority Guidelines', relevance_score: 0.98, snippet: 'Priority levels determine response and resolution SLAs...' },
        { source_type: 'field_guide', source_id: 1, title: 'Priority Field Reference', relevance_score: 0.91, snippet: 'Critical (P1): Production system down...' },
      ],
      suggested_actions: ['Review current priority against guidelines', 'Check customer tier for SLA adjustments'],
      safety_note: 'Answer based on approved SOPs and field metadata only.',
    }
  }

  if (q.includes('close') || q.includes('closing') || q.includes('resolution')) {
    return {
      question,
      answer: `Based on the Case Closure SOP, here are the requirements for closing a case:

**Before Closing - Required Checklist:**
1. Customer has confirmed the issue is resolved (email/call confirmation)
2. All troubleshooting steps are documented in case notes
3. Root cause has been identified and documented
4. Resolution field is populated with clear description
5. Any related Knowledge Articles are linked

**Closure Process:**
1. Update Status to "Resolved"
2. Set Resolution Type (e.g., "Fixed", "User Training", "Configuration Change")
3. Add final resolution notes
4. Send closure notification to customer
5. Wait 3 business days for customer feedback before auto-close

**When NOT to Close:**
- Customer has not confirmed resolution
- Related cases are still open
- Awaiting customer response (use "Pending Customer" status instead)
- Issue is recurring or intermittent`,
      confidence: 0.94,
      sources_used: [
        { source_type: 'sop', source_id: 3, title: 'Case Closure Procedure', relevance_score: 0.97, snippet: 'Before closing a case, ensure customer confirmation...' },
        { source_type: 'kt_note', source_id: 1, title: 'Common Closure Mistakes', relevance_score: 0.82, snippet: 'Avoid closing without customer confirmation...' },
      ],
      suggested_actions: ['Verify customer confirmation received', 'Complete resolution documentation', 'Update status to Resolved'],
      safety_note: 'Answer based on approved SOPs and metadata only.',
    }
  }

  if (q.includes('sla') || q.includes('service level')) {
    return {
      question,
      answer: `**SLA (Service Level Agreement) Requirements** define response and resolution timeframes:

**Response Time SLAs:**
| Priority | First Response | Resolution Target |
|----------|---------------|-------------------|
| Critical | 1 hour | 4 hours |
| High | 4 hours | 1 business day |
| Medium | 1 business day | 3 business days |
| Low | 2 business days | 5 business days |

**SLA Clock Rules:**
- Clock starts when case is created
- Clock pauses when status is "Pending Customer"
- Clock resumes when customer responds
- Business hours only (9 AM - 6 PM, Mon-Fri)

**SLA Breach Prevention:**
- Monitor SLA dashboard for approaching deadlines
- Escalate before breach, not after
- Document any customer-caused delays
- Enterprise customers have expedited SLAs (check customer tier)

**Reporting:**
- SLA metrics are tracked in weekly team reviews
- Breaches require RCA documentation`,
      confidence: 0.93,
      sources_used: [
        { source_type: 'sop', source_id: 5, title: 'SLA Management Guidelines', relevance_score: 0.96, snippet: 'Response Time SLAs vary by priority level...' },
        { source_type: 'sop', source_id: 2, title: 'Case Priority Guidelines', relevance_score: 0.88, snippet: 'Priority determines SLA targets...' },
      ],
      suggested_actions: ['Check current case SLA status', 'Review approaching SLA breaches in dashboard'],
      safety_note: 'Answer based on approved SOPs and metadata only.',
    }
  }

  // Default answer for any other question
  return {
    question,
    answer: `Based on the available SOPs and knowledge base, here's what I found relevant to your question:

**Summary:**
Your question "${question}" relates to standard Salesforce procedures. While I don't have a specific SOP that directly addresses this exact query, here are some general guidelines:

**General Best Practices:**
1. Always document your actions in the case notes
2. Follow the established workflow for your team
3. Consult with your Team Lead for edge cases
4. Reference the Knowledge Base for similar past issues

**Recommended Next Steps:**
- Check the internal Knowledge Base for related articles
- Review team-specific procedures in SharePoint
- Consult with a senior team member if unsure

**Need More Help?**
If this doesn't fully answer your question, try rephrasing with more specific keywords, or use the Guided Steps feature for common workflows.`,
    confidence: 0.72,
    sources_used: [
      { source_type: 'sop', source_id: 6, title: 'General Case Handling Guidelines', relevance_score: 0.75, snippet: 'Follow established workflows and document all actions...' },
    ],
    suggested_actions: ['Search Knowledge Base for related topics', 'Consult team lead for guidance'],
    limitations: 'No specific SOP found for this exact question. Answer is based on general guidelines.',
    safety_note: 'Answer based on approved SOPs and general best practices only.',
  }
}

export function QuestionInput({
  objectName,
  recordId,
  userRole,
  onAnswer,
  isLoading,
  setIsLoading,
}: QuestionInputProps) {
  const [question, setQuestion] = useState('')

  const handleAsk = async () => {
    if (!question.trim()) return

    setIsLoading(true)
    try {
      const answer = await apiClient.askQuestion(question, objectName, recordId, userRole)
      onAnswer(answer)
    } catch {
      // Use mock data for demo
      onAnswer(getMockAnswer(question))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSampleQuestion = (q: string) => {
    setQuestion(q)
  }

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Ask a question about Salesforce, processes, or this record..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="min-h-[80px] resize-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleAsk()
          }
        }}
      />
      
      <div className="flex flex-wrap gap-1">
        {SAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => handleSampleQuestion(q)}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            {q}
          </button>
        ))}
      </div>

      <Button
        onClick={handleAsk}
        disabled={isLoading || !question.trim()}
        className="w-full gap-2"
        variant="secondary"
      >
        {isLoading ? (
          <>
            <Spinner className="size-4" />
            Thinking...
          </>
        ) : (
          <>
            <Send className="size-4" />
            Ask Question
          </>
        )}
      </Button>
    </div>
  )
}
