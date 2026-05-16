'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  trendUp = true,
  className 
}) {
  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span className={cn(
                "text-xs font-medium",
                trendUp ? "text-green-500" : "text-red-500"
              )}>
                {trendUp ? '+' : ''}{trend}
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}

export function LoadingSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded animate-pulse flex-1" />
        ))}
      </div>
      {/* Row Skeletons */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="h-10 bg-muted/50 rounded animate-pulse flex-1" 
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-muted/50 rounded animate-pulse mb-2" />
        <div className="h-3 w-32 bg-muted/30 rounded animate-pulse" />
      </CardContent>
    </Card>
  )
}

export function StatusBadge({ status }) {
  const statusStyles = {
    'Active': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Completed': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Pending': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'In Progress': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'Inactive': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    'Submitted': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Graded': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Late': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Planning': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      statusStyles[status] || 'bg-muted text-muted-foreground border-border'
    )}>
      {status}
    </span>
  )
}

export function ProgressBar({ value, max = 100, showLabel = true, size = 'default' }) {
  const percentage = Math.round((value / max) * 100)
  
  const getColor = () => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="w-full">
      <div className={cn(
        "w-full bg-muted rounded-full overflow-hidden",
        size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'
      )}>
        <div 
          className={cn("h-full transition-all duration-300", getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted-foreground mt-1">{percentage}%</p>
      )}
    </div>
  )
}

export function AvatarGroup({ users, max = 4 }) {
  const displayUsers = users.slice(0, max)
  const remaining = users.length - max

  return (
    <div className="flex -space-x-2">
      {displayUsers.map((user, index) => (
        <div 
          key={index}
          className="h-8 w-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-xs font-medium text-primary"
          title={user.name}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
          +{remaining}
        </div>
      )}
    </div>
  )
}
