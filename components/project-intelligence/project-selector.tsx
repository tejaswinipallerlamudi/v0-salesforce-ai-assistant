'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Folder, 
  Rocket, 
  Settings, 
  Database,
  Globe,
  Smartphone,
  Server,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react'

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

// Mock projects for demo
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
  },
]

export function ProjectSelector({ selectedProjectId, onSelect }: ProjectSelectorProps) {
  const [projects] = useState<Project[]>(MOCK_PROJECTS)

  const selectedProject = projects.find(p => p.id === selectedProjectId)

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
          {projects.map((project) => {
            const Icon = projectTypeIcons[project.type] || Folder
            const status = statusConfig[project.status]
            const StatusIcon = status.icon
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
          })}
        </SelectContent>
      </Select>
      
      {/* Project Details Summary */}
      {selectedProject && (
        <div className="rounded-lg border bg-muted/30 p-3 mt-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">{selectedProject.name}</p>
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
              <BarChart3 className="size-3" />
              Team: {selectedProject.teamSize}
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
