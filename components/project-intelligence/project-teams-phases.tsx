'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { Project, ProjectPhase, ProjectTeam } from './project-selector'
import {
  Users,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react'

interface ProjectTeamsPhasesProps {
  project: Project
}

const phaseStatusConfig: Record<ProjectPhase['status'], { label: string; className: string; icon: typeof CheckCircle2 }> = {
  completed: { label: 'Completed', className: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', className: 'bg-info/10 text-info border-info/20', icon: Clock },
  not_started: { label: 'Not Started', className: 'bg-muted text-muted-foreground border-border', icon: Calendar },
  blocked: { label: 'Blocked', className: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
}

export function ProjectTeamsPhases({ project }: ProjectTeamsPhasesProps) {
  // Find which phase each team is working on
  const getPhaseForTeam = (team: ProjectTeam): ProjectPhase | undefined => {
    return project.phases.find(p => p.id === team.currentPhase)
  }

  // Calculate overall project progress
  const overallProgress = Math.round(
    project.phases.reduce((sum, phase) => sum + phase.progress, 0) / project.phases.length
  )

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Project Progress</CardTitle>
              <CardDescription>Overall completion across all phases</CardDescription>
            </div>
            <span className="text-2xl font-bold">{overallProgress}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Phases Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="size-4" />
            Project Phases
          </CardTitle>
          <CardDescription>
            {project.phases.filter(p => p.status === 'completed').length} of {project.phases.length} phases completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.phases.map((phase, index) => {
              const status = phaseStatusConfig[phase.status]
              const StatusIcon = status.icon
              const teamsInPhase = project.teams.filter(t => t.currentPhase === phase.id)
              
              return (
                <div key={phase.id} className="relative">
                  {/* Connection line */}
                  {index < project.phases.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border" />
                  )}
                  
                  <div className="flex gap-3">
                    {/* Status indicator */}
                    <div className={`shrink-0 size-6 rounded-full flex items-center justify-center ${status.className}`}>
                      <StatusIcon className="size-3.5" />
                    </div>
                    
                    {/* Phase content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{phase.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </div>
                      
                      {/* Progress bar for in-progress phases */}
                      {phase.status === 'in_progress' && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{phase.progress}%</span>
                          </div>
                          <Progress value={phase.progress} className="h-1.5" />
                        </div>
                      )}
                      
                      {/* Teams working on this phase */}
                      {teamsInPhase.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {teamsInPhase.map(team => (
                            <Badge key={team.id} variant="secondary" className="text-xs gap-1">
                              <Users className="size-3" />
                              {team.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Teams */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="size-4" />
            Teams ({project.teams.length})
          </CardTitle>
          <CardDescription>All teams and their current assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {project.teams.map((team) => {
              const currentPhase = getPhaseForTeam(team)
              const phaseStatus = currentPhase ? phaseStatusConfig[currentPhase.status] : null
              
              return (
                <AccordionItem key={team.id} value={team.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Users className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{team.name}</p>
                        <p className="text-xs text-muted-foreground">{team.role}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-11 space-y-3">
                      {/* Current Phase */}
                      {currentPhase && phaseStatus && (
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="size-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Working on:</span>
                          <Badge variant="outline" className={phaseStatus.className}>
                            {currentPhase.name}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Team Lead */}
                      <div className="flex items-center gap-2 text-sm">
                        <User className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Lead:</span>
                        <span className="font-medium">{team.lead}</span>
                      </div>
                      
                      {/* Team Members */}
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Users className="size-4" />
                          Members ({team.members.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {team.members.map((member, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted text-sm"
                            >
                              <div className="size-5 rounded-full bg-background flex items-center justify-center text-xs font-medium">
                                {member.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span>{member}</span>
                              {member === team.lead && (
                                <Badge variant="secondary" className="text-xs py-0 h-4">
                                  Lead
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
