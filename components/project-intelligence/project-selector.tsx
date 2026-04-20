'use client'

import { useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { 
  Folder, 
  Rocket, 
  Settings, 
  Database,
  Globe,
  Server,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Users
} from 'lucide-react'

export interface ProjectPhase {
  id: string
  name: string
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked'
  startDate: string
  endDate: string
  progress: number // 0-100
}

export interface ProjectTeam {
  id: string
  name: string
  role: string // e.g., "Development", "QA", "Business Analysis", "Integration"
  members: string[]
  lead: string
  currentPhase: string // Phase ID they're working on
}

export interface Project {
  id: string
  name: string
  code: string
  type: 'implementation' | 'migration' | 'integration' | 'support' | 'enhancement'
  status: 'active' | 'at_risk' | 'on_hold' | 'completed'
  client: string
  startDate: string
  targetEndDate: string
  teamSize: number
  description: string
  // User assignment fields
  ownerId: string // User ID of the project owner
  ownerName: string
  participantIds: string[] // User IDs of team members
  participantNames: string[]
  // Teams and phases (for admin view)
  phases: ProjectPhase[]
  teams: ProjectTeam[]
}

interface ProjectSelectorProps {
  selectedProjectId: string
  onSelect: (projectId: string) => void
}

const projectTypeIcons: Record<string, typeof Folder> = {
  implementation: Rocket,
  migration: Database,
  integration: Settings,
  support: Server,
  enhancement: Globe,
}

const projectTypeLabels: Record<string, string> = {
  implementation: 'Implementation',
  migration: 'Migration',
  integration: 'Integration',
  support: 'Support',
  enhancement: 'Enhancement',
}

const statusConfig: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  active: { label: 'Active', className: 'bg-success/10 text-success', icon: CheckCircle2 },
  at_risk: { label: 'At Risk', className: 'bg-warning/10 text-warning', icon: AlertCircle },
  on_hold: { label: 'On Hold', className: 'bg-muted text-muted-foreground', icon: Clock },
  completed: { label: 'Completed', className: 'bg-info/10 text-info', icon: CheckCircle2 },
}

