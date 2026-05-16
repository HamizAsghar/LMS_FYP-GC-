'use client'

import { useState } from 'react'
import { 
  Settings, 
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Lock,
  Key,
  Eye,
  EyeOff,
  Save,
  Moon,
  Sun
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { apiFetch, getToken } from '@/lib/api-client'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'

export default function AdminSettingsPage() {
  const { updateUser, settings, updateSettings } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    bio: '',
    role: '',
    avatar: ''
  })
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    assignments: true,
    submissions: true,
    system: false,
    reports: true
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await apiFetch('/api/admin/settings/profile')
        if (res.success) {
          setProfile(res.data)
        }
      } catch (err) {
        console.error("Failed to fetch profile", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      toast.loading('Updating profile...')
      const res = await apiFetch('/api/admin/settings/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      })
      if (res.success) {
        updateUser(res.data)
        toast.dismiss()
        toast.success('Profile updated successfully!')
      }
    } catch (err) {
      toast.dismiss()
      toast.error(err.message || 'Failed to update profile')
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      return toast.error('Passwords do not match')
    }
    try {
      toast.loading('Updating password...')
      const res = await apiFetch('/api/admin/settings/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
          confirmPassword: passwords.confirm
        })
      })
      if (res.success) {
        toast.dismiss()
        toast.success('Password updated successfully!')
        setPasswords({ current: '', new: '', confirm: '' })
      }
    } catch (err) {
      toast.dismiss()
      toast.error(err.message || 'Failed to update password')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1024 * 1024) {
      return toast.error('File size must be less than 1MB')
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'avatars')

      toast.loading('Uploading image...')
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      })
      const result = await res.json()
      
      if (result.success) {
        setProfile({ ...profile, avatar: result.data.url })
        // Also update profile in DB
        await apiFetch('/api/admin/settings/profile', {
          method: 'PUT',
          body: JSON.stringify({ avatar: result.data.url })
        })
        updateUser({ avatar: result.data.url })
        toast.dismiss()
        toast.success('Avatar updated successfully!')
      } else {
        toast.dismiss()
        toast.error(result.message || 'Upload failed')
      }
    } catch (err) {
      toast.dismiss()
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Settings" 
        userRole="Administrator"
        userName={profile.name || "Admin User"}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Settings' }
        ]}
      />
      
      <main className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="account" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden border border-border">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
                      ) : (
                        profile.name?.charAt(0) || 'A'
                      )}
                    </div>
                    <div>
                      <Input 
                        type="file" 
                        id="avatar-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <Button 
                        variant="outline" 
                        type="button"
                        disabled={uploading}
                        onClick={() => document.getElementById('avatar-upload').click()}
                      >
                        {uploading ? 'Uploading...' : 'Change Photo'}
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={profile.email} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+92 3XX XXXXXXX" />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input value={profile.department || ''} onChange={e => setProfile({...profile, department: e.target.value})} placeholder="e.g. Administration" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea 
                      value={profile.bio || ''} 
                      onChange={e => setProfile({...profile, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                  <Button className="gap-2" type="submit">
                    <Save className="h-4 w-4" />
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <div className="relative">
                      <Input 
                        type={showCurrentPassword ? "text" : "password"} 
                        placeholder="Enter current password"
                        required
                        value={passwords.current}
                        onChange={e => setPasswords({...passwords, current: e.target.value})}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <div className="relative">
                      <Input 
                        type={showNewPassword ? "text" : "password"} 
                        placeholder="Enter new password"
                        required
                        value={passwords.new}
                        onChange={e => setPasswords({...passwords, new: e.target.value})}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input 
                      type="password" 
                      placeholder="Confirm new password" 
                      required
                      value={passwords.confirm}
                      onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                    />
                  </div>
                  <Button className="gap-2" type="submit">
                    <Key className="h-4 w-4" />
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Options
                </CardTitle>
                <CardDescription>Manage security settings for your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" onClick={() => toast.info('Feature coming soon')}>Enable</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch 
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Show Notifications in Sidebar</p>
                      <p className="text-sm text-muted-foreground">Toggle visibility of Notifications tab in the side menu</p>
                    </div>
                    <Switch 
                      checked={settings.sidebarNotifications}
                      onCheckedChange={(checked) => updateSettings({ sidebarNotifications: checked })}
                    />
                  </div>
                </div>
                <Button className="gap-2" onClick={() => toast.success('Preferences saved!')}>
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  System Settings
                </CardTitle>
                <CardDescription>Configure general system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Platform Name</Label>
                    <Input defaultValue="EduHub LMS" />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Timezone</Label>
                    <Select defaultValue="pkt">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pkt">Pakistan Standard Time (PKT)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="gap-2" onClick={() => toast.success('System settings updated!')}>
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Theme Settings
                </CardTitle>
                <CardDescription>Customize the look and feel of the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Theme Mode</Label>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${settings.theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => updateSettings({ theme: 'light' })}
                    >
                      <div className="flex items-center justify-center h-20 bg-slate-50 rounded mb-3">
                        <Sun className="h-8 w-8 text-yellow-500" />
                      </div>
                      <p className="text-center font-medium text-foreground">Light</p>
                    </div>
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${settings.theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => updateSettings({ theme: 'dark' })}
                    >
                      <div className="flex items-center justify-center h-20 bg-slate-900 rounded mb-3">
                        <Moon className="h-8 w-8 text-blue-400" />
                      </div>
                      <p className="text-center font-medium text-foreground">Dark</p>
                    </div>
                  </div>
                </div>
                <Button className="gap-2" onClick={() => toast.success('Appearance saved!')}>
                  <Save className="h-4 w-4" />
                  Save Appearance
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
