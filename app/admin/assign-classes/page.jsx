'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import AssignClasses from '@/components/admin/assign-classes'
import { apiFetch } from '@/lib/api-client'

export default function AdminAssignClassesPage() {
  const [teachers, setTeachers] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch classes
      const classesRes = await fetch('/api/admin/classes')
      const classesData = await classesRes.json()
      
      // Fetch teachers
      const teachersRes = await apiFetch('/api/admin/users?role=Instructor&limit=100')
      
      if (classesRes.ok) {
        setClasses(classesData.classes || [])
      }
      if (teachersRes.success) {
        const mappedTeachers = (teachersRes.data.users || []).map(u => ({
          ...u,
          isApproved: u.approvalStatus === 'Approved' || u.status === 'Active'
        }))
        setTeachers(mappedTeachers)
      }
    } catch (error) {
      console.error('Error fetching data for assign classes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Assign Classes" 
        userRole="Administrator"
        userName="Admin User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Assign Classes' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading...</div>
        ) : (
          <AssignClasses 
            allTeachers={teachers} 
            classes={classes} 
            fetchData={fetchData} 
          />
        )}
      </main>
    </div>
  )
}
