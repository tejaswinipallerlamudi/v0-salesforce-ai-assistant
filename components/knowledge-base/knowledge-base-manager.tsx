'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import type { UserRole } from '@/types'
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react'

interface KnowledgeBaseManagerProps {
  userRole: UserRole
}

interface KBDocument {
  id: string
  title: string
  type: 'sop' | 'kt_note' | 'field_guide' | 'project_history'
  status: 'draft' | 'published' | 'archived'
  author: string
  lastUpdated: string
  tags: string[]
}

// Mock knowledge base documents
const MOCK_DOCUMENTS: KBDocument[] = [
  {
    id: '1',
    title: 'Case Escalation Procedure',
    type: 'sop',
    status: 'published',
    author: 'John Smith',
    lastUpdated: '2024-01-15',
    tags: ['escalation', 'case', 'support'],
  },
  {
    id: '2',
    title: 'Priority Field Guidelines',
    type: 'field_guide',
    status: 'published',
    author: 'Sarah Johnson',
    lastUpdated: '2024-01-10',
    tags: ['priority', 'sla', 'fields'],
  },
  {
    id: '3',
    title: 'Q4 Migration Project Learnings',
    type: 'project_history',
    status: 'published',
    author: 'Mike Chen',
    lastUpdated: '2024-01-08',
    tags: ['migration', 'learnings', 'q4'],
  },
  {
    id: '4',
    title: 'New Agent Onboarding Guide',
    type: 'kt_note',
    status: 'draft',
    author: 'Emily Davis',
    lastUpdated: '2024-01-20',
    tags: ['onboarding', 'training', 'new-hire'],
  },
  {
    id: '5',
    title: 'Customer Communication Templates',
    type: 'sop',
    status: 'published',
    author: 'John Smith',
    lastUpdated: '2024-01-12',
    tags: ['communication', 'templates', 'customer'],
  },
]

const typeConfig = {
  sop: { label: 'SOP', className: 'bg-primary/10 text-primary' },
  kt_note: { label: 'KT Note', className: 'bg-info/10 text-info' },
  field_guide: { label: 'Field Guide', className: 'bg-success/10 text-success' },
  project_history: { label: 'Project History', className: 'bg-warning/10 text-warning' },
}

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  published: { label: 'Published', className: 'bg-success/10 text-success' },
  archived: { label: 'Archived', className: 'bg-destructive/10 text-destructive' },
}

