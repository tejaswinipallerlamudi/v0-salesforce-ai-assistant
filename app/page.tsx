'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/header'
import { SalesforceBuddyPanel } from '@/components/salesforce-buddy/salesforce-buddy-panel'
import { ProjectIntelligencePanel } from '@/components/project-intelligence/project-intelligence-panel'
import { AdminPanel } from '@/components/admin/admin-panel'
import { KnowledgeBaseManager } from '@/components/knowledge-base/knowledge-base-manager'
import type { UserRole } from '@/types'
import { MessageCircle, Brain, Settings, BookOpen } from 'lucide-react'

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<UserRole>('intern')
  const [selectedObject, setSelectedObject] = useState<string>('')
  const [selectedRecordId, setSelectedRecordId] = useState<string>('')

  return (
    <div className="flex min-h-screen flex-col">
      <Header userRole={userRole} onRoleChange={setUserRole} />
      
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <Tabs defaultValue="buddy" className="space-y-6">
            <TabsList className={`grid w-full ${userRole === 'admin' ? 'max-w-3xl grid-cols-4' : userRole === 'lead' ? 'max-w-2xl grid-cols-3' : 'max-w-xs grid-cols-1'}`}>
              <TabsTrigger value="buddy" className="gap-2">
                <MessageCircle className="size-4" />
                Salesforce Buddy
              </TabsTrigger>
              {(userRole === 'lead' || userRole === 'admin') && (
                <TabsTrigger value="intelligence" className="gap-2">
                  <Brain className="size-4" />
                  Project Intelligence
                </TabsTrigger>
              )}
              {(userRole === 'lead' || userRole === 'admin') && (
                <TabsTrigger value="knowledge" className="gap-2">
                  <BookOpen className="size-4" />
                  Knowledge Base
                </TabsTrigger>
              )}
              {userRole === 'admin' && (
                <TabsTrigger value="admin" className="gap-2">
                  <Settings className="size-4" />
                  Admin
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="buddy">
              <SalesforceBuddyPanel
                userRole={userRole}
                selectedObject={selectedObject}
                selectedRecordId={selectedRecordId}
                onObjectChange={setSelectedObject}
                onRecordChange={setSelectedRecordId}
              />
            </TabsContent>

            {(userRole === 'lead' || userRole === 'admin') && (
              <TabsContent value="intelligence">
                <ProjectIntelligencePanel
                  userRole={userRole}
                  selectedObject={selectedObject}
                  selectedRecordId={selectedRecordId}
                  onObjectChange={setSelectedObject}
                  onRecordChange={setSelectedRecordId}
                />
              </TabsContent>
            )}

            {(userRole === 'lead' || userRole === 'admin') && (
              <TabsContent value="knowledge">
                <KnowledgeBaseManager userRole={userRole} />
              </TabsContent>
            )}

            {userRole === 'admin' && (
              <TabsContent value="admin">
                <AdminPanel />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  )
}
