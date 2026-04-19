'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Empty } from '@/components/ui/empty'
import type { ExplainPageResponse, QuestionResponse, GuidedStepsResponse, UserRole } from '@/types'
import { BookOpen, MessageSquare, ListChecks, Clock, AlertTriangle, CheckCircle2, FileText, Lightbulb, Shield } from 'lucide-react'
import { useState } from 'react'

interface AnswerDisplayProps {
  explanation: ExplainPageResponse | null
  answer: QuestionResponse | null
  guidedSteps: GuidedStepsResponse | null
  userRole: UserRole
}

function SourceBadge({ sourceType }: { sourceType: string }) {
  const config: Record<string, { label: string; className: string }> = {
    sop: { label: 'SOP', className: 'bg-accent/20 text-accent-foreground border-accent/30' },
    kt_note: { label: 'KT Note', className: 'bg-info/20 text-info-foreground border-info/30' },
    field_guide: { label: 'Field Guide', className: 'bg-success/20 text-success-foreground border-success/30' },
    project: { label: 'Project', className: 'bg-warning/20 text-warning-foreground border-warning/30' },
  }
  const c = config[sourceType] || { label: sourceType, className: '' }
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function ExplanationCard({ explanation }: { explanation: ExplainPageResponse }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="size-5 text-accent" />
          <CardTitle>Page Explanation: {explanation.object_label}</CardTitle>
        </div>
        <CardDescription>{explanation.purpose}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm leading-relaxed whitespace-pre-line">{explanation.summary}</p>
        </div>

        {/* Field Explanations */}
        {explanation.field_explanations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="size-4" />
              Field Guide
            </h4>
            <Accordion type="single" collapsible className="w-full">
              {explanation.field_explanations.map((field) => (
                <AccordionItem key={field.field_name} value={field.field_name}>
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.field_label}</span>
                      <Badge variant="outline" className="text-xs">{field.field_type}</Badge>
                      {field.current_value && (
                        <span className="text-muted-foreground">= {field.current_value}</span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">{field.explanation}</p>
                    {field.tips && (
                      <p className="mt-2 text-sm text-accent">Tip: {field.tips}</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Related Processes */}
        {explanation.related_processes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileText className="size-4" />
              Related Processes
            </h4>
            <div className="flex flex-wrap gap-2">
              {explanation.related_processes.map((process) => (
                <Badge key={process} variant="secondary">{process}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {explanation.sources_used.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="size-4" />
              Sources Used
            </h4>
            <div className="space-y-2">
              {explanation.sources_used.map((source) => (
                <div key={`${source.source_type}-${source.source_id}`} className="flex items-start gap-2 rounded-lg bg-muted/30 p-3">
                  <SourceBadge sourceType={source.source_type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{source.title}</p>
                    {source.snippet && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{source.snippet}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {Math.round(source.relevance_score * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety Note */}
        <div className="flex items-center gap-2 text-xs text-success">
          <Shield className="size-4" />
          {explanation.safety_note}
        </div>
      </CardContent>
    </Card>
  )
}

function AnswerCard({ answer }: { answer: QuestionResponse }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="size-5 text-accent" />
          <CardTitle className="text-base">Answer</CardTitle>
        </div>
        <CardDescription className="italic">{`"${answer.question}"`}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Answer */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm leading-relaxed whitespace-pre-line">{answer.answer}</p>
        </div>

        {/* Confidence */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-medium">{Math.round(answer.confidence * 100)}%</span>
          </div>
          <Progress value={answer.confidence * 100} className="h-1" />
        </div>

        {/* Suggested Actions */}
        {answer.suggested_actions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Suggested Actions</h4>
            <ul className="space-y-1">
              {answer.suggested_actions.map((action, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-success" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources */}
        {answer.sources_used.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Sources</h4>
            <div className="flex flex-wrap gap-2">
              {answer.sources_used.map((source) => (
                <div key={`${source.source_type}-${source.source_id}`} className="flex items-center gap-1">
                  <SourceBadge sourceType={source.source_type} />
                  <span className="text-xs">{source.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Limitations */}
        {answer.limitations && (
          <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-warning">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <p className="text-xs">{answer.limitations}</p>
          </div>
        )}

        {/* Safety Note */}
        <div className="flex items-center gap-2 text-xs text-success">
          <Shield className="size-4" />
          {answer.safety_note}
        </div>
      </CardContent>
    </Card>
  )
}

function GuidedStepsCard({ steps }: { steps: GuidedStepsResponse }) {
  const [completed, setCompleted] = useState<number[]>([])
  const progress = (completed.length / steps.steps.length) * 100

  const toggleStep = (stepNum: number) => {
    setCompleted((prev) =>
      prev.includes(stepNum) ? prev.filter((n) => n !== stepNum) : [...prev, stepNum]
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListChecks className="size-5 text-accent" />
          <CardTitle className="text-base">{steps.workflow_title}</CardTitle>
        </div>
        <CardDescription>{steps.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completed.length} / {steps.steps.length} steps</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Time Estimate */}
        {steps.estimated_time_minutes && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-4" />
            Estimated time: {steps.estimated_time_minutes} minutes
          </div>
        )}

        {/* Prerequisites */}
        {steps.prerequisites.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Prerequisites</h4>
            <ul className="space-y-1">
              {steps.prerequisites.map((prereq, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3 mt-0.5 shrink-0" />
                  {prereq}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {steps.warnings.length > 0 && (
          <div className="rounded-lg bg-warning/10 p-3">
            {steps.warnings.map((warning, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-warning">
                <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                {warning}
              </div>
            ))}
          </div>
        )}

        {/* Steps Checklist */}
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {steps.steps.map((step) => (
              <div
                key={step.step_number}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  completed.includes(step.step_number) ? 'bg-success/10 border-success/30' : 'bg-card'
                }`}
              >
                <Checkbox
                  checked={completed.includes(step.step_number)}
                  onCheckedChange={() => toggleStep(step.step_number)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Step {step.step_number}
                    </span>
                    {step.is_optional && (
                      <Badge variant="outline" className="text-xs">Optional</Badge>
                    )}
                    {step.related_field && (
                      <Badge variant="secondary" className="text-xs">{step.related_field}</Badge>
                    )}
                  </div>
                  <p className={`text-sm font-medium ${completed.includes(step.step_number) ? 'line-through text-muted-foreground' : ''}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                  {step.tips && (
                    <p className="text-xs text-accent mt-1">Tip: {step.tips}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Source SOP */}
        {steps.source_sop && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="size-4" />
            Source: {steps.source_sop.title}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AnswerDisplay({ explanation, answer, guidedSteps, userRole }: AnswerDisplayProps) {
  const hasContent = explanation || answer || guidedSteps

  if (!hasContent) {
    return (
      <Card className="h-full min-h-[400px]">
        <CardContent className="flex h-full items-center justify-center p-6">
          <Empty
            icon={Lightbulb}
            title="Select an object to get started"
            description={
              userRole === 'intern'
                ? 'Choose a Salesforce object and record, then click "Explain This Page" to learn about it.'
                : 'Select a Salesforce object to explore with AI-powered explanations and insights.'
            }
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {explanation && <ExplanationCard explanation={explanation} />}
      {answer && <AnswerCard answer={answer} />}
      {guidedSteps && <GuidedStepsCard steps={guidedSteps} />}
    </div>
  )
}