export function KnowledgeBaseManager({ userRole }: KnowledgeBaseManagerProps) {
  const [documents, setDocuments] = useState<KBDocument[]>(MOCK_DOCUMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<KBDocument | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // New document form state
  const [newDoc, setNewDoc] = useState({
    title: '',
    type: 'sop' as KBDocument['type'],
    content: '',
    tags: '',
  })

  const canManage = userRole === 'lead' || userRole === 'admin'

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = filterType === 'all' || doc.type === filterType
    return matchesSearch && matchesType
  })

  const handleAddDocument = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newDocument: KBDocument = {
      id: String(documents.length + 1),
      title: newDoc.title,
      type: newDoc.type,
      status: 'draft',
      author: 'Current User',
      lastUpdated: new Date().toISOString().split('T')[0],
      tags: newDoc.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }

    setDocuments([newDocument, ...documents])
    setNewDoc({ title: '', type: 'sop', content: '', tags: '' })
    setIsAddDialogOpen(false)
    setIsLoading(false)
  }

  const handleEditDocument = async () => {
    if (!selectedDoc) return
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setDocuments(
      documents.map((doc) =>
        doc.id === selectedDoc.id
          ? { ...selectedDoc, lastUpdated: new Date().toISOString().split('T')[0] }
          : doc
      )
    )
    setIsEditDialogOpen(false)
    setSelectedDoc(null)
    setIsLoading(false)
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    setDocuments(documents.filter((doc) => doc.id !== id))
  }

  const handlePublish = async (id: string) => {
    setDocuments(
      documents.map((doc) =>
        doc.id === id ? { ...doc, status: 'published' as const } : doc
      )
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            <CardTitle>Knowledge Base Management</CardTitle>
          </div>
          {canManage && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="size-4" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Document</DialogTitle>
                  <DialogDescription>
                    Upload a new SOP, KT note, or field guide to the knowledge base.
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                      id="title"
                      value={newDoc.title}
                      onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                      placeholder="Enter document title"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="type">Document Type</FieldLabel>
                    <Select
                      value={newDoc.type}
                      onValueChange={(v) => setNewDoc({ ...newDoc, type: v as KBDocument['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sop">SOP (Standard Operating Procedure)</SelectItem>
                        <SelectItem value="kt_note">KT Note (Knowledge Transfer)</SelectItem>
                        <SelectItem value="field_guide">Field Guide</SelectItem>
                        <SelectItem value="project_history">Project History</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="content">Content</FieldLabel>
                    <Textarea
                      id="content"
                      value={newDoc.content}
                      onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                      placeholder="Enter document content or paste from existing documentation..."
                      rows={8}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="tags">Tags (comma-separated)</FieldLabel>
                    <Input
                      id="tags"
                      value={newDoc.tags}
                      onChange={(e) => setNewDoc({ ...newDoc, tags: e.target.value })}
                      placeholder="escalation, case, support"
                    />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDocument} disabled={isLoading || !newDoc.title}>
                    {isLoading ? (
                      <>
                        <Spinner className="size-4 mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Upload className="size-4 mr-2" />
                        Add Document
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <CardDescription>
          {canManage
            ? 'Manage SOPs, KT notes, and field guides that power the AI assistant.'
            : 'Browse the knowledge base documents used by the AI assistant.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sop">SOPs</SelectItem>
              <SelectItem value="kt_note">KT Notes</SelectItem>
              <SelectItem value="field_guide">Field Guides</SelectItem>
              <SelectItem value="project_history">Project History</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Last Updated</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 6 : 5} className="text-center text-muted-foreground py-8">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-muted-foreground" />
                        <span className="font-medium">{doc.title}</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {doc.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={typeConfig[doc.type].className}>
                        {typeConfig[doc.type].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[doc.status].className}>
                        {doc.status === 'draft' && <Clock className="size-3 mr-1" />}
                        {doc.status === 'published' && <CheckCircle2 className="size-3 mr-1" />}
                        {statusConfig[doc.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{doc.author}</TableCell>
                    <TableCell className="text-muted-foreground">{doc.lastUpdated}</TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {doc.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePublish(doc.id)}
                              className="text-success hover:text-success"
                            >
                              Publish
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedDoc(doc)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          {userRole === 'admin' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-primary">{documents.length}</div>
            <div className="text-xs text-muted-foreground">Total Documents</div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {documents.filter((d) => d.status === 'published').length}
            </div>
            <div className="text-xs text-muted-foreground">Published</div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {documents.filter((d) => d.status === 'draft').length}
            </div>
            <div className="text-xs text-muted-foreground">Drafts</div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-info">
              {documents.filter((d) => d.type === 'sop').length}
            </div>
            <div className="text-xs text-muted-foreground">SOPs</div>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>Update the document details and content.</DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-title">Title</FieldLabel>
                <Input
                  id="edit-title"
                  value={selectedDoc.title}
                  onChange={(e) => setSelectedDoc({ ...selectedDoc, title: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-type">Document Type</FieldLabel>
                <Select
                  value={selectedDoc.type}
                  onValueChange={(v) => setSelectedDoc({ ...selectedDoc, type: v as KBDocument['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sop">SOP</SelectItem>
                    <SelectItem value="kt_note">KT Note</SelectItem>
                    <SelectItem value="field_guide">Field Guide</SelectItem>
                    <SelectItem value="project_history">Project History</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-status">Status</FieldLabel>
                <Select
                  value={selectedDoc.status}
                  onValueChange={(v) => setSelectedDoc({ ...selectedDoc, status: v as KBDocument['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-tags">Tags</FieldLabel>
                <Input
                  id="edit-tags"
                  value={selectedDoc.tags.join(', ')}
                  onChange={(e) =>
                    setSelectedDoc({
                      ...selectedDoc,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                />
              </Field>
            </FieldGroup>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDocument} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="size-4 mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
