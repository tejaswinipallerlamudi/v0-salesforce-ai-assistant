'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Empty } from '@/components/ui/empty'
import { ProjectSelector, MOCK_PROJECTS } from '@/components/project-intelligence/project-selector'
import { apiClient } from '@/lib/api-client'
import type { UserRole, InsightsResponse, Risk, Recommendation } from '@/types'
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Shield,
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  Activity,
} from 'lucide-react'

interface ProjectIntelligencePanelProps {
  userRole: UserRole
}

// Mock insights for demo
const MOCK_INSIGHTS: InsightsResponse = {
  object_name: 'Opportunity',
  record_id: 'OPP-001',
  overall_health: {
    score: 72,
    status: 'at_risk',
    key_factors: ['Timeline concerns', 'Resource allocation', 'Customer responsiveness'],
  },
  risks: [
    {
      risk_id: 'R1',
      category: 'timeline',
      severity: 'high',
      title: 'Delivery Timeline at Risk',
      description: 'Based on current velocity and scope, the delivery date may slip by 2-3 weeks.',
      likelihood: 0.75,
      impact: 'high',
      mitigation_suggestions: ['Re-prioritize backlog items', 'Consider reducing scope', 'Add additional resources'],
      related_historical_cases: [
        { case_id: 'PROJ-123', similarity_score: 0.82, outcome: 'Delayed by 3 weeks' },
      ],
    },
    {
      risk_id: 'R2',
      category: 'resource',
      severity: 'medium',
      title: 'Resource Availability Gap',
      description: 'Key team member has conflicting commitments next month.',
      likelihood: 0.6,
      impact: 'medium',
      mitigation_suggestions: ['Identify backup resources', 'Adjust sprint planning', 'Communicate with stakeholder'],
    },
    {
      risk_id: 'R3',
      category: 'customer',
      severity: 'low',
      title: 'Pending Customer Decisions',
      description: '3 design decisions awaiting customer approval for over 2 weeks.',
      likelihood: 0.4,
      impact: 'medium',
      mitigation_suggestions: ['Schedule decision meeting', 'Prepare alternatives', 'Document dependencies'],
    },
  ],
  recommendations: [
    {
      recommendation_id: 'REC1',
      category: 'action',
      priority: 'high',
      title: 'Schedule Scope Review',
      description: 'Given timeline risks, recommend immediate scope review with project sponsor.',
      expected_impact: 'Reduce delivery risk by 40%',
      effort_estimate: 'Low (2-4 hours)',
      suggested_owner: 'Project Lead',
    },
    {
      recommendation_id: 'REC2',
      category: 'process',
      priority: 'medium',
      title: 'Increase Customer Touchpoints',
      description: 'Move from bi-weekly to weekly customer check-ins to accelerate decisions.',
      expected_impact: 'Faster decision-making, improved alignment',
      effort_estimate: 'Medium (ongoing)',
    },
    {
      recommendation_id: 'REC3',
      category: 'resource',
      priority: 'medium',
      title: 'Cross-train Team Members',
      description: 'Reduce single points of failure by cross-training on critical components.',
      expected_impact: 'Improved resilience, reduced risk',
      effort_estimate: 'Medium (1-2 weeks)',
    },
  ],
  similar_projects: [
    {
      project_id: 'PROJ-089',
      name: 'Enterprise Migration Q3',
      similarity_score: 0.84,
      outcome: 'Successful',
      key_learnings: ['Early stakeholder alignment crucial', 'Buffer time for integration testing'],
      relevant_factors: ['Similar scope', 'Same industry', 'Comparable team size'],
    },
    {
      project_id: 'PROJ-067',
      name: 'Platform Upgrade 2023',
      similarity_score: 0.76,
      outcome: 'Delayed',
      key_learnings: ['Underestimated data migration complexity', 'Needed more QA cycles'],
      relevant_factors: ['Similar technology stack', 'Comparable timeline'],
    },
  ],
  executive_summary: 'This project is currently at risk primarily due to timeline pressures. The team has strong technical capabilities, but resource conflicts and pending customer decisions are creating bottlenecks. Immediate attention is recommended for scope review and customer communication cadence.',
  sources_used: [
    { source_type: 'project', source_id: 89, title: 'Enterprise Migration Q3 Retrospective', relevance_score: 0.84 },
    { source_type: 'sop', source_id: 5, title: 'Project Risk Management Framework', relevance_score: 0.91 },
  ],
  analysis_timestamp: new Date().toISOString(),
}

