import { Suspense } from 'react'

export default function SignupLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>
}
