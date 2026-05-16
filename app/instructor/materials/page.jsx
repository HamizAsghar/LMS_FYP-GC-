"use client"

import { useState, useEffect } from "react"
import { 
  FileText, 
  Video, 
  Upload, 
  Search, 
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Eye,
  File,
  Image
} from "lucide-react"
import { Navbar } from '@/components/navbar'
import { StatsCard } from '@/components/dashboard-components'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

import { apiFetch } from '@/lib/api-client';

export default function InstructorMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  
  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCourse, setUploadCourse] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [materialsRes, coursesRes] = await Promise.all([
        apiFetch('/api/instructor/materials').catch(() => null),
        apiFetch('/api/instructor/courses').catch(() => null)
      ]);
      
      if (materialsRes?.success) {
        setMaterials(materialsRes.data.materials || []);
        if (materialsRes.data.user) setUser(materialsRes.data.user);
      }
      
      if (coursesRes?.success) {
        setCourses(coursesRes.data.courses || []);
        if (!materialsRes?.data?.user && coursesRes.data.user) setUser(coursesRes.data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async () => {
    if (!uploadTitle || !uploadCourse || (!uploadFile && !editingId)) {
      alert("Title, course, and file are required.");
      return;
    }
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("title", uploadTitle);
      formData.append("course", uploadCourse);
      formData.append("description", uploadDescription);
      if (uploadFile) formData.append("file", uploadFile);

      const url = editingId 
        ? `/api/instructor/materials/${editingId}`
        : '/api/instructor/materials';
      
      const method = editingId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: formData
      });

      if (res.success) {
        // Reset form
        setUploadTitle("");
        setUploadCourse("");
        setUploadDescription("");
        setUploadFile(null);
        setEditingId(null);
        setShowUploadModal(false);
        // Refresh data
        fetchData();
      } else {
        alert(res.message || "Failed to save");
      }
    } catch (err) {
      alert(err.message || "Save error");
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (material) => {
    setEditingId(material._id);
    setUploadTitle(material.title);
    setUploadCourse(material.courseId);
    setUploadDescription(material.description || "");
    setUploadFile(null);
    setShowUploadModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    
    try {
      const res = await apiFetch(`/api/instructor/materials/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        fetchData();
      } else {
        alert(res.message || "Failed to delete");
      }
    } catch (err) {
      alert(err.message || "Delete error");
    }
  };

  const getCourseDisplayStr = (c) => `${c.code || ''} - ${c.name || ''}`;

  const filteredMaterials = materials.filter(m => 
    (selectedCourse === "All Courses" || m.course === selectedCourse) &&
    (m.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case "PDF": return <FileText className="w-5 h-5 text-red-500" />
      case "Video": return <Video className="w-5 h-5 text-blue-500" />
      case "Presentation": return <Image className="w-5 h-5 text-orange-500" />
      default: return <File className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "PDF": return "bg-red-100 text-red-700"
      case "Video": return "bg-blue-100 text-blue-700"
      case "Presentation": return "bg-orange-100 text-orange-700"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Course Materials" 
        userRole="Instructor"
        userName={user?.name || 'Instructor'}
        breadcrumbs={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'Materials' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Material Management</h2>
            <p className="text-muted-foreground">Upload and manage learning materials for your courses</p>
          </div>
          <Dialog open={showUploadModal} onOpenChange={(open) => {
            if (!open) {
              setShowUploadModal(false);
              setEditingId(null);
              setUploadTitle("");
              setUploadCourse("");
              setUploadDescription("");
              setUploadFile(null);
            } else {
              setShowUploadModal(true);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => {
                setEditingId(null);
                setUploadTitle("");
                setUploadCourse("");
                setUploadDescription("");
                setUploadFile(null);
              }}>
                <Upload className="w-4 h-4" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Material" : "Upload Material"}</DialogTitle>
                <DialogDescription>{editingId ? "Update material details" : "Add new learning materials for students"}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    placeholder="Material title" 
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select value={uploadCourse} onValueChange={setUploadCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors relative">
                    <Input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                    />
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {uploadFile ? uploadFile.name : (editingId ? "Click to replace file (optional)" : "Click to upload or drag and drop")}
                    </p>
                    {!uploadFile && !editingId && <p className="text-xs text-muted-foreground mt-1">PDF, Video, or Presentation (max 500MB)</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea 
                    placeholder="Brief description..." 
                    rows={3} 
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{materials.length}</p>
              <p className="text-sm text-muted-foreground">Total Materials</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {materials.filter(m => m.type === "PDF").length}
              </p>
              <p className="text-sm text-muted-foreground">PDF Documents</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {materials.filter(m => m.type === "Video").length}
              </p>
              <p className="text-sm text-muted-foreground">Video Lectures</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {materials.reduce((sum, m) => sum + (m.downloads || m.views || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Downloads/Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All Courses">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={getCourseDisplayStr(course)}>
                {getCourseDisplayStr(course)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Material</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Course</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Size</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Uploaded</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stats</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMaterials.map((material) => (
                <tr key={material._id} className="hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTypeIcon(material.type)}
                      </div>
                      <span className="font-medium text-foreground">{material.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{material.course}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(material.type)}`}>
                      {material.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{material.size}</td>
                  <td className="py-3 px-4 text-muted-foreground">{material.uploadedAt}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {material.downloads ? `${material.downloads} downloads` : `${material.views || 0} views`}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button 
                        className="p-1 hover:bg-muted rounded" 
                        title="View/Download" 
                        onClick={() => {
                          if (material.fileUrl) window.open(material.fileUrl, '_blank');
                          else alert("File URL not available");
                        }}
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-1 hover:bg-muted rounded" title="Edit" onClick={() => openEditModal(material)}>
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-1 hover:bg-muted rounded" title="Delete" onClick={() => handleDelete(material._id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No materials found</h3>
          <p className="text-muted-foreground">Try adjusting your search or upload new materials</p>
        </div>
      )}
      </main>
    </div>
  )
}