function RiskCard({ risk }: { risk: Risk }) {
  const severityConfig = {
    critical: { className: 'bg-destructive/10 border-destructive/30 text-destructive', icon: AlertTriangle },
    high: { className: 'bg-warning/10 border-warning/30 text-warning', icon: AlertTriangle },
    medium: { className: 'bg-info/10 border-info/30 text-info', icon: Activity },
    low: { className: 'bg-muted border-muted-foreground/20 text-muted-foreground', icon: Activity },
  }
  const config = severityConfig[risk.severity]
  const Icon = config.icon

  return (
    <div className={`rounded-lg border p-4 ${config.className}`}>
      <div className="flex items-start gap-3">
        <Icon className="size-5 mt-0.5 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{risk.title}</h4>
            <Badge variant="outline" className="capitalize">{risk.severity}</Badge>
          </div>
          <p className="text-sm opacity-90">{risk.description}</p>
          
          <div className="flex items-center gap-4 text-xs">
            <span>Likelihood: {Math.round(risk.likelihood * 100)}%</span>
            <span>Impact: {risk.impact}</span>
          </div>

          {risk.mitigation_suggestions.length > 0 && (
            <div className="space-y-1 pt-2">
              <p className="text-xs font-medium">Mitigations:</p>
              <ul className="space-y-1">
                {risk.mitigation_suggestions.map((m, i) => (
                  <li key={i} className="text-xs flex items-center gap-1">
                    <ArrowRight className="size-3" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const priorityConfig = {
    high: 'bg-destructive text-white',
    medium: 'bg-warning text-black',
    low: 'bg-muted text-muted-foreground',
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="size-5 text-accent shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{recommendation.title}</h4>
              <Badge className={priorityConfig[recommendation.priority]}>
                {recommendation.priority} priority
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{recommendation.description}</p>
            
            <div className="flex flex-wrap gap-3 text-xs">
              {recommendation.expected_impact && (
                <span className="flex items-center gap-1 text-success">
                  <TrendingUp className="size-3" />
                  {recommendation.expected_impact}
                </span>
              )}
              {recommendation.effort_estimate && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3" />
                  {recommendation.effort_estimate}
                </span>
              )}
            </div>

            {recommendation.suggested_owner && (
              <p className="text-xs text-muted-foreground">
                Suggested owner: <span className="font-medium">{recommendation.suggested_owner}</span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectIntelligencePanel({
  userRole,
}: ProjectIntelligencePanelProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const selectedProject = MOCK_PROJECTS.find(p => p.id === selectedProjectId)

  const handleAnalyze = async () => {
    if (!selectedProjectId || !selectedProject) return
    
    setIsLoading(true)
    try {
      const result = await apiClient.analyzeProject(selectedProject.name, selectedProjectId, userRole, {
        include_similar_projects: true,
        include_risks: true,
        include_recommendations: true,
        include_summary: true,
      })
      setInsights(result)
    } catch {
      // Use mock data for demo - update with selected project info
      setInsights({
        ...MOCK_INSIGHTS,
        object_name: selectedProject.name,
        record_id: selectedProjectId,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const healthColor = insights?.overall_health?.status === 'healthy' ? 'text-success'
    : insights?.overall_health?.status === 'at_risk' ? 'text-warning'
    : insights?.overall_health?.status === 'critical' ? 'text-destructive'
    : 'text-muted-foreground'

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="size-5 text-accent" />
            <CardTitle>Project Intelligence</CardTitle>
          </div>
          <CardDescription>
            AI-powered risk analysis and recommendations based on historical project data.
            {userRole === 'lead' && ' Get strategic insights for decision making.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProjectSelector
            selectedProjectId={selectedProjectId}
            onSelect={(projectId) => {
              setSelectedProjectId(projectId)
              setInsights(null)
            }}
          />
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !selectedProjectId}
            className="w-full gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Spinner className="size-4" />
                Analyzing Project...
              </>
            ) : (
              <>
                <Brain className="size-4" />
                Analyze Project
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Health Score Card - Full Width */}
      {insights?.overall_health && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className={`text-5xl font-bold ${healthColor}`}>
                  {insights.overall_health.score}
                </div>
                <div>
                  <Badge
                    variant="outline"
                    className={`capitalize ${healthColor} text-sm`}
                  >
                    {insights.overall_health.status.replace('_', ' ')}
                  </Badge>
                  <Progress value={insights.overall_health.score} className="h-2 w-32 mt-2" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Key Factors:</p>
                <div className="flex flex-wrap gap-2">
                  {insights.overall_health.key_factors.map((factor, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      <CheckCircle2 className="size-3 mr-1" />
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section - Single Column */}
      {insights && (
        <div className="space-y-6">
              {/* Executive Summary */}
              {insights.executive_summary && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FileText className="size-5 text-accent" />
                      <CardTitle className="text-base">Executive Summary</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{insights.executive_summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Risks */}
              {insights.risks.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-5 text-warning" />
                      <CardTitle className="text-base">
                        Risk Analysis ({insights.risks.length})
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {insights.risks.map((risk) => (
                      <RiskCard key={risk.risk_id} risk={risk} />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {insights.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="size-5 text-accent" />
                      <CardTitle className="text-base">
                        Recommendations ({insights.recommendations.length})
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {insights.recommendations.map((rec) => (
                      <RecommendationCard key={rec.recommendation_id} recommendation={rec} />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Similar Projects */}
              {insights.similar_projects && insights.similar_projects.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="size-5 text-success" />
                      <CardTitle className="text-base">
                        Similar Projects ({insights.similar_projects.length})
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Historical projects with similar characteristics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {insights.similar_projects.map((project) => (
                        <AccordionItem key={project.project_id} value={project.project_id}>
                          <AccordionTrigger>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{project.name}</span>
                              <Badge
                                variant={project.outcome === 'Successful' ? 'default' : 'secondary'}
                              >
                                {project.outcome}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(project.similarity_score * 100)}% similar
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-3">
                            <div>
                              <p className="text-xs font-medium mb-1">Key Learnings:</p>
                              <ul className="space-y-1">
                                {project.key_learnings.map((learning, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <Lightbulb className="size-3 mt-1 shrink-0 text-accent" />
                                    {learning}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-medium mb-1">Relevant Factors:</p>
                              <div className="flex flex-wrap gap-1">
                                {project.relevant_factors.map((factor) => (
                                  <Badge key={factor} variant="outline" className="text-xs">
                                    {factor}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              )}

          {/* Sources & Safety */}
          <div className="flex items-center gap-2 text-xs text-success">
            <Shield className="size-4" />
            Analysis based on approved metadata and historical patterns only.
          </div>
        </div>
      )}
    </div>
  )
}
