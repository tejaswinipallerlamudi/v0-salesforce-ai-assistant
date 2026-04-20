'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/header'
import { RoleDashboard } from '@/components/dashboard/role-dashboard'
import { SalesforceBuddyPanel } from '@/components/salesforce-buddy/salesforce-buddy-panel'
import { ProjectIntelligencePanel } from '@/components/project-intelligence/project-intelligence-panel'
import { AdminPanel } from '@/components/admin/admin-panel'
import { KnowledgeBaseManager } from '@/components/knowledge-base/knowledge-base-manager'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/contexts/auth-context'
import { Home, MessageCircle, Brain, Settings, BookOpen } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [selectedObject, setSelectedObject] = useState<string>('')
  const [selectedRecordId, setSelectedRecordId] = useState<string>('')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null
  }

  const userRole = user.role
  const [activeTab, setActiveTab] = useState('home')

  // Handle navigation from dashboard to specific tabs
  const handleNavigate = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header userRole={userRole} userName={user.name} />
      
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className={`grid w-full ${userRole === 'admin' ? 'max-w-4xl grid-cols-5' : userRole === 'lead' ? 'max-w-3xl grid-cols-4' : 'max-w-md grid-cols-2'}`}>
              <TabsTrigger value="home" className="gap-2">
                <Home className="size-4" />
                Home
              </TabsTrigger>
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

            <TabsContent value="home">
              <RoleDashboard 
                userRole={userRole} 
                userName={user.name} 
                onNavigate={handleNavigate}
              />
            </TabsContent>

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
                <ProjectIntelligencePanel userRole={userRole} />
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
