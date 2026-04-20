'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { Lock, Mail, Shield, Eye, EyeOff, AlertCircle, User, Users, UserCog } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, authLoading, router])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  // Don't render login form if authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      router.push('/')
    } else {
      setError(result.error || 'Login failed')
    }
    
    setIsLoading(false)
  }

  const handleDemoLogin = async (role: 'intern' | 'lead' | 'admin') => {
    const credentials = {
      intern: { email: 'intern@csx.com', password: 'intern123' },
      lead: { email: 'lead@csx.com', password: 'lead123' },
      admin: { email: 'admin@csx.com', password: 'admin123' },
    }
    
    setEmail(credentials[role].email)
    setPassword(credentials[role].password)
    setError('')
    setIsLoading(true)

    const result = await login(credentials[role].email, credentials[role].password)
    
    if (result.success) {
      router.push('/')
    } else {
      setError(result.error || 'Login failed')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      {/* Logo and Title */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <span className="text-2xl font-bold text-primary-foreground">AI</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">CSX AI Delivery Fabric</h1>
        <p className="mt-2 text-muted-foreground">Salesforce Buddy & Project Intelligence</p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your AI-powered Salesforce assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="size-4" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or use demo account</span>
            </div>
          </div>

          {/* Demo Login Buttons */}
          <div className="grid gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => handleDemoLogin('intern')}
              disabled={isLoading}
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <User className="size-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Intern Account</div>
                <div className="text-xs text-muted-foreground">Salesforce Buddy access only</div>
              </div>
              <Badge variant="secondary" className="ml-auto">Basic</Badge>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => handleDemoLogin('lead')}
              disabled={isLoading}
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Users className="size-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Team Lead Account</div>
                <div className="text-xs text-muted-foreground">Project Intelligence & Knowledge Base</div>
              </div>
              <Badge variant="secondary" className="ml-auto">Standard</Badge>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <UserCog className="size-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Admin Account</div>
                <div className="text-xs text-muted-foreground">Full system access & administration</div>
              </div>
              <Badge variant="secondary" className="ml-auto">Full Access</Badge>
            </Button>
          </div>

          {/* Security Note */}
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Shield className="size-4 text-success shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your session is protected with secure authentication. All data access is logged and audited.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground text-center">
        CSX AI Delivery Fabric - Enterprise Salesforce Intelligence Platform
      </p>
    </div>
  )
}
