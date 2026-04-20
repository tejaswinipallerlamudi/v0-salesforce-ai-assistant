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
    <div className="space-y-6">
      {/* Selection Controls Card */}
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
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <ObjectSelector
                selectedObject={selectedObject}
                onSelect={(obj) => {
                  onObjectChange(obj)
                  onRecordChange('')
                  handleClearResults()
                }}
              />
            </div>
            {selectedObject && (
              <div className="flex-1">
                <RecordSelector
                  objectName={selectedObject}
                  selectedRecordId={selectedRecordId}
                  onSelect={onRecordChange}
                  onSafetyInfo={setSafetyInfo}
                />
              </div>
            )}
            {selectedObject && (
              <ExplainPageButton
                objectName={selectedObject}
                recordId={selectedRecordId}
                userRole={userRole}
                onExplanation={setExplanation}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
          </div>
          {safetyInfo && <SafetyBadge safetyInfo={safetyInfo} />}
        </CardContent>
      </Card>

      {/* Explanation Results */}
      {explanation && (
        <Card>
          <CardContent className="pt-6">
            <AnswerDisplay
              explanation={explanation}
              answer={null}
              guidedSteps={null}
              userRole={userRole}
            />
          </CardContent>
        </Card>
      )}

      {/* Ask a Question Card */}
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
        </CardContent>
      </Card>

      {/* Answer Results */}
      {answer && (
        <Card>
          <CardContent className="pt-6">
            <AnswerDisplay
              explanation={null}
              answer={answer}
              guidedSteps={null}
              userRole={userRole}
            />
          </CardContent>
        </Card>
      )}

      {/* Guided Workflows Card */}
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

      {/* Guided Steps Results */}
      {guidedSteps && (
        <Card>
          <CardContent className="pt-6">
            <AnswerDisplay
              explanation={null}
              answer={null}
              guidedSteps={guidedSteps}
              userRole={userRole}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
