import { Suspense } from 'react'

export default function ResetPasswordLayout({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      {children}
    </Suspense>
  )
}
