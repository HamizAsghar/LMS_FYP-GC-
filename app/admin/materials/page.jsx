'use client'


import { 
  FolderOpen, 
  Search, 
  Plus,
  Download,
  FileText,
  Video,
  Image,
  File,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Upload,
  Filter
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { StatsCard, StatusBadge } from '@/components/dashboard-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea'
import { apiFetch } from '@/lib/api-client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

function getMaterialIcon(type) {
  switch(type.toLowerCase()) {
    case 'pdf':
      return <FileText className="h-6 w-6 text-red-500" />
    case 'video':
      return <Video className="h-6 w-6 text-blue-500" />
    case 'slides':
      return <Image className="h-6 w-6 text-orange-500" />
    case 'document':
      return <File className="h-6 w-6 text-green-500" />
    default:
      return <FolderOpen className="h-6 w-6 text-primary" />
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
      return 'bg-primary/10'
  }
}

export default function LearningMaterialsPage() {
  const [materialsList, setMaterialsList] = useState([])
  const [coursesList, setCoursesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCourse, setFilterCourse] = useState('all')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [materialsRes, coursesRes] = await Promise.all([
        apiFetch('/api/admin/materials?limit=100'),
        apiFetch('/api/admin/courses?limit=100')
      ])
      
      if (materialsRes.success) {
        setMaterialsList(materialsRes.data.materials)
      }
      if (coursesRes.success) {
        setCoursesList(coursesRes.data.courses)
      }
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.error("Failed to load data", err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteMaterial = async (id) => {
    if (!confirm('Are you sure you want to delete this material?')) return
    try {
      const res = await apiFetch(`/api/admin/materials/${id}`, {
        method: 'DELETE'
      })
      if (res.success) {
        toast.success('Material deleted successfully')
        fetchData()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete material')
    }
  }

  const filteredMaterials = materialsList.filter(material => {
    const title = material.title || ''
    const courseCode = material.course?.code || ''
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         courseCode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || (material.type || '').toLowerCase() === filterType.toLowerCase()
    const matchesCourse = filterCourse === 'all' || material.course?._id === filterCourse
    return matchesSearch && matchesType && matchesCourse
  })

  const stats = {
    total: materialsList.length,
    pdfs: materialsList.filter(m => (m.type || '').toUpperCase() === 'PDF').length,
    videos: materialsList.filter(m => (m.type || '').toUpperCase() === 'VIDEO').length,
    slides: materialsList.filter(m => (m.type || '').toUpperCase() === 'SLIDES').length,
    totalDownloads: materialsList.reduce((acc, m) => acc + (m.downloads || 0), 0)
  }

  const MaterialCard = ({ material }) => (
    <Card className="bg-card border-border hover:border-primary/50 transition-all group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-lg ${getMaterialBgColor(material.type || '')} flex items-center justify-center flex-shrink-0`}>
            {getMaterialIcon(material.type || '')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium text-foreground truncate">{material.title}</h3>
                <p className="text-sm text-muted-foreground">{material.course?.code || 'No Course'}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {material.fileUrl && (
                    <DropdownMenuItem className="gap-2" onClick={() => window.open(material.fileUrl, '_blank')}>
                      <Eye className="h-4 w-4" /> Preview
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDeleteMaterial(material._id)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <Badge variant="outline">{(material.type || 'FILE').toUpperCase()}</Badge>
              <span className="text-muted-foreground">{material.size || 'N/A'}</span>
              <span className="text-muted-foreground">{material.downloads || 0} downloads</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">By {material.uploadedBy?.name || 'Instructor'}</span>
              <span className="text-xs text-muted-foreground">{new Date(material.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Learning Materials" 
        userRole="Administrator"
        userName="Admin User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Learning Materials' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard title="Total Materials" value={stats.total} icon={FolderOpen} />
          <StatsCard title="PDF Notes" value={stats.pdfs} icon={FileText} />
          <StatsCard title="Videos" value={stats.videos} icon={Video} />
          <StatsCard title="Slides" value={stats.slides} icon={Image} />
          <StatsCard title="Total Downloads" value={stats.totalDownloads} icon={Download} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search materials..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="slides">Slides</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {coursesList.map(course => (
                  <SelectItem key={course._id} value={course._id}>{course.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button className="gap-2" onClick={() => toast.info('Materials are managed by instructors')}>
            <Upload className="h-4 w-4" />
            Upload Info
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4" onValueChange={setFilterType}>
          <TabsList>
            <TabsTrigger value="all">All Materials</TabsTrigger>
            <TabsTrigger value="pdf">PDF Notes</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="slides">Slides</TabsTrigger>
            <TabsTrigger value="document">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value={filterType} className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground py-10 text-center">Loading materials...</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredMaterials.map(material => (
                  <MaterialCard key={material._id} material={material} />
                ))}
                {filteredMaterials.length === 0 && (
                  <p className="text-muted-foreground py-10 text-center col-span-2">No materials found for this filter.</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
