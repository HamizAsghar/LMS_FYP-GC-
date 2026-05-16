"use client"

import { useState, useEffect } from "react"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  BookOpen,
  Award,
  Edit2,
  Camera,
  Save,
  X,
  Briefcase
} from "lucide-react"
import { Navbar } from '@/components/navbar'
import { apiFetch } from '@/lib/api-client'

export default function InstructorProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(null)
  const [editedProfile, setEditedProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/instructor/profile')
      if (res.success) {
        setProfile(res.data)
        setEditedProfile(res.data)
      }
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.error("Failed to load profile", err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await apiFetch('/api/instructor/profile', {
        method: 'PUT',
        body: JSON.stringify({
          email: editedProfile.email,
          phone: editedProfile.phone,
          address: editedProfile.address,
          specialization: editedProfile.specialization
        })
      })
      if (res.success) {
        setProfile(editedProfile)
        setIsEditing(false)
        fetchProfile() // Refresh to ensure data sync
      } else {
        alert(res.message || "Failed to update profile")
      }
    } catch (err) {
      alert("Error updating profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar title="My Profile" userRole="Instructor" userName="Loading..." breadcrumbs={[{ label: 'Instructor', href: '/instructor' }, { label: 'Profile' }]} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar title="My Profile" userRole="Instructor" userName="Instructor" breadcrumbs={[{ label: 'Instructor', href: '/instructor' }, { label: 'Profile' }]} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Failed to load profile data.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="My Profile" 
        userRole="Instructor"
        userName={profile.name}
        breadcrumbs={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'Profile' }
        ]}
      />
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">View and manage your personal information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-3xl font-bold text-primary">
                  {profile.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.designation}</p>
              <p className="text-sm text-primary mt-1">{profile.department}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Courses</p>
                  <p className="font-medium text-foreground">{profile.courses}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="font-medium text-foreground">{profile.totalStudents}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Publications</p>
                  <p className="font-medium text-foreground">{profile.publications}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Email Address</label>
                  {isEditing ? (
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-foreground">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {profile.email}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Phone Number</label>
                  {isEditing ? (
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-foreground">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {profile.phone || "Not provided"}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-muted-foreground mb-1">Office Address</label>
                  {isEditing ? (
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <textarea
                        value={editedProfile.address}
                        onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                        rows={2}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-foreground">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {profile.address || "Not provided"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Employee ID</label>
                  <p className="text-foreground font-medium">{profile.id}</p>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Department</label>
                  <p className="text-foreground font-medium">{profile.department}</p>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Designation</label>
                  <p className="text-foreground font-medium">{profile.designation}</p>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Join Date</label>
                  <p className="text-foreground font-medium">{profile.joinDate}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-muted-foreground mb-1">Specialization</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.specialization}
                      onChange={(e) => setEditedProfile({ ...editedProfile, specialization: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.specialization || "Not provided"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Qualifications */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Academic Qualifications</h3>
              <div className="space-y-4">
                {profile.qualifications && profile.qualifications.map((qual, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{qual.degree}</h4>
                      <p className="text-sm text-muted-foreground">{qual.institution}</p>
                      <p className="text-xs text-muted-foreground mt-1">{qual.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
