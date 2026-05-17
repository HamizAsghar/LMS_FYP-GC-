"use client"
import { useState, useEffect } from "react"
import { Plus, BookOpen, Save, Trash2, CheckCircle, GraduationCap, Edit3, X, Lock, Unlock } from "lucide-react"

const MakeClass = ({ fetchData }) => {
  const [selectedProgram, setSelectedProgram] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [selectedSections, setSelectedSections] = useState([])
  const [subjects, setSubjects] = useState([{ name: "", id: Date.now() }])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [createdClasses, setCreatedClasses] = useState([])
  const [isFetchingClasses, setIsFetchingClasses] = useState(true)
  const [editingClass, setEditingClass] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [sectionsEnabled, setSectionsEnabled] = useState(false)

  // Available programs
  const programs = ["BSCS", "BBA", "ADP CS"]
  // Available semesters (1-8)
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8]
  // Available sections (A-F)
  const sections = ["A", "B", "C", "D", "E", "F"]

  // Generate class name
  const generateClassName = (program, semester, sections) => {
    if (!program || !semester || sections.length === 0) return ""
    return `${program} ${semester} ${sections.sort().join("")}`
  }

  // Fetch all classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsFetchingClasses(true)
        const response = await fetch("/api/admin/classes")
        const data = await response.json()
        if (response.ok) {
          setClasses(data.classes || [])
        } else {
          console.error("Error fetching classes:", data.message)
          alert("Failed to load classes")
        }
      } catch (error) {
        console.error("Error fetching classes:", error)
        alert("Error fetching classes. Please try again.")
      } finally {
        setIsFetchingClasses(false)
      }
    }
    fetchClasses()
  }, [])

  const handleSectionChange = (section) => {
    if (!sectionsEnabled && isEditMode) return
    setSelectedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const addSubject = () => {
    setSubjects([...subjects, { name: "", id: Date.now() }])
  }

  const removeSubject = (id) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((subject) => subject.id !== id))
    }
  }

  const updateSubject = (id, name) => {
    setSubjects(subjects.map((subject) => (subject.id === id ? { ...subject, name } : subject)))
  }

  // Handle edit class - Start with empty subjects
  const handleEditClass = (classItem) => {
    setIsEditMode(true)
    setEditingClass(classItem)
    setSelectedProgram(classItem.program)
    setSelectedSemester(classItem.semester)
    setSelectedSections([...classItem.sections])
    // Start with empty subjects for new semester
    setSubjects([{ name: "", id: Date.now() }])
    setSectionsEnabled(false) // Sections disabled by default
  }

  // Toggle sections enable/disable
  const toggleSectionsEnabled = () => {
    setSectionsEnabled(!sectionsEnabled)
  }

  // Cancel edit mode
  const cancelEdit = () => {
    setIsEditMode(false)
    setEditingClass(null)
    setSelectedProgram("")
    setSelectedSemester("")
    setSelectedSections([])
    setSubjects([{ name: "", id: Date.now() }])
    setSectionsEnabled(false)
  }

  // Handle update class
  const handleUpdateClass = async () => {
    if (
      !selectedProgram ||
      !selectedSemester ||
      selectedSections.length === 0 ||
      subjects.some((s) => !s.name.trim())
    ) {
      alert("Please fill all fields, including program, semester, and at least one section")
      return
    }

    const className = generateClassName(selectedProgram, selectedSemester, selectedSections)
    setLoading(true)

    try {
      const classData = {
        classId: editingClass._id,
        program: selectedProgram,
        className,
        semester: selectedSemester,
        sections: selectedSections,
        subjects: subjects.filter((s) => s.name.trim()).map((s) => s.name.trim()),
      }

      const response = await fetch("/api/admin/classes/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classData),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Class updated successfully!")

        // Reset form and exit edit mode
        cancelEdit()

        // Refresh data
        if (fetchData) {
          await fetchData()
        }

        // Refresh classes
        const classesResponse = await fetch("/api/admin/classes")
        const classesData = await classesResponse.json()
        if (classesResponse.ok) {
          setClasses(classesData.classes || [])
        }
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (error) {
      console.error("Error updating class:", error)
      alert("Error updating class. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClass = async () => {
    if (
      !selectedProgram ||
      !selectedSemester ||
      selectedSections.length === 0 ||
      subjects.some((s) => !s.name.trim())
    ) {
      alert("Please fill all fields, including program, semester, and at least one section")
      return
    }

    const className = generateClassName(selectedProgram, selectedSemester, selectedSections)
    setLoading(true)

    try {
      const classData = {
        program: selectedProgram,
        className,
        semester: selectedSemester,
        sections: selectedSections,
        subjects: subjects.filter((s) => s.name.trim()).map((s) => s.name.trim()),
      }

      const response = await fetch("/api/admin/create-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classData),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Class created successfully!")
        // Add to created classes list
        setCreatedClasses((prev) => [
          ...prev,
          {
            id: Date.now(),
            program: selectedProgram,
            className,
            semester: selectedSemester,
            sections: [...selectedSections],
            subjects: [...subjects.filter((s) => s.name.trim()).map((s) => s.name.trim())],
            createdAt: new Date().toISOString(),
          },
        ])
        // Reset form
        setSelectedProgram("")
        setSelectedSemester("")
        setSelectedSections([])
        setSubjects([{ name: "", id: Date.now() }])
        // Refresh data
        if (fetchData) {
          await fetchData()
        }
        // Refresh classes
        const classesResponse = await fetch("/api/admin/classes")
        const classesData = await classesResponse.json()
        if (classesResponse.ok) {
          setClasses(classesData.classes || [])
        }
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (error) {
      console.error("Error creating class:", error)
      alert("Error creating class. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClass = async (classId) => {
    if (!confirm("Are you sure you want to delete this class?")) return

    try {
      const response = await fetch("/api/admin/classes/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classId }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Class deleted successfully!")
        // Refresh classes
        const classesResponse = await fetch("/api/admin/classes")
        const classesData = await classesResponse.json()
        if (classesResponse.ok) {
          setClasses(classesData.classes || [])
        }
        // Refresh dashboard data
        if (fetchData) {
          await fetchData()
        }
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (error) {
      console.error("Error deleting class:", error)
      alert("Error deleting class. Please try again.")
    }
  }

  const displayClassName = generateClassName(selectedProgram, selectedSemester, selectedSections)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">{isEditMode ? "Edit Class" : "Make Class"}</h1>
        <div className="text-gray-400">{isEditMode ? "Update existing class" : "Create new classes"}</div>
      </div>

      {/* Edit Mode Alert */}
      {isEditMode && (
        <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Edit3 className="mr-2 text-blue-400" size={20} />
            <span className="text-blue-400 font-medium">Editing: {editingClass?.className}</span>
            <span className="ml-4 text-sm text-gray-400">
              (Previous subjects cleared - Add new subjects for current semester)
            </span>
          </div>
          <button onClick={cancelEdit} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Class Creation/Edit Form */}
      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          {isEditMode ? (
            <>
              <Edit3 className="mr-2" size={24} />
              Update Class - Add New Subjects
            </>
          ) : (
            <>
              <Plus className="mr-2" size={24} />
              Create New Class
            </>
          )}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Program Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <GraduationCap className="mr-2" size={16} />
                Select Program
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                disabled={isEditMode}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Choose program</option>
                {programs.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
              {isEditMode && <p className="text-xs text-gray-400 mt-1">Program cannot be changed in edit mode</p>}
            </div>

            {/* Semester Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={isEditMode}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Choose semester</option>
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
              {isEditMode && <p className="text-xs text-gray-400 mt-1">Semester cannot be changed in edit mode</p>}
            </div>

            {/* Section Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">Select Sections</label>
                {isEditMode && (
                  <button
                    onClick={toggleSectionsEnabled}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center ${sectionsEnabled
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-600 hover:bg-gray-700 text-gray-300"
                      }`}
                  >
                    {sectionsEnabled ? (
                      <>
                        <Unlock className="mr-1" size={12} />
                        Sections Enabled
                      </>
                    ) : (
                      <>
                        <Lock className="mr-1" size={12} />
                        Enable Sections
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {sections.map((section) => (
                  <label key={section} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section)}
                      onChange={() => handleSectionChange(section)}
                      disabled={isEditMode && !sectionsEnabled}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className={`text-white ${isEditMode && !sectionsEnabled ? "opacity-50" : ""}`}>
                      Section {section}
                    </span>
                  </label>
                ))}
              </div>
              {selectedSections.length > 0 && (
                <div className="mt-2 text-sm text-blue-400">Selected: {selectedSections.join(", ")}</div>
              )}
              {isEditMode && !sectionsEnabled && (
                <p className="text-xs text-yellow-400 mt-2">
                  ⚠️ Sections are locked. Click "Enable Sections" to modify sections.
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Subjects */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                  <BookOpen className="mr-2" size={16} />
                  Subjects {isEditMode && <span className="ml-2 text-xs text-green-400">(New Semester)</span>}
                </label>
                <button
                  onClick={addSubject}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center"
                >
                  <Plus className="mr-1" size={14} />
                  Add Subject
                </button>
              </div>
              {isEditMode && (
                <div className="mb-3 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    📚 Previous semester subjects have been cleared. Add new subjects for the current semester.
                  </p>
                </div>
              )}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {subjects.map((subject, index) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={subject.name}
                      onChange={(e) => updateSubject(subject.id, e.target.value)}
                      placeholder={`Subject ${index + 1} (e.g., ${isEditMode ? "Advanced Programming, Data Structures" : "Web App Programming Fundamentals"})`}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {subjects.length > 1 && (
                      <button
                        onClick={() => removeSubject(subject.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            {selectedProgram && selectedSemester && selectedSections.length > 0 && (
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-blue-400 font-medium mb-2">Class Preview</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>
                    <strong>Class:</strong> {displayClassName}
                  </p>
                  <p>
                    <strong>Program:</strong> {selectedProgram}
                  </p>
                  <p>
                    <strong>Semester:</strong> {selectedSemester}
                  </p>
                  <p>
                    <strong>Sections:</strong> {selectedSections.join(", ")}
                  </p>
                  <p>
                    <strong>New Subjects:</strong> {subjects.filter((s) => s.name.trim()).length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          {isEditMode ? (
            <>
              <button
                onClick={handleUpdateClass}
                disabled={
                  loading ||
                  !selectedProgram ||
                  !selectedSemester ||
                  selectedSections.length === 0 ||
                  subjects.some((s) => !s.name.trim())
                }
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  "Updating Class..."
                ) : (
                  <>
                    <Save className="mr-2" size={20} />
                    Update Class with New Subjects
                  </>
                )}
              </button>
              <button
                onClick={cancelEdit}
                disabled={loading}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                <X className="mr-2" size={20} />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleCreateClass}
              disabled={
                loading ||
                !selectedProgram ||
                !selectedSemester ||
                selectedSections.length === 0 ||
                subjects.some((s) => !s.name.trim())
              }
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                "Creating Class..."
              ) : (
                <>
                  <Save className="mr-2" size={20} />
                  Create Class
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Recently Created Classes */}
      {createdClasses.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <CheckCircle className="mr-2" size={24} />
            Recently Created Classes ({createdClasses.length})
          </h2>
          <div className="space-y-4">
            {createdClasses.map((classItem) => (
              <div key={classItem.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-white font-semibold mb-2">📚 {classItem.className}</h3>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>
                        <span className="text-gray-400">Program:</span> {classItem.program}
                      </p>
                      <p>
                        <span className="text-gray-400">Semester:</span> {classItem.semester}
                      </p>
                      <p>
                        <span className="text-gray-400">Sections:</span> {classItem.sections.join(", ")}
                      </p>
                      <p>
                        <span className="text-gray-400">Created:</span>{" "}
                        {new Date(classItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">📚 Subjects:</h4>
                    <div className="space-y-1">
                      {classItem.subjects.map((subject, index) => (
                        <div key={index} className="text-sm bg-gray-800 rounded px-2 py-1 text-green-400">
                          {subject}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Currently Available Classes */}
      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <BookOpen className="mr-2" size={24} />
          Currently Available Classes ({classes.length})
        </h2>
        {isFetchingClasses ? (
          <p className="text-gray-400 text-center py-4">Loading classes...</p>
        ) : classes.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No classes available</p>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem) => (
              <div key={classItem._id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-white font-semibold mb-2">📚 {classItem.className}</h3>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>
                        <span className="text-gray-400">Program:</span> {classItem.program}
                      </p>
                      <p>
                        <span className="text-gray-400">Semester:</span> {classItem.semester}
                      </p>
                      <p>
                        <span className="text-gray-400">Sections:</span> {classItem.sections.join(", ")}
                      </p>
                      <p>
                        <span className="text-gray-400">Created:</span>{" "}
                        {new Date(classItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">📚 Current Subjects:</h4>
                    <div className="space-y-1 mb-4">
                      {classItem.subjects && classItem.subjects.length > 0 ? (
                        classItem.subjects.map((subject, index) => (
                          <div key={index} className="text-sm bg-gray-800 rounded px-2 py-1 text-green-400">
                            {subject}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-yellow-400 italic">
                          No subjects - Ready for new semester subjects
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClass(classItem)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                      >
                        <Edit3 className="mr-2" size={14} />
                        Add New Subjects
                      </button>
                      <button
                        onClick={() => handleDeleteClass(classItem._id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                      >
                        <Trash2 className="mr-2" size={14} />
                        Delete Class
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MakeClass
