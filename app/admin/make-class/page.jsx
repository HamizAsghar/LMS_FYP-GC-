'use client'

import { Navbar } from '@/components/navbar'
import MakeClass from '@/components/admin/make-class'

export default function AdminMakeClassPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Make Class" 
        userRole="Administrator"
        userName="Admin User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Make Class' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <MakeClass />
      </main>
    </div>
  )
}
