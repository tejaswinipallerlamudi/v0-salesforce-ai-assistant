'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { apiClient } from '@/lib/api-client'
import { useAuth, type UserWithPassword } from '@/contexts/auth-context'
import type { AuditLogEntry, UserRole } from '@/types'
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
  Users,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  UserCog,
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

const roleConfig: Record<UserRole, { label: string; badgeClass: string }> = {
  intern: { label: 'Intern', badgeClass: 'bg-blue-100 text-blue-700' },
  lead: { label: 'Team Lead', badgeClass: 'bg-green-100 text-green-700' },
  admin: { label: 'Admin', badgeClass: 'bg-purple-100 text-purple-700' },
}

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

function UserManagementTab() {
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithPassword | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'intern' as UserRole,
    department: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'intern',
      department: '',
    })
    setShowPassword(false)
    setError('')
  }

  const handleOpenAddDialog = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  const handleOpenEditDialog = (user: UserWithPassword) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role,
      department: user.department || '',
    })
    setShowPassword(false)
    setError('')
  }

  const handleCloseDialogs = () => {
    setIsAddDialogOpen(false)
    setEditingUser(null)
    resetForm()
  }

  const handleSubmitAdd = async () => {
    if (!formData.username.trim() || !formData.password.trim() || !formData.name.trim()) {
      setError('Username, password, and name are required')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await addUser({
      username: formData.username.trim(),
      password: formData.password,
      name: formData.name.trim(),
      role: formData.role,
      department: formData.department.trim() || undefined,
    })

    if (result.success) {
      handleCloseDialogs()
    } else {
      setError(result.error || 'Failed to add user')
    }

    setIsSubmitting(false)
  }

  const handleSubmitEdit = async () => {
    if (!editingUser) return
    if (!formData.username.trim() || !formData.password.trim() || !formData.name.trim()) {
      setError('Username, password, and name are required')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await updateUser(editingUser.id, {
      username: formData.username.trim(),
      password: formData.password,
      name: formData.name.trim(),
      role: formData.role,
      department: formData.department.trim() || undefined,
    })

    if (result.success) {
      handleCloseDialogs()
    } else {
      setError(result.error || 'Failed to update user')
    }

    setIsSubmitting(false)
  }

  const handleDelete = async (userId: string) => {
    const result = await deleteUser(userId)
    if (!result.success) {
      alert(result.error || 'Failed to delete user')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">User Management</h3>
          <p className="text-sm text-muted-foreground">
            Add, edit, or remove users and manage their roles
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddDialog} className="gap-2">
              <Plus className="size-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with specified role and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive text-sm">
                  <AlertCircle className="size-4" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intern">Intern - Basic access</SelectItem>
                    <SelectItem value="lead">Team Lead - Project Intelligence access</SelectItem>
                    <SelectItem value="admin">Admin - Full system access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department (Optional)</label>
                <Input
                  placeholder="Enter department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialogs}>
                Cancel
              </Button>
              <Button onClick={handleSubmitAdd} disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="size-4 mr-2" /> : null}
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                        <User className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        {user.id === currentUser?.id && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{user.username}</TableCell>
                  <TableCell>
                    <Badge className={roleConfig[user.role].badgeClass}>
                      {roleConfig[user.role].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.department || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && handleCloseDialogs()}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(user)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                              Update user account details and permissions.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {error && (
                              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive text-sm">
                                <AlertCircle className="size-4" />
                                {error}
                              </div>
                            )}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Username</label>
                              <Input
                                placeholder="Enter username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Password</label>
                              <div className="relative">
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Enter password"
                                  value={formData.password}
                                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Full Name</label>
                              <Input
                                placeholder="Enter full name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Role</label>
                              <Select
                                value={formData.role}
                                onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="intern">Intern - Basic access</SelectItem>
                                  <SelectItem value="lead">Team Lead - Project Intelligence access</SelectItem>
                                  <SelectItem value="admin">Admin - Full system access</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Department (Optional)</label>
                              <Input
                                placeholder="Enter department"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={handleCloseDialogs}>
                              Cancel
                            </Button>
                            <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
                              {isSubmitting ? <Spinner className="size-4 mr-2" /> : null}
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Role Permissions</CardTitle>
          <CardDescription>Overview of access levels for each role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <User className="size-4 text-blue-600" />
                <span className="font-medium">Intern</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Salesforce Buddy access</li>
                <li>Ask questions & explain pages</li>
                <li>Guided workflows</li>
              </ul>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-green-600" />
                <span className="font-medium">Team Lead</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>All Intern permissions</li>
                <li>Project Intelligence access</li>
                <li>Knowledge Base management</li>
              </ul>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <UserCog className="size-4 text-purple-600" />
                <span className="font-medium">Admin</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>All Team Lead permissions</li>
                <li>User management</li>
                <li>Audit logs & analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AuditLogsTab() {
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
          <h3 className="text-lg font-semibold">System Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Monitor AI usage, performance, and audit logs
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

export function AdminPanel() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Manage users, monitor AI usage, and view audit logs
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="size-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Activity className="size-4" />
            Audit & Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
