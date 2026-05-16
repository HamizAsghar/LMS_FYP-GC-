'use client'

import { useState } from 'react'
import { 
  User, 
  Lock, 
  Bell, 
  Globe,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Camera,
  Mail,
  Phone,
  MapPin,
  Save
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import { useAuth } from '@/contexts/auth-context'
import { apiFetch } from '@/lib/api-client'
import { uploadFile } from '@/lib/cloudinary'
import { toast } from 'sonner'

export default function StudentSettings() {
  const { user: authUser, updateProfile } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    assignments: true,
    grades: true,
    announcements: false
  })

  const [profileData, setProfileData] = useState({
    name: authUser?.name || '',
    phone: authUser?.phone || '',
    department: authUser?.department || '',
    avatar: authUser?.avatar || ''
  })

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      })
      if (res) {
        updateProfile(res)
        toast.success('Profile updated successfully')
      }
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setLoading(true)
    try {
      const url = await uploadFile(file)
      setProfileData({ ...profileData, avatar: url })
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ ...profileData, avatar: url })
      })
      if (res) {
        updateProfile(res)
        toast.success('Avatar updated')
      }
    } catch (err) {
      toast.error('Avatar upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      return toast.error('Passwords do not match')
    }
    setLoading(true)
    try {
      await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      })
      toast.success('Password changed successfully')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Settings" 
        userRole="Student"
        userName={authUser?.name || 'Student'}
        breadcrumbs={[
          { label: 'Student', href: '/student' },
          { label: 'Settings' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences and settings</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50 border-border">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Globe className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Picture Card */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Update your profile photo</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32 border-4 border-primary/10">
                    <AvatarImage src={profileData.avatar || authUser?.avatar} alt="Profile" className="object-cover" />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {authUser?.name?.split(' ').map(n => n[0]).join('') || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center gap-2">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        <Camera className="h-4 w-4" />
                        {loading ? 'Uploading...' : 'Change Photo'}
                      </div>
                    </Label>
                    <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={loading} />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    JPG, GIF or PNG. Max size 2MB.
                  </p>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="border-border bg-card lg:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={profileData.name} 
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input id="studentId" value={authUser?._id?.substring(0, 8).toUpperCase() || 'N/A'} disabled />
                    <p className="text-[10px] text-muted-foreground italic">System-generated ID</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" value={authUser?.email || ''} className="pl-10" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={profileData.phone} 
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="pl-10" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="department" 
                        value={profileData.department} 
                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                        className="pl-10" 
                      />
                    </div>
                  </div>
                  <Button className="gap-2" onClick={handleProfileSave} disabled={loading}>
                    {loading ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.email} 
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Bell className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Assignment Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified about new assignments</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.assignments} 
                    onCheckedChange={(checked) => setNotifications({...notifications, assignments: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Globe className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Grade Updates</p>
                      <p className="text-sm text-muted-foreground">Receive notifications when grades are posted</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.grades} 
                    onCheckedChange={(checked) => setNotifications({...notifications, grades: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Bell className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Announcements</p>
                      <p className="text-sm text-muted-foreground">Get notified about course announcements</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.announcements} 
                    onCheckedChange={(checked) => setNotifications({...notifications, announcements: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input 
                        id="currentPassword" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter current password"
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter new password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Confirm new password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    />
                  </div>
                  <Button onClick={handlePasswordChange} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Manage your active login sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">Current Device</p>
                        <Badge variant="outline" className="text-green-500 border-green-500">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Chrome on Windows - Islamabad, Pakistan</p>
                      <p className="text-xs text-muted-foreground">Last active: Just now</p>
                    </div>
                    <Button variant="outline" size="sm">This Device</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>Customize your learning experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Moon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Use dark theme</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Globe className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Language</p>
                      <p className="text-sm text-muted-foreground">English (US)</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Sun className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Timezone</p>
                      <p className="text-sm text-muted-foreground">Asia/Karachi (PKT)</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