// Mock projects for demo - with user assignments
// User IDs: user-001 (intern/Alex), user-002 (lead/Sarah), user-003 (admin/Michael)
const MOCK_PROJECTS: Project[] = [
  {
    id: 'PROJ-001',
    name: 'Enterprise CRM Migration',
    code: 'ECM-2024',
    type: 'migration',
    status: 'at_risk',
    client: 'Acme Corporation',
    startDate: '2024-01-15',
    targetEndDate: '2024-06-30',
    teamSize: 8,
    description: 'Full CRM platform migration from legacy system to Salesforce',
    ownerId: 'user-002',
    ownerName: 'Sarah Mitchell',
    participantIds: ['user-001', 'user-003'],
    participantNames: ['Alex Johnson', 'Michael Chen'],
    phases: [
      { id: 'PH1-001', name: 'Discovery & Assessment', status: 'completed', startDate: '2024-01-15', endDate: '2024-02-15', progress: 100 },
      { id: 'PH2-001', name: 'Data Mapping & ETL Design', status: 'completed', startDate: '2024-02-16', endDate: '2024-03-15', progress: 100 },
      { id: 'PH3-001', name: 'Data Migration', status: 'in_progress', startDate: '2024-03-16', endDate: '2024-05-15', progress: 45 },
      { id: 'PH4-001', name: 'Integration Testing', status: 'not_started', startDate: '2024-05-16', endDate: '2024-06-10', progress: 0 },
      { id: 'PH5-001', name: 'UAT & Go-Live', status: 'not_started', startDate: '2024-06-11', endDate: '2024-06-30', progress: 0 },
    ],
    teams: [
      { id: 'TM1-001', name: 'Data Migration Team', role: 'Data Engineering', members: ['Alex Johnson', 'David Lee', 'Emma Wilson'], lead: 'David Lee', currentPhase: 'PH3-001' },
      { id: 'TM2-001', name: 'Integration Team', role: 'Integration', members: ['Michael Chen', 'Lisa Park'], lead: 'Michael Chen', currentPhase: 'PH3-001' },
      { id: 'TM3-001', name: 'QA Team', role: 'Quality Assurance', members: ['James Brown', 'Maria Garcia'], lead: 'James Brown', currentPhase: 'PH2-001' },
      { id: 'TM4-001', name: 'Business Analysis', role: 'Business Analysis', members: ['Sarah Mitchell'], lead: 'Sarah Mitchell', currentPhase: 'PH3-001' },
    ],
  },
  {
    id: 'PROJ-002',
    name: 'Sales Cloud Implementation',
    code: 'SCI-2024',
    type: 'implementation',
    status: 'active',
    client: 'TechStart Inc',
    startDate: '2024-02-01',
    targetEndDate: '2024-05-15',
    teamSize: 5,
    description: 'New Salesforce Sales Cloud implementation with custom workflows',
    ownerId: 'user-003',
    ownerName: 'Michael Chen',
    participantIds: ['user-001'],
    participantNames: ['Alex Johnson'],
    phases: [
      { id: 'PH1-002', name: 'Requirements Gathering', status: 'completed', startDate: '2024-02-01', endDate: '2024-02-20', progress: 100 },
      { id: 'PH2-002', name: 'Configuration & Setup', status: 'completed', startDate: '2024-02-21', endDate: '2024-03-20', progress: 100 },
      { id: 'PH3-002', name: 'Custom Development', status: 'in_progress', startDate: '2024-03-21', endDate: '2024-04-15', progress: 70 },
      { id: 'PH4-002', name: 'Testing & Training', status: 'not_started', startDate: '2024-04-16', endDate: '2024-05-05', progress: 0 },
      { id: 'PH5-002', name: 'Deployment', status: 'not_started', startDate: '2024-05-06', endDate: '2024-05-15', progress: 0 },
    ],
    teams: [
      { id: 'TM1-002', name: 'Development Team', role: 'Development', members: ['Alex Johnson', 'Chris Taylor'], lead: 'Alex Johnson', currentPhase: 'PH3-002' },
      { id: 'TM2-002', name: 'Configuration Team', role: 'Configuration', members: ['Michael Chen', 'Rachel Adams'], lead: 'Michael Chen', currentPhase: 'PH3-002' },
      { id: 'TM3-002', name: 'Training Team', role: 'Training', members: ['Jennifer White'], lead: 'Jennifer White', currentPhase: 'PH2-002' },
    ],
  },
  {
    id: 'PROJ-003',
    name: 'ERP Integration Suite',
    code: 'ERP-INT',
    type: 'integration',
    status: 'active',
    client: 'Global Manufacturing Co',
    startDate: '2024-03-01',
    targetEndDate: '2024-08-30',
    teamSize: 6,
    description: 'Integration between Salesforce and SAP ERP systems',
    ownerId: 'user-002',
    ownerName: 'Sarah Mitchell',
    participantIds: [],
    participantNames: [],
    phases: [
      { id: 'PH1-003', name: 'Integration Analysis', status: 'completed', startDate: '2024-03-01', endDate: '2024-03-31', progress: 100 },
      { id: 'PH2-003', name: 'API Development', status: 'in_progress', startDate: '2024-04-01', endDate: '2024-05-31', progress: 60 },
      { id: 'PH3-003', name: 'Middleware Setup', status: 'in_progress', startDate: '2024-05-01', endDate: '2024-06-30', progress: 25 },
      { id: 'PH4-003', name: 'Integration Testing', status: 'not_started', startDate: '2024-07-01', endDate: '2024-08-15', progress: 0 },
      { id: 'PH5-003', name: 'Production Deployment', status: 'not_started', startDate: '2024-08-16', endDate: '2024-08-30', progress: 0 },
    ],
    teams: [
      { id: 'TM1-003', name: 'Salesforce Team', role: 'Salesforce Development', members: ['Sarah Mitchell', 'Tom Anderson'], lead: 'Sarah Mitchell', currentPhase: 'PH2-003' },
      { id: 'TM2-003', name: 'SAP Team', role: 'SAP Integration', members: ['Robert Kim', 'Anna Schmidt'], lead: 'Robert Kim', currentPhase: 'PH2-003' },
      { id: 'TM3-003', name: 'Middleware Team', role: 'MuleSoft', members: ['Kevin O\'Brien', 'Sophie Martin'], lead: 'Kevin O\'Brien', currentPhase: 'PH3-003' },
    ],
  },
  {
    id: 'PROJ-004',
    name: 'Service Cloud Enhancement',
    code: 'SCE-2024',
    type: 'enhancement',
    status: 'active',
    client: 'RetailMax',
    startDate: '2024-02-15',
    targetEndDate: '2024-04-30',
    teamSize: 4,
    description: 'Adding new case management features and automation',
    ownerId: 'user-001',
    ownerName: 'Alex Johnson',
    participantIds: ['user-002'],
    participantNames: ['Sarah Mitchell'],
    phases: [
      { id: 'PH1-004', name: 'Analysis', status: 'completed', startDate: '2024-02-15', endDate: '2024-02-28', progress: 100 },
      { id: 'PH2-004', name: 'Development', status: 'in_progress', startDate: '2024-03-01', endDate: '2024-04-10', progress: 80 },
      { id: 'PH3-004', name: 'Testing & Deployment', status: 'not_started', startDate: '2024-04-11', endDate: '2024-04-30', progress: 0 },
    ],
    teams: [
      { id: 'TM1-004', name: 'Enhancement Team', role: 'Development', members: ['Alex Johnson', 'Nina Patel'], lead: 'Alex Johnson', currentPhase: 'PH2-004' },
      { id: 'TM2-004', name: 'Review Team', role: 'Code Review', members: ['Sarah Mitchell', 'Mark Wilson'], lead: 'Sarah Mitchell', currentPhase: 'PH2-004' },
    ],
  },
  {
    id: 'PROJ-005',
    name: 'Customer Portal Support',
    code: 'CPS-2024',
    type: 'support',
    status: 'on_hold',
    client: 'HealthCare Plus',
    startDate: '2024-01-01',
    targetEndDate: '2024-12-31',
    teamSize: 3,
    description: 'Ongoing support and maintenance for customer portal',
    ownerId: 'user-003',
    ownerName: 'Michael Chen',
    participantIds: [],
    participantNames: [],
    phases: [
      { id: 'PH1-005', name: 'Q1 Support', status: 'completed', startDate: '2024-01-01', endDate: '2024-03-31', progress: 100 },
      { id: 'PH2-005', name: 'Q2 Support', status: 'blocked', startDate: '2024-04-01', endDate: '2024-06-30', progress: 10 },
      { id: 'PH3-005', name: 'Q3 Support', status: 'not_started', startDate: '2024-07-01', endDate: '2024-09-30', progress: 0 },
      { id: 'PH4-005', name: 'Q4 Support', status: 'not_started', startDate: '2024-10-01', endDate: '2024-12-31', progress: 0 },
    ],
    teams: [
      { id: 'TM1-005', name: 'Support Team', role: 'Support', members: ['Michael Chen', 'Emily Davis', 'Josh Turner'], lead: 'Michael Chen', currentPhase: 'PH2-005' },
    ],
  },
  {
    id: 'PROJ-006',
    name: 'Analytics Dashboard Platform',
    code: 'ADP-2024',
    type: 'implementation',
    status: 'active',
    client: 'FinServe Bank',
    startDate: '2024-03-15',
    targetEndDate: '2024-07-15',
    teamSize: 7,
    description: 'Custom analytics dashboards with Einstein Analytics',
    ownerId: 'user-002',
    ownerName: 'Sarah Mitchell',
    participantIds: ['user-001', 'user-003'],
    participantNames: ['Alex Johnson', 'Michael Chen'],
    phases: [
      { id: 'PH1-006', name: 'Data Assessment', status: 'completed', startDate: '2024-03-15', endDate: '2024-04-05', progress: 100 },
      { id: 'PH2-006', name: 'Dashboard Design', status: 'completed', startDate: '2024-04-06', endDate: '2024-04-25', progress: 100 },
      { id: 'PH3-006', name: 'Einstein Implementation', status: 'in_progress', startDate: '2024-04-26', endDate: '2024-06-10', progress: 55 },
      { id: 'PH4-006', name: 'User Training', status: 'not_started', startDate: '2024-06-11', endDate: '2024-07-01', progress: 0 },
      { id: 'PH5-006', name: 'Go-Live & Support', status: 'not_started', startDate: '2024-07-02', endDate: '2024-07-15', progress: 0 },
    ],
    teams: [
      { id: 'TM1-006', name: 'Analytics Team', role: 'Einstein Analytics', members: ['Sarah Mitchell', 'Alex Johnson', 'Diana Ross'], lead: 'Sarah Mitchell', currentPhase: 'PH3-006' },
      { id: 'TM2-006', name: 'Data Team', role: 'Data Engineering', members: ['Michael Chen', 'Peter Chang'], lead: 'Michael Chen', currentPhase: 'PH3-006' },
      { id: 'TM3-006', name: 'UX Team', role: 'Design', members: ['Laura Martinez', 'Steve Rogers'], lead: 'Laura Martinez', currentPhase: 'PH3-006' },
    ],
  },
]

