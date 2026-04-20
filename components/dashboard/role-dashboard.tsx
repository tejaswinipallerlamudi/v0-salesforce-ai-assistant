'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { UserRole } from '@/types'
import {
  MessageCircle,
  Brain,
  BookOpen,
  Settings,
  Lightbulb,
  HelpCircle,
  ListChecks,
  TrendingUp,
  AlertTriangle,
  FileText,
  Users,
  Shield,
  Activity,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
} from 'lucide-react'

interface RoleDashboardProps {
  userRole: UserRole
  userName: string
  onNavigate: (tab: string) => void
}

interface FeatureCard {
  id: string
  tab: string
  title: string
  description: string
  icon: React.ElementType
  features: string[]
  color: string
  badge?: string
}

// Define features available to each role
const ROLE_FEATURES: Record<UserRole, FeatureCard[]> = {
  intern: [
    {
      id: 'buddy',
      tab: 'buddy',
      title: 'Salesforce Buddy',
      description: 'Your AI-powered assistant for understanding Salesforce pages, fields, and processes.',
      icon: MessageCircle,
      features: [
        'Explain This Page - Get detailed explanations of any Salesforce page',
        'Ask Questions - Get instant answers about Salesforce objects and fields',
        'Guided Steps - Follow step-by-step workflows for common tasks',
        'Field Descriptions - Understand what each field means and how to use it',
      ],
      color: 'text-blue-600',
      badge: 'AI-Powered',
    },
  ],
  lead: [
    {
      id: 'buddy',
      tab: 'buddy',
      title: 'Salesforce Buddy',
      description: 'AI assistant for Salesforce guidance, page explanations, and workflow support.',
      icon: MessageCircle,
      features: [
        'Explain This Page - Detailed page and field explanations',
        'Ask Questions - Get answers about processes and objects',
        'Guided Steps - Step-by-step workflow guidance',
      ],
      color: 'text-blue-600',
      badge: 'AI-Powered',
    },
    {
      id: 'intelligence',
      tab: 'intelligence',
      title: 'Project Intelligence',
      description: 'Analyze project health, identify risks, and get AI-driven insights for better decisions.',
      icon: Brain,
      features: [
        'Project Health Scores - Overall health assessment of projects',
        'Risk Analysis - Identify and mitigate potential risks early',
        'Similar Projects - Learn from past project outcomes',
        'AI Recommendations - Get actionable suggestions',
      ],
      color: 'text-purple-600',
      badge: 'Analytics',
    },
    {
      id: 'knowledge',
      tab: 'knowledge',
      title: 'Knowledge Base',
      description: 'Access and contribute to the team knowledge repository of SOPs and best practices.',
      icon: BookOpen,
      features: [
        'SOPs & Guides - Access standard operating procedures',
        'KT Notes - Knowledge transfer documentation',
        'Field Guides - Detailed field-level documentation',
        'Add Documents - Contribute new knowledge articles',
      ],
      color: 'text-emerald-600',
      badge: 'Documentation',
    },
  ],
  admin: [
    {
      id: 'buddy',
      tab: 'buddy',
      title: 'Salesforce Buddy',
      description: 'AI assistant for Salesforce guidance and support across the team.',
      icon: MessageCircle,
      features: [
        'Page Explanations - AI-powered field and page insights',
        'Q&A Support - Instant answers for team queries',
        'Workflow Guidance - Step-by-step process help',
      ],
      color: 'text-blue-600',
      badge: 'AI-Powered',
    },
    {
      id: 'intelligence',
      tab: 'intelligence',
      title: 'Project Intelligence',
      description: 'Comprehensive project analytics with team oversight and phase tracking.',
      icon: Brain,
      features: [
        'All Projects Overview - View all team projects and phases',
        'Team & Phase Tracking - See teams and their current phases',
        'Risk Identification - Proactive risk detection',
        'Historical Analysis - Learn from similar past projects',
      ],
      color: 'text-purple-600',
      badge: 'Admin View',
    },
    {
      id: 'knowledge',
      tab: 'knowledge',
      title: 'Knowledge Base',
      description: 'Manage the organizational knowledge repository and documentation.',
      icon: BookOpen,
      features: [
        'Full Document Management - Create, edit, publish documents',
        'Content Approval - Review and approve submissions',
        'Version Control - Track document history',
        'File Uploads - Upload documents directly',
      ],
      color: 'text-emerald-600',
      badge: 'Full Access',
    },
    {
      id: 'admin',
      tab: 'admin',
      title: 'Administration',
      description: 'Manage users, permissions, and system configuration.',
      icon: Settings,
      features: [
        'User Management - Add, edit, and remove users',
        'Role Assignment - Configure user permissions',
        'Audit Logs - Track system activity',
        'System Settings - Configure application behavior',
      ],
      color: 'text-orange-600',
      badge: 'Admin Only',
    },
  ],
}

