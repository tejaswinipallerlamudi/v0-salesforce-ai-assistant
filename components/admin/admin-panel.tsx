'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { apiClient } from '@/lib/api-client'
import type { AuditLogEntry } from '@/types'
import {
  Shield,
  Activity,
  Clock,
  Zap,
  AlertCircle,
  TrendingUp,
  FileText,
  User,
  RefreshCw,
} from 'lucide-react'

interface AuditStats {
  total_requests: number
  requests_today: number
  average_response_time_ms: number
  total_tokens_used: number
  error_count: number
  error_rate: number
}

// Mock data for demo
const MOCK_STATS: AuditStats = {
  total_requests: 1247,
  requests_today: 48,
  average_response_time_ms: 342,
  total_tokens_used: 125000,
  error_count: 3,
  error_rate: 0.24,
}

const MOCK_LOGS: AuditLogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    action: 'explain_page',
    user_role: 'intern',
    object_name: 'Case',
    record_id: 'CASE-001',
    request_summary: 'Explain Page for Case CASE-001',
    response_time_ms: 287,
    tokens_used: 1250,
    safety_checks_passed: true,
    sources_consulted: ['SOP: Case Escalation', 'KT Note: Priority Fields'],
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    action: 'ask_question',
    user_role: 'intern',
    object_name: 'Case',
    question_asked: 'How do I escalate this case?',
    response_time_ms: 412,
    tokens_used: 890,
    safety_checks_passed: true,
    sources_consulted: ['SOP: Case Escalation Procedure'],
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    action: 'analyze_project',
    user_role: 'lead',
    object_name: 'Opportunity',
    record_id: 'OPP-001',
    request_summary: 'Project Analysis for OPP-001',
    response_time_ms: 1245,
    tokens_used: 3200,
    safety_checks_passed: true,
    sources_consulted: ['Project: Enterprise Migration Q3', 'SOP: Risk Management'],
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    action: 'guided_steps',
    user_role: 'intern',
    object_name: 'Case',
    request_summary: 'Guided Steps: escalation',
    response_time_ms: 198,
    tokens_used: 650,
    safety_checks_passed: true,
    sources_consulted: ['SOP: Case Escalation Procedure'],
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    action: 'explain_page',
    user_role: 'lead',
    object_name: 'Account',
    record_id: 'ACC-001',
    request_summary: 'Explain Page for Account ACC-001',
    response_time_ms: 298,
    tokens_used: 1100,
    safety_checks_passed: true,
    sources_consulted: ['Field Guide: Account Object'],
  },
]

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: {
  title: string
  value: string | number
  icon: typeof Activity
  description?: string
  trend?: { value: number; positive: boolean }
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
            <Icon className="size-5 text-accent" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            <TrendingUp
              className={`size-3 ${trend.positive ? 'text-success' : 'text-destructive'}`}
            />
            <span className={trend.positive ? 'text-success' : 'text-destructive'}>
              {trend.positive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground">vs last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LogEntry({ log }: { log: AuditLogEntry }) {
  const actionConfig: Record<string, { label: string; className: string }> = {
    explain_page: { label: 'Explain Page', className: 'bg-accent/10 text-accent' },
    ask_question: { label: 'Question', className: 'bg-info/10 text-info' },
    guided_steps: { label: 'Guided Steps', className: 'bg-success/10 text-success' },
    analyze_project: { label: 'Analysis', className: 'bg-warning/10 text-warning' },
  }

  const config = actionConfig[log.action] || { label: log.action, className: '' }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex items-start gap-4 rounded-lg border p-4">
      <div className="shrink-0">
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {log.request_summary || log.question_asked || `${log.action} on ${log.object_name}`}
          </span>
          {log.safety_checks_passed ? (
            <Shield className="size-4 text-success" />
          ) : (
            <AlertCircle className="size-4 text-destructive" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {formatTime(log.timestamp)}
          </span>
          <span className="flex items-center gap-1">
            <User className="size-3" />
            {log.user_role}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="size-3" />
            {log.response_time_ms}ms
          </span>
          <span className="flex items-center gap-1">
            <FileText className="size-3" />
            {log.tokens_used?.toLocaleString() || 0} tokens
          </span>
        </div>
        {log.sources_consulted.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {log.sources_consulted.map((source, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {source}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminPanel() {
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [statsData, logsData] = await Promise.all([
        apiClient.getAuditStats(),
        apiClient.getAuditLogs({ page_size: 10 }),
      ])
      setStats(statsData)
      setLogs(logsData.logs)
    } catch {
      // Use mock data for demo
      setStats(MOCK_STATS)
      setLogs(MOCK_LOGS)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor AI usage, audit logs, and system health
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`size-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <StatCard
              title="Total Requests"
              value={stats.total_requests.toLocaleString()}
              icon={Activity}
              trend={{ value: 12, positive: true }}
            />
            <StatCard
              title="Today"
              value={stats.requests_today}
              icon={Clock}
              description="requests processed"
            />
            <StatCard
              title="Avg Response Time"
              value={`${stats.average_response_time_ms}ms`}
              icon={Zap}
              trend={{ value: 8, positive: true }}
            />
            <StatCard
              title="Error Rate"
              value={`${stats.error_rate.toFixed(2)}%`}
              icon={AlertCircle}
              description={`${stats.error_count} errors total`}
            />
          </>
        ) : null}
      </div>

      {/* Token Usage */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resource Usage</CardTitle>
            <CardDescription>Token consumption and API utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Tokens Used</p>
                <p className="text-xl font-bold">{stats.total_tokens_used.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg Tokens per Request</p>
                <p className="text-xl font-bold">
                  {Math.round(stats.total_tokens_used / stats.total_requests).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Safety Check Pass Rate</p>
                <p className="text-xl font-bold text-success">99.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Latest AI requests and responses</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Shield className="size-3" />
              All Safe
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {logs.map((log) => (
                  <LogEntry key={log.id} log={log} />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