export function ProjectSelector({ selectedProjectId, onSelect }: ProjectSelectorProps) {
  const { user } = useAuth()
  
  // Filter projects where user is either owner or participant
  const userProjects = useMemo(() => {
    if (!user) return []
    
    // Admin users can see all projects
    if (user.role === 'admin') {
      return MOCK_PROJECTS
    }
    
    // Other users see only projects they own or participate in
    return MOCK_PROJECTS.filter(project => 
      project.ownerId === user.id || project.participantIds.includes(user.id)
    )
  }, [user])

  const selectedProject = userProjects.find(p => p.id === selectedProjectId)

  return (
    <div className="space-y-2">
      <Label htmlFor="project-select">Select Project</Label>
      <Select value={selectedProjectId} onValueChange={onSelect}>
        <SelectTrigger id="project-select" className="w-full">
          <SelectValue placeholder="Choose a project to analyze...">
            {selectedProject && (
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = projectTypeIcons[selectedProject.type] || Folder
                  return <Icon className="size-4" />
                })()}
                <span className="font-medium">{selectedProject.name}</span>
                <span className="text-xs text-muted-foreground">({selectedProject.code})</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {userProjects.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <Users className="size-8 mx-auto mb-2 opacity-50" />
              <p>No projects assigned to you</p>
              <p className="text-xs">Contact your admin to be added to a project</p>
            </div>
          ) : (
            userProjects.map((project) => {
              const Icon = projectTypeIcons[project.type] || Folder
              const status = statusConfig[project.status]
              const StatusIcon = status.icon
              const isOwner = user?.id === project.ownerId
              return (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-3 py-1">
                    <Icon className="size-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{project.name}</span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {project.code}
                        </Badge>
                        {isOwner && (
                          <Badge variant="secondary" className="text-xs shrink-0 gap-1">
                            <User className="size-2.5" />
                            Owner
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{project.client}</span>
                        <span>•</span>
                        <span>{projectTypeLabels[project.type]}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <StatusIcon className="size-3" />
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              )
            })
          )}
        </SelectContent>
      </Select>
      
      {/* Project Details Summary */}
      {selectedProject && (
        <div className="rounded-lg border bg-muted/30 p-3 mt-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{selectedProject.name}</p>
                {user?.id === selectedProject.ownerId && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <User className="size-2.5" />
                    You own this project
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{selectedProject.description}</p>
            </div>
            <Badge className={statusConfig[selectedProject.status].className}>
              {statusConfig[selectedProject.status].label}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Folder className="size-3" />
              {projectTypeLabels[selectedProject.type]}
            </span>
            <span className="flex items-center gap-1">
              <Globe className="size-3" />
              {selectedProject.client}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              Team: {selectedProject.teamSize}
            </span>
            <span className="flex items-center gap-1">
              <User className="size-3" />
              Owner: {selectedProject.ownerName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              Target: {new Date(selectedProject.targetEndDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Export projects for use in analysis
export { MOCK_PROJECTS }
