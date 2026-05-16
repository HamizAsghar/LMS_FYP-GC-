'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useApi } from '@/hooks/use-api'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export function PendingInstructorsPanel() {
  const { data: pending, loading, refetch } = useApi('/api/admin/instructors/pending')
  const [acting, setActing] = useState(null)

  const handleAction = async (id, action) => {
    setActing(id)
    try {
      await apiFetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ action }),
      })
      toast.success(action === 'approve' ? 'Instructor approved' : 'Instructor rejected')
      refetch()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActing(null)
    }
  }

  if (loading || !pending?.length) return null

  return (
    <Card className="border-amber-500/50 bg-amber-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-amber-500" />
          Pending Instructor Approvals
        </CardTitle>
        <CardDescription>Review and approve instructor registration requests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {pending.map((inst) => (
          <div key={inst.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-card">
            <div>
              <p className="font-medium text-foreground">{inst.name}</p>
              <p className="text-sm text-muted-foreground">{inst.email}</p>
              <Badge variant="outline" className="mt-1">{inst.department || 'No department'}</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="gap-1"
                disabled={acting === inst.id}
                onClick={() => handleAction(inst.id, 'approve')}
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1"
                disabled={acting === inst.id}
                onClick={() => handleAction(inst.id, 'reject')}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
