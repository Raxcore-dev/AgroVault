'use client'

import { useAuth } from '@/lib/auth-context'
import { Settings, User, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account preferences</p>
        </div>

        {/* Profile Section */}
        <div className="card-elevated rounded-xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Profile</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium text-foreground">{user?.name || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium text-foreground">{user?.email || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Role</span>
              <span className="text-sm font-medium text-foreground capitalize">{user?.role || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="text-sm font-medium text-foreground">{user?.phone || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Location</span>
              <span className="text-sm font-medium text-foreground">{user?.location || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="card-elevated rounded-xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Notifications</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Alert notifications are automatically generated when storage conditions exceed safe thresholds.
          </p>
        </div>

        {/* Security Section */}
        <div className="card-elevated rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Security</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Your account is secured with a password-protected JWT token. 
            Contact support to change your password.
          </p>
        </div>
      </div>
    </div>
  )
}
