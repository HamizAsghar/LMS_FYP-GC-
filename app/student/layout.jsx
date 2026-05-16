import { StudentSidebar } from '@/components/sidebar'

export default function StudentLayout({ children }) {
  return (
    <div className="flex">
      <StudentSidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
