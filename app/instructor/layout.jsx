import { InstructorSidebar } from '@/components/sidebar'

export default function InstructorLayout({ children }) {
  return (
    <div className="flex">
      <InstructorSidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
