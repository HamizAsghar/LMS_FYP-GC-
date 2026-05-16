"use client"

import { useState } from "react"
import { 
  FileText, 
  Video, 
  Download, 
  Search, 
  Play,
  File,
  Image,
  BookOpen,
  Clock,
  Eye,
  Filter
} from "lucide-react"
import { Navbar } from '@/components/navbar'
import { StatsCard } from '@/components/dashboard-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useApi } from '@/hooks/use-api'

function getMaterialIcon(type) {
  switch(type.toLowerCase()) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />
    case 'video':
      return <Video className="h-5 w-5 text-blue-500" />
    case 'slides':
      return <Image className="h-5 w-5 text-orange-500" />
    case 'document':
      return <File className="h-5 w-5 text-green-500" />
    default:
      return <File className="h-5 w-5 text-muted-foreground" />
  }
}

function getMaterialBgColor(type) {
  switch(type.toLowerCase()) {
    case 'pdf':
      return 'bg-red-500/10'
    case 'video':
      return 'bg-blue-500/10'
    case 'slides':
      return 'bg-orange-500/10'
    case 'document':
      return 'bg-green-500/10'
    default:
      return 'bg-muted'
  }
}

function getTypeBadgeColor(type) {
  switch(type.toLowerCase()) {
    case 'pdf':
      return 'bg-red-100 text-red-700'
    case 'video':
      return 'bg-blue-100 text-blue-700'
    case 'slides':
      return 'bg-orange-100 text-orange-700'
    case 'document':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

import { useAuth } from '@/contexts/auth-context'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'

export default function StudentMaterialsPage() {
  const { user: authUser } = useAuth()
  const { data: learningMaterials, loading, refetch } = useApi('/api/student/materials')
  const materials = learningMaterials || []
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  const courses = [...new Set(materials.map(m => m.course?.code).filter(Boolean))]

  const handleDownload = async (materialId) => {
    try {
      await apiFetch('/api/student/materials', {
        method: 'POST',
        body: JSON.stringify({ materialId })
      })
      refetch() // Refresh to update download count
    } catch (err) {
      console.error('Download tracking failed', err)
    }
  }

  const filteredMaterials = materials.filter(material => {
    const courseLabel = material.course?.code || material.course?.name || material.course || ''
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(courseLabel).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = selectedCourse === "all" || material.course?.code === selectedCourse
    const matchesType = selectedType === "all" || material.type.toLowerCase() === selectedType.toLowerCase()
    return matchesSearch && matchesCourse && matchesType
  })

  const stats = {
    total: materials.length,
    pdfs: materials.filter(m => m.type === 'PDF').length,
    videos: materials.filter(m => m.type === 'Video').length,
    totalDownloads: materials.reduce((acc, m) => acc + (m.downloads || 0), 0)
  }

  const MaterialCard = ({ material }) => (
    <Card className="bg-card border-border hover:border-primary/50 transition-all group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${getMaterialBgColor(material.type)}`}>
            {getMaterialIcon(material.type)}
          </div>
          <Badge className={getTypeBadgeColor(material.type)}>
            {material.type}
          </Badge>
        </div>
        
        <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{material.title}</h3>
        <p className="text-sm text-primary font-medium mb-3">{material.course?.code} - {material.course?.name}</p>
        
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center justify-between">
            <span>Size:</span>
            <span className="text-foreground">{material.size || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" /> Downloads:
            </span>
            <span className="text-foreground">{material.downloads || 0}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {material.type === "Video" ? (
            <Button className="flex-1 gap-2" asChild onClick={() => handleDownload(material._id)}>
              <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                <Play className="w-4 h-4" /> Watch
              </a>
            </Button>
          ) : (
            <Button className="flex-1 gap-2" asChild onClick={() => handleDownload(material._id)}>
              <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4" /> Download
              </a>
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Uploaded on {new Date(material.uploadedDate || material.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background/50">
      <Navbar 
        title="Learning Materials" 
        userRole="Student"
        userName={authUser?.name || "Student"}
        breadcrumbs={[
          { label: 'Student', href: '/student' },
          { label: 'Materials' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="Total Materials" value={stats.total} icon={BookOpen} />
          <StatsCard title="PDF Documents" value={stats.pdfs} icon={FileText} />
          <StatsCard title="Video Lectures" value={stats.videos} icon={Video} />
          <StatsCard title="Total Downloads" value={stats.totalDownloads} icon={Download} trend="+12%" />
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="slides">Slides</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Materials Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Materials ({filteredMaterials.length})</TabsTrigger>
            <TabsTrigger value="pdf">PDF Notes</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="slides">Slides</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pdf" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.filter(m => m.type === 'PDF').map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.filter(m => m.type === 'Video').map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="slides" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.filter(m => m.type === 'Slides').map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredMaterials.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No materials found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
