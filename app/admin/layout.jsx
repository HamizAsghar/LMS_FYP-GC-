import { AdminSidebar } from '@/components/sidebar'

export default function AdminLayout({ children }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
