'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ObjectSelector } from './object-selector'
import { RecordSelector } from './record-selector'
import { ExplainPageButton } from './explain-page-button'
import { QuestionInput } from './question-input'
import { AnswerDisplay } from './answer-display'
import { GuidedStepsPanel } from './guided-steps-panel'
import { SafetyBadge } from './safety-badge'
import type { UserRole, ExplainPageResponse, QuestionResponse, GuidedStepsResponse, SafetyInfo } from '@/types'
import { Sparkles } from 'lucide-react'

interface SalesforceBuddyPanelProps {
  userRole: UserRole
  selectedObject: string
  selectedRecordId: string
  onObjectChange: (object: string) => void
  onRecordChange: (recordId: string) => void
}

export function SalesforceBuddyPanel({
  userRole,
  selectedObject,
  selectedRecordId,
  onObjectChange,
  onRecordChange,
}: SalesforceBuddyPanelProps) {
  const [explanation, setExplanation] = useState<ExplainPageResponse | null>(null)
  const [answer, setAnswer] = useState<QuestionResponse | null>(null)
  const [guidedSteps, setGuidedSteps] = useState<GuidedStepsResponse | null>(null)
  const [safetyInfo, setSafetyInfo] = useState<SafetyInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleClearResults = () => {
    setExplanation(null)
    setAnswer(null)
    setGuidedSteps(null)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Column - Selection & Actions */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-accent" />
              <CardTitle>Salesforce Buddy</CardTitle>
            </div>
            <CardDescription>
              Your AI assistant for understanding Salesforce pages, fields, and processes.
              {userRole === 'intern' && ' Perfect for learning and onboarding.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ObjectSelector
              selectedObject={selectedObject}
              onSelect={(obj) => {
                onObjectChange(obj)
                onRecordChange('')
                handleClearResults()
              }}
            />

            {selectedObject && (
              <RecordSelector
                objectName={selectedObject}
                selectedRecordId={selectedRecordId}
                onSelect={onRecordChange}
                onSafetyInfo={setSafetyInfo}
              />
            )}

            {selectedObject && (
              <div className="flex flex-col gap-2">
                <ExplainPageButton
                  objectName={selectedObject}
                  recordId={selectedRecordId}
                  userRole={userRole}
                  onExplanation={setExplanation}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />

                {safetyInfo && <SafetyBadge safetyInfo={safetyInfo} />}
              </div>
            )}

            {/* Explanation appears directly below the button */}
            {explanation && (
              <div className="mt-4 pt-4 border-t">
                <AnswerDisplay
                  explanation={explanation}
                  answer={null}
                  guidedSteps={null}
                  userRole={userRole}
                  compact
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ask a Question</CardTitle>
            <CardDescription>
              Get answers based on SOPs and approved knowledge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <QuestionInput
              objectName={selectedObject}
              recordId={selectedRecordId}
              userRole={userRole}
              onAnswer={setAnswer}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />

            {/* Answer appears directly below the question input */}
            {answer && (
              <div className="pt-4 border-t">
                <AnswerDisplay
                  explanation={null}
                  answer={answer}
                  guidedSteps={null}
                  userRole={userRole}
                  compact
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Guided Workflows</CardTitle>
            <CardDescription>
              Step-by-step guidance for common processes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GuidedStepsPanel
              objectName={selectedObject}
              recordId={selectedRecordId}
              userRole={userRole}
              onSteps={setGuidedSteps}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Guided Steps Results */}
      {guidedSteps && (
        <div className="lg:col-span-2">
          <AnswerDisplay
            explanation={null}
            answer={null}
            guidedSteps={guidedSteps}
            userRole={userRole}
          />
        </div>
      )}
    </div>
  )
}
