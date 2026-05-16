'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/navbar'
import { Mail, Award, BookOpen, CalendarDays } from 'lucide-react'

export default function ProfilePage() {
  return (
    <>
      <Navbar title="My Profile" />
      
      <main className="p-6 md:p-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <Card className="border-border bg-card mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">John Doe</CardTitle>
                  <CardDescription>Student Account</CardDescription>
                </div>
                <Link href="/student/settings">
                  <Button variant="outline">Edit Profile</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                john.doe@example.com
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="w-4 h-4" />
                Joined May 2024
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">70%</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Your earned badges and certificates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge className="inline-block mr-2">React Master</Badge>
              <Badge className="inline-block mr-2">JavaScript Expert</Badge>
              <Badge className="inline-block mr-2">Design Enthusiast</Badge>
              <Badge className="inline-block mr-2">Top Performer</Badge>
              <Badge className="inline-block mr-2">Community Helper</Badge>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
