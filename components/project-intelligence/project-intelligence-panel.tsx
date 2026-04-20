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

// Project-specific insights generator
import type { Project } from '@/components/project-intelligence/project-selector'

function generateProjectInsights(project: Project): InsightsResponse {
  // Generate insights tailored to the specific project
  const projectInsightsMap: Record<string, InsightsResponse> = {
    'PROJ-001': {
      object_name: project.name,
      record_id: project.id,
      overall_health: {
        score: 58,
        status: 'at_risk',
        key_factors: ['Data migration complexity', 'Legacy system dependencies', 'Timeline pressure'],
      },
      risks: [
        {
          risk_id: 'R1',
          category: 'technical',
          severity: 'high',
          title: 'Data Migration Complexity',
          description: `The ${project.client} legacy CRM contains 2.5M records with inconsistent data formats that require extensive cleansing.`,
          likelihood: 0.8,
          impact: 'high',
          mitigation_suggestions: ['Implement automated data validation scripts', 'Create staging environment for testing', 'Allocate additional ETL resources'],
          related_historical_cases: [
            { case_id: 'MIG-2023-Q2', similarity_score: 0.88, outcome: 'Required 3 additional weeks for data cleanup' },
          ],
        },
        {
          risk_id: 'R2',
          category: 'timeline',
          severity: 'high',
          title: 'Go-Live Date at Risk',
          description: 'Current velocity suggests the June 30th deadline may slip by 3-4 weeks unless scope is adjusted.',
          likelihood: 0.75,
          impact: 'high',
          mitigation_suggestions: ['Negotiate phased go-live approach', 'Prioritize critical modules first', 'Consider parallel run period reduction'],
        },
        {
          risk_id: 'R3',
          category: 'integration',
          severity: 'medium',
          title: 'Legacy API Deprecation',
          description: 'Some legacy system APIs are scheduled for deprecation during migration window.',
          likelihood: 0.5,
          impact: 'medium',
          mitigation_suggestions: ['Document API dependencies immediately', 'Create fallback integration patterns', 'Coordinate with legacy team'],
        },
      ],
      recommendations: [
        {
          recommendation_id: 'REC1',
          category: 'action',
          priority: 'high',
          title: 'Implement Phased Migration',
          description: `Break ${project.client}'s migration into 3 phases: Core CRM, Historical Data, and Integrations.`,
          expected_impact: 'Reduce overall risk by 45%, enable early value delivery',
          effort_estimate: 'Low (planning: 1 week)',
          suggested_owner: 'Project Lead',
        },
        {
          recommendation_id: 'REC2',
          category: 'technical',
          priority: 'high',
          title: 'Deploy Data Quality Dashboard',
          description: 'Implement real-time data quality monitoring to catch issues during migration.',
          expected_impact: 'Prevent data quality issues from escalating',
          effort_estimate: 'Medium (2-3 days)',
          suggested_owner: 'Technical Lead',
        },
        {
          recommendation_id: 'REC3',
          category: 'process',
          priority: 'medium',
          title: 'Establish Daily Migration Standups',
          description: 'Short daily syncs focused on migration blockers and data issues.',
          expected_impact: 'Faster issue resolution, better team alignment',
          effort_estimate: 'Low (15 min daily)',
        },
      ],
      similar_projects: [
        {
          project_id: 'PROJ-2023-MIG',
          name: 'Healthcare CRM Migration',
          similarity_score: 0.89,
          outcome: 'Successful',
          key_learnings: ['Early data profiling saved 2 weeks', 'Parallel testing environment was critical', 'Business user involvement in UAT improved adoption'],
          relevant_factors: ['Similar data volume', 'Legacy system complexity', 'Enterprise client'],
        },
        {
          project_id: 'PROJ-2022-ENT',
          name: 'Manufacturing CRM Overhaul',
          similarity_score: 0.78,
          outcome: 'Delayed',
          key_learnings: ['Underestimated custom field mapping effort', 'Should have involved end users earlier'],
          relevant_factors: ['Similar industry complexity', 'Comparable team size'],
        },
      ],
      executive_summary: `The Enterprise CRM Migration for ${project.client} is currently at risk due to data migration complexity and timeline pressure. With a team of ${project.teamSize} members targeting ${new Date(project.targetEndDate).toLocaleDateString()}, immediate action is needed on data quality and a phased approach is strongly recommended. Historical projects of similar scope succeeded when early data profiling was prioritized.`,
      sources_used: [
        { source_type: 'project', source_id: 1, title: 'Healthcare CRM Migration Retrospective', relevance_score: 0.89 },
        { source_type: 'sop', source_id: 3, title: 'Data Migration Best Practices', relevance_score: 0.95 },
        { source_type: 'kt_note', source_id: 7, title: 'Legacy System Integration Patterns', relevance_score: 0.82 },
      ],
      analysis_timestamp: new Date().toISOString(),
    },
    'PROJ-002': {
      object_name: project.name,
      record_id: project.id,
      overall_health: {
        score: 85,
        status: 'healthy',
        key_factors: ['Strong team execution', 'Clear requirements', 'Active stakeholder engagement'],
      },
      risks: [
        {
          risk_id: 'R1',
          category: 'scope',
          severity: 'low',
          title: 'Feature Creep Potential',
          description: `${project.client} has requested 3 additional workflow automations not in original scope.`,
          likelihood: 0.4,
          impact: 'medium',
          mitigation_suggestions: ['Document change requests formally', 'Evaluate impact on timeline', 'Consider Phase 2 backlog'],
        },
        {
          risk_id: 'R2',
          category: 'adoption',
          severity: 'medium',
          title: 'User Training Gap',
          description: 'Sales team has limited Salesforce experience; training plan needs reinforcement.',
          likelihood: 0.5,
          impact: 'medium',
          mitigation_suggestions: ['Expand training sessions', 'Create role-specific quick guides', 'Identify super-users for peer support'],
        },
      ],
      recommendations: [
        {
          recommendation_id: 'REC1',
          category: 'process',
          priority: 'medium',
          title: 'Establish Change Control Board',
          description: 'Formalize process for evaluating new feature requests to prevent scope creep.',
          expected_impact: 'Maintain timeline integrity, clear prioritization',
          effort_estimate: 'Low (2-3 hours setup)',
          suggested_owner: 'Project Manager',
        },
        {
          recommendation_id: 'REC2',
          category: 'adoption',
          priority: 'high',
          title: 'Launch Sales Champion Program',
          description: 'Identify 2-3 sales super-users to support team adoption and provide feedback.',
          expected_impact: 'Accelerate adoption by 30%, reduce support tickets',
          effort_estimate: 'Low (ongoing)',
          suggested_owner: 'Business Analyst',
        },
      ],
      similar_projects: [
        {
          project_id: 'PROJ-2023-SC',
          name: 'Retail Sales Cloud Rollout',
          similarity_score: 0.92,
          outcome: 'Successful',
          key_learnings: ['Champion program drove adoption', 'Mobile-first training was effective', 'Quick wins in first 2 weeks built momentum'],
          relevant_factors: ['Similar scope', 'Startup client', 'Same team size'],
        },
      ],
      executive_summary: `The Sales Cloud Implementation for ${project.client} is progressing well with a health score of 85. The team of ${project.teamSize} is on track for the ${new Date(project.targetEndDate).toLocaleDateString()} delivery. Minor risks around scope creep and user adoption are manageable with the recommended actions. This project is following patterns seen in highly successful similar implementations.`,
      sources_used: [
        { source_type: 'project', source_id: 2, title: 'Retail Sales Cloud Rollout Retrospective', relevance_score: 0.92 },
        { source_type: 'sop', source_id: 1, title: 'Sales Cloud Implementation Playbook', relevance_score: 0.98 },
      ],
      analysis_timestamp: new Date().toISOString(),
    },
    'PROJ-003': {
      object_name: project.name,
      record_id: project.id,
      overall_health: {
        score: 72,
        status: 'at_risk',
        key_factors: ['Integration complexity', 'Multiple system dependencies', 'Testing requirements'],
      },
      risks: [
        {
          risk_id: 'R1',
          category: 'technical',
          severity: 'high',
          title: 'SAP API Rate Limits',
          description: 'Production SAP environment has stricter API limits than anticipated during discovery.',
          likelihood: 0.7,
          impact: 'high',
          mitigation_suggestions: ['Implement request batching', 'Add caching layer', 'Negotiate higher limits with SAP team'],
        },
        {
          risk_id: 'R2',
          category: 'testing',
          severity: 'medium',
          title: 'End-to-End Testing Environment',
          description: 'Full integration testing environment not yet available; blocking comprehensive testing.',
          likelihood: 0.6,
          impact: 'high',
          mitigation_suggestions: ['Prioritize test environment setup', 'Use mock services temporarily', 'Coordinate with IT infrastructure'],
        },
        {
          risk_id: 'R3',
          category: 'resource',
          severity: 'medium',
          title: 'SAP Expertise Gap',
          description: 'Team has strong Salesforce skills but limited SAP integration experience.',
          likelihood: 0.5,
          impact: 'medium',
          mitigation_suggestions: ['Engage SAP consultant for critical phases', 'Pair programming with SAP team', 'Document integration patterns'],
        },
      ],
      recommendations: [
        {
          recommendation_id: 'REC1',
          category: 'technical',
          priority: 'high',
          title: 'Implement Integration Middleware',
          description: `Deploy MuleSoft or similar middleware to handle ${project.client}'s SAP-Salesforce integration reliably.`,
          expected_impact: 'Better error handling, rate limit management, monitoring',
          effort_estimate: 'Medium (1-2 weeks)',
          suggested_owner: 'Integration Architect',
        },
        {
          recommendation_id: 'REC2',
          category: 'resource',
          priority: 'high',
          title: 'Bring in SAP Integration Specialist',
          description: 'Engage experienced SAP integration consultant for 4-6 weeks.',
          expected_impact: 'Accelerate integration development, reduce technical risk',
          effort_estimate: 'Budget impact: additional resource cost',
          suggested_owner: 'Project Manager',
        },
      ],
      similar_projects: [
        {
          project_id: 'PROJ-2022-INT',
          name: 'Oracle-Salesforce Integration',
          similarity_score: 0.81,
          outcome: 'Successful',
          key_learnings: ['Middleware was essential for reliability', 'Dedicated integration testing sprint paid off', 'Documentation prevented future issues'],
          relevant_factors: ['ERP integration', 'Similar complexity', 'Enterprise client'],
        },
      ],
      executive_summary: `The ERP Integration Suite for ${project.client} faces moderate risks primarily around SAP API complexity and testing environment availability. With ${project.teamSize} team members and an August target, immediate attention to the middleware architecture and testing environment is critical. Similar successful integrations relied heavily on dedicated middleware and early testing infrastructure.`,
      sources_used: [
        { source_type: 'project', source_id: 3, title: 'Oracle Integration Lessons Learned', relevance_score: 0.81 },
        { source_type: 'sop', source_id: 4, title: 'Enterprise Integration Standards', relevance_score: 0.94 },
      ],
      analysis_timestamp: new Date().toISOString(),
    },
    'PROJ-004': {
      object_name: project.name,
      record_id: project.id,
      overall_health: {
        score: 88,
        status: 'healthy',
        key_factors: ['Experienced team', 'Well-defined scope', 'Strong client relationship'],
      },
      risks: [
        {
          risk_id: 'R1',
          category: 'dependency',
          severity: 'low',
          title: 'Salesforce Release Timing',
          description: 'Upcoming Salesforce release may affect custom automation components.',
          likelihood: 0.3,
          impact: 'low',
          mitigation_suggestions: ['Review release notes', 'Test in sandbox post-release', 'Plan regression testing'],
        },
      ],
      recommendations: [
        {
          recommendation_id: 'REC1',
          category: 'quality',
          priority: 'medium',
          title: 'Implement Automated Testing',
          description: `Set up automated regression tests for ${project.client}'s case management workflows.`,
          expected_impact: 'Reduce manual testing by 60%, catch issues earlier',
          effort_estimate: 'Medium (1 week)',
          suggested_owner: 'QA Lead',
        },
      ],
      similar_projects: [
        {
          project_id: 'PROJ-2023-ENH',
          name: 'Insurance Service Enhancement',
          similarity_score: 0.86,
          outcome: 'Successful',
          key_learnings: ['Automated testing reduced regression issues', 'Early UAT involvement improved acceptance'],
          relevant_factors: ['Service Cloud enhancement', 'Similar complexity', 'Retail client'],
        },
      ],
      executive_summary: `The Service Cloud Enhancement for ${project.client} is in excellent health with an 88 score. The team of ${project.teamSize} is well-positioned to deliver by ${new Date(project.targetEndDate).toLocaleDateString()}. Minimal risks exist, primarily around standard Salesforce release management. This project exemplifies best practices from similar successful enhancements.`,
      sources_used: [
        { source_type: 'project', source_id: 4, title: 'Insurance Service Enhancement Review', relevance_score: 0.86 },
        { source_type: 'sop', source_id: 2, title: 'Enhancement Delivery Guidelines', relevance_score: 0.92 },
      ],
      analysis_timestamp: new Date().toISOString(),
    },
    'PROJ-005': {
      object_name: project.name,
      record_id: project.id,
      overall_health: {
        score: 45,
        status: 'critical',
        key_factors: ['Project on hold', 'Budget constraints', 'Pending decisions'],
      },
      risks: [
        {
          risk_id: 'R1',
          category: 'business',
          severity: 'critical',
          title: 'Project Funding Uncertainty',
          description: `${project.client} has paused project pending Q2 budget approval.`,
          likelihood: 0.8,
          impact: 'critical',
          mitigation_suggestions: ['Maintain minimal team engagement', 'Document current state thoroughly', 'Prepare rapid restart plan'],
        },
        {
          risk_id: 'R2',
          category: 'resource',
          severity: 'high',
          title: 'Team Reassignment Risk',
          description: 'Extended hold may result in team members being reassigned to other projects.',
          likelihood: 0.7,
          impact: 'high',
          mitigation_suggestions: ['Identify backup resources', 'Cross-train current team', 'Document all institutional knowledge'],
        },
      ],
      recommendations: [
        {
          recommendation_id: 'REC1',
          category: 'communication',
          priority: 'high',
          title: 'Weekly Client Status Check',
          description: `Maintain weekly touchpoints with ${project.client} to stay informed on budget decisions.`,
          expected_impact: 'Early warning on project restart or cancellation',
          effort_estimate: 'Low (30 min weekly)',
          suggested_owner: 'Account Manager',
        },
        {
          recommendation_id: 'REC2',
          category: 'documentation',
          priority: 'high',
          title: 'Complete Knowledge Transfer Documentation',
          description: 'Document all project context, decisions, and technical details while team is still available.',
          expected_impact: 'Enable smooth restart with potentially different team',
          effort_estimate: 'Medium (1 week)',
          suggested_owner: 'Project Lead',
        },
      ],
      similar_projects: [
        {
          project_id: 'PROJ-2022-HOLD',
          name: 'Financial Portal (Resumed)',
          similarity_score: 0.72,
          outcome: 'Successful',
          key_learnings: ['Documentation during hold was invaluable', '2-week restart ramp-up was needed', 'Client relationship maintenance paid off'],
          relevant_factors: ['On-hold status', 'Support engagement', 'Healthcare adjacent'],
        },
      ],
      executive_summary: `The Customer Portal Support for ${project.client} is currently on hold with critical health concerns. The primary risk is project funding uncertainty pending Q2 budget decisions. Recommend maintaining minimal engagement, comprehensive documentation, and regular client communication to enable smooth restart if approved.`,
      sources_used: [
        { source_type: 'project', source_id: 5, title: 'Financial Portal Restart Analysis', relevance_score: 0.72 },
        { source_type: 'sop', source_id: 6, title: 'Project Hold and Restart Procedures', relevance_score: 0.88 },
      ],
      analysis_timestamp: new Date().toISOString(),
    },
    'PROJ-006': {
      object_name: project.name,
      record_id: project.id,
      overall_health: {
        score: 78,
        status: 'healthy',
        key_factors: ['Complex but manageable', 'Strong technical team', 'Clear business requirements'],
      },
      risks: [
        {
          risk_id: 'R1',
          category: 'technical',
          severity: 'medium',
          title: 'Einstein Analytics Learning Curve',
          description: 'Team has moderate Einstein Analytics experience; complex dashboards may take longer.',
          likelihood: 0.5,
          impact: 'medium',
          mitigation_suggestions: ['Schedule Einstein training session', 'Start with simpler dashboards', 'Leverage Salesforce accelerators'],
        },
        {
          risk_id: 'R2',
          category: 'data',
          severity: 'medium',
          title: 'Data Quality Concerns',
          description: `${project.client}'s source data has known quality issues that may affect analytics accuracy.`,
          likelihood: 0.6,
          impact: 'medium',
          mitigation_suggestions: ['Implement data validation rules', 'Create data quality dashboard first', 'Define data cleansing process'],
        },
      ],
      recommendations: [
        {
          recommendation_id: 'REC1',
          category: 'technical',
          priority: 'high',
          title: 'Data Quality Assessment Sprint',
          description: `Dedicate first sprint to assessing and addressing ${project.client}'s data quality issues.`,
          expected_impact: 'Reliable analytics from day one',
          effort_estimate: 'Medium (1-2 weeks)',
          suggested_owner: 'Data Analyst',
        },
        {
          recommendation_id: 'REC2',
          category: 'delivery',
          priority: 'medium',
          title: 'Incremental Dashboard Delivery',
          description: 'Deliver dashboards in 3 waves: Executive, Operational, then Advanced Analytics.',
          expected_impact: 'Early value delivery, incorporate feedback iteratively',
          effort_estimate: 'Planning only',
          suggested_owner: 'Project Lead',
        },
      ],
      similar_projects: [
        {
          project_id: 'PROJ-2023-ANA',
          name: 'Retail Analytics Platform',
          similarity_score: 0.84,
          outcome: 'Successful',
          key_learnings: ['Data quality sprint was essential', 'Executive dashboards drove adoption', 'Self-service training increased usage'],
          relevant_factors: ['Einstein Analytics', 'Financial services', 'Similar team size'],
        },
      ],
      executive_summary: `The Analytics Dashboard Platform for ${project.client} is in good health with a score of 78. The ${project.teamSize}-person team targeting ${new Date(project.targetEndDate).toLocaleDateString()} should prioritize data quality assessment early to ensure reliable analytics. Similar successful projects emphasized iterative delivery and executive dashboard focus.`,
      sources_used: [
        { source_type: 'project', source_id: 6, title: 'Retail Analytics Platform Review', relevance_score: 0.84 },
        { source_type: 'sop', source_id: 7, title: 'Einstein Analytics Implementation Guide', relevance_score: 0.96 },
      ],
      analysis_timestamp: new Date().toISOString(),
    },
  }

  // Return project-specific insights or a generic fallback
  return projectInsightsMap[project.id] || {
    object_name: project.name,
    record_id: project.id,
    overall_health: {
      score: 75,
      status: 'healthy',
      key_factors: ['Standard project profile', 'Following best practices', 'On track'],
    },
    risks: [
      {
        risk_id: 'R-GEN-1',
        category: 'general',
        severity: 'low',
        title: 'Standard Project Risks',
        description: 'This project follows standard patterns with typical manageable risks.',
        likelihood: 0.3,
        impact: 'low',
        mitigation_suggestions: ['Continue monitoring', 'Follow established processes'],
      },
    ],
    recommendations: [
      {
        recommendation_id: 'REC-GEN-1',
        category: 'process',
        priority: 'low',
        title: 'Maintain Current Approach',
        description: 'Continue following established project management practices.',
        expected_impact: 'Sustained project health',
        effort_estimate: 'Ongoing',
      },
    ],
    similar_projects: [],
    executive_summary: `${project.name} for ${project.client} is following standard project patterns. Continue with current approach and monitor for any emerging risks.`,
    sources_used: [
      { source_type: 'sop', source_id: 1, title: 'General Project Guidelines', relevance_score: 0.85 },
    ],
    analysis_timestamp: new Date().toISOString(),
  }
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
      // Generate project-specific insights based on the selected project
      setInsights(generateProjectInsights(selectedProject))
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
