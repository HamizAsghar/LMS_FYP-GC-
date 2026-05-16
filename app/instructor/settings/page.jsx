"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { apiFetch, setAuth } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'

export default function InstructorSettings() {
  const { user } = useAuth()
  
  const [profileData, setProfileData] = useState({ name: '', email: '', bio: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await apiFetch('/api/instructor/profile')
        if (res.success) {
          setProfileData({
            name: res.data.name || '',
            email: res.data.email || '',
            bio: res.data.specialization || ''
          })
        }
      } catch (error) {
        if (error?.status !== 401 && error?.status !== 403) {
          console.error("Failed to load settings:", error)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleProfileSave = async () => {
    try {
      setSaving(true)
      const res = await apiFetch('/api/instructor/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profileData.name,
          specialization: profileData.bio
        })
      })
      if (res.success) {
        alert("Profile saved successfully!")
      } else {
        alert("Failed to save profile")
      }
    } catch (error) {
      alert("Error saving profile")
    } finally {
      setSaving(false)
    }
  }

  const handleEmailSave = async () => {
    try {
      setSaving(true)
      const res = await apiFetch('/api/instructor/profile', {
        method: 'PUT',
        body: JSON.stringify({
          email: profileData.email
        })
      })
      if (res.success) {
        alert("Email settings saved successfully! Please log in again if your email changed.")
      } else {
        alert("Failed to save email")
      }
    } catch (error) {
      alert("Error saving email")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Settings" 
        userRole="Instructor"
        userName={profileData.name || user?.name}
        breadcrumbs={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'Settings' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto bg-background">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-card border-border">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your public profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground text-sm">Loading...</p>
                ) : (
                  <>
                    <div>
                      <Label>Full Name</Label>
                      <Input 
                        value={profileData.name} 
                        onChange={e => setProfileData({...profileData, name: e.target.value})}
                        placeholder="Your name" 
                        className="mt-2" 
                      />
                    </div>
                    <div>
                      <Label>Bio / Specialization</Label>
                      <Input 
                        value={profileData.bio} 
                        onChange={e => setProfileData({...profileData, bio: e.target.value})}
                        placeholder="Your bio" 
                        className="mt-2" 
                      />
                    </div>
                    <Button onClick={handleProfileSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>Manage your primary email address and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground text-sm">Loading...</p>
                ) : (
                  <>
                    <div>
                      <Label>Primary Email</Label>
                      <Input 
                        type="email"
                        value={profileData.email} 
                        onChange={e => setProfileData({...profileData, email: e.target.value})}
                        placeholder="Your email" 
                        className="mt-2" 
                      />
                    </div>
                    <Button onClick={handleEmailSave} disabled={saving}>
                      {saving ? "Saving..." : "Update Email"}
                    </Button>
                  </>
                )}

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg mt-8">
                  <div>
                    <p className="font-medium">Course Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified about course changes</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline">Change Password</Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Password changes are currently managed via the "Forgot Password" flow on the login screen.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
