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

// Mock answer for demo
const MOCK_ANSWER: QuestionResponse = {
  question: '',
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
      onAnswer({
        ...MOCK_ANSWER,
        question,
      })
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