// Role descriptions and quick stats
const ROLE_INFO: Record<UserRole, { title: string; description: string; tips: string[] }> = {
  intern: {
    title: 'Welcome, Team Member',
    description: 'Access Salesforce guidance and support to help you work more efficiently.',
    tips: [
      'Use "Explain This Page" when you encounter unfamiliar Salesforce screens',
      'Ask questions in natural language - the AI understands context',
      'Follow Guided Steps for complex processes to ensure accuracy',
    ],
  },
  lead: {
    title: 'Welcome, Team Lead',
    description: 'Manage projects, access analytics, and guide your team with AI-powered insights.',
    tips: [
      'Check Project Intelligence regularly for early risk detection',
      'Use the Knowledge Base to share best practices with your team',
      'Monitor project health scores to prioritize attention',
    ],
  },
  admin: {
    title: 'Welcome, Administrator',
    description: 'Full platform access to manage users, oversee all projects, and configure the system.',
    tips: [
      'Review team performance across all projects in Project Intelligence',
      'Keep the Knowledge Base up to date with approved documentation',
      'Monitor audit logs for compliance and security',
    ],
  },
}

export function RoleDashboard({ userRole, userName, onNavigate }: RoleDashboardProps) {
  const features = ROLE_FEATURES[userRole]
  const roleInfo = ROLE_INFO[userRole]
  
  // Get first name for greeting
  const firstName = userName.split(' ')[0]
  
  // Get current time for greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="rounded-xl border bg-gradient-to-r from-muted/50 to-muted/30 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {greeting}, {firstName}
            </h1>
            <p className="text-muted-foreground">{roleInfo.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 px-3 py-1">
              <Shield className="size-3.5" />
              {userRole === 'admin' ? 'Administrator' : userRole === 'lead' ? 'Team Lead' : 'Team Member'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            <CardTitle className="text-base">Quick Tips for Your Role</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {roleInfo.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Target className="size-4 mt-0.5 shrink-0 text-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Feature Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card 
              key={feature.id} 
              className="group relative overflow-hidden transition-all hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg bg-muted p-2.5 ${feature.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      {feature.badge && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {feature.features.map((item, index) => {
                    const [title, desc] = item.split(' - ')
                    return (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                        <span>
                          <span className="font-medium">{title}</span>
                          {desc && <span className="text-muted-foreground"> - {desc}</span>}
                        </span>
                      </li>
                    )
                  })}
                </ul>
                <Button 
                  variant="secondary" 
                  className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => onNavigate(feature.tab)}
                >
                  Open {feature.title}
                  <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Role-specific additional info */}
      {userRole === 'admin' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-primary" />
              <CardTitle className="text-base">System Overview</CardTitle>
            </div>
            <CardDescription>
              Quick access to administrative functions and system status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4 text-center">
                <Users className="size-6 mx-auto text-muted-foreground" />
                <p className="mt-2 text-2xl font-semibold">3</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <FileText className="size-6 mx-auto text-muted-foreground" />
                <p className="mt-2 text-2xl font-semibold">6</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <BookOpen className="size-6 mx-auto text-muted-foreground" />
                <p className="mt-2 text-2xl font-semibold">5</p>
                <p className="text-xs text-muted-foreground">KB Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
