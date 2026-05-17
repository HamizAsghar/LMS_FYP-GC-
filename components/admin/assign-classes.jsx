"use client";

import { useState, useEffect } from "react";
import { Users, BookOpen, Send, Key, User, CheckCircle, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import Select from "react-select";

export default function AssignClasses({ allTeachers, classes, fetchData }) {
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedSections, setSelectedSections] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [classCredentials, setClassCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssignedClasses = async () => {
    setLoadingAssigned(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/assigned-classes", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok) {
        setAssignedClasses(data.assignedClasses || []);
      } else {
        setError(data.message || `HTTP ${response.status}`);
      }
    } catch (error) {
      setError(`Network error: ${error.message}`);
    } finally {
      setLoadingAssigned(false);
    }
  };

  useEffect(() => {
    fetchAssignedClasses();
  }, []);

  useEffect(() => {
    const fetchAvailableSubjects = async () => {
      if (!selectedClass || !selectedSections.length) {
        setAvailableSubjects([]);
        setSubject("");
        return;
      }
      try {
        const response = await fetch(`/api/admin/available-subjects?classId=${selectedClass}&sections=${selectedSections.join(",")}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (response.ok) {
          setAvailableSubjects(data.availableSubjects || []);
        } else {
          setAvailableSubjects([]);
        }
      } catch (error) {
        setAvailableSubjects([]);
      }
    };
    fetchAvailableSubjects();
  }, [selectedClass, selectedSections]);

  const availableTeachers = allTeachers?.filter((teacher) => teacher.isApproved) || [];
  const availableClasses = classes?.filter((cls) => cls.sections.length > 0) || [];
  const selectedClassData = classes?.find((c) => c._id === selectedClass);

  // Prepare options for react-select
  const sectionOptions = selectedClassData?.sections.map((section) => ({
    value: section,
    label: `Section ${section}`,
  })) || [];

  const generateCredentials = () => {
    if (selectedClassData && subject && selectedSections.length > 0) {
      const sectionPart = selectedSections.length === selectedClassData.sections.length 
        ? "all" 
        : selectedSections.join("_").toLowerCase();
      const username = `class_${selectedClassData.program.toLowerCase()}_${selectedClassData.semester}_${subject.toLowerCase()}_${sectionPart}`;
      const password = Math.random().toString(36).slice(-8);
      setClassCredentials({ username, password });
    }
  };

  const handleAssignClass = async () => {
    if (!selectedTeacher || !selectedClass || !subject || selectedSections.length === 0 || !classCredentials.username || !classCredentials.password) {
      alert("Please fill all fields, select at least one section, and generate credentials");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/admin/assign-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selectedTeacher,
          classId: selectedClass,
          subject,
          sections: selectedSections,
          credentials: classCredentials,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Class assigned successfully! Email sent to teacher.");
        setSelectedTeacher("");
        setSelectedClass("");
        setSubject("");
        setSelectedSections([]);
        setClassCredentials({ username: "", password: "" });
        setAvailableSubjects([]);
        await Promise.all([fetchData(), fetchAssignedClasses()]);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert("Error assigning class. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignClass = async (teacherId, classId, section, subject) => {
    if (!confirm(`Are you sure you want to unassign ${subject} for section ${section}?`)) return;
    try {
      const response = await fetch("/api/admin/unassign-class", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, classId, section, subject }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Class unassigned successfully!");
        await Promise.all([fetchData(), fetchAssignedClasses()]);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert("Error unassigning class. Please try again.");
    }
  };

  const selectedTeacherData = allTeachers?.find((t) => t._id === selectedTeacher);

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#374151",
      borderColor: "#4b5563",
      color: "#ffffff",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#374151",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#3b82f6" : "#374151",
      color: "#ffffff",
      "&:hover": {
        backgroundColor: "#4b5563",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#3b82f6",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#ffffff",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#ffffff",
      "&:hover": {
        backgroundColor: "#2563eb",
        color: "#ffffff",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#ffffff",
    }),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Assign Classes</h1>
        <div className="text-gray-400">
          {availableTeachers.length} approved teachers • {availableClasses.length} available classes
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Users className="mr-2" size={24} />
          Assign Teacher to Class
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <User className="mr-2" size={16} />
                Available Teachers
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Teacher</option>
                {availableTeachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} - {teacher.email}
                  </option>
                ))}
              </select>
              {availableTeachers.length === 0 && (
                <p className="text-yellow-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="mr-1" size={14} />
                  No approved teachers available
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <BookOpen className="mr-2" size={16} />
                Available Classes
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSubject("");
                  setSelectedSections([]); // Reset sections when class changes
                  setAvailableSubjects([]);
                  setClassCredentials({ username: "", password: "" });
                }}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Class</option>
                {availableClasses.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.program} - {cls.className} - Semester {cls.semester}
                  </option>
                ))}
              </select>
              {availableClasses.length === 0 && (
                <p className="text-yellow-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="mr-1" size={14} />
                  No available classes
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <BookOpen className="mr-2" size={16} />
                Sections
              </label>
              <Select
                isMulti
                options={sectionOptions}
                value={sectionOptions.filter((option) => selectedSections.includes(option.value))}
                onChange={(selected) => setSelectedSections(selected.map((option) => option.value))}
                className="w-full text-white"
                classNamePrefix="select"
                styles={customSelectStyles}
                placeholder="Select Sections"
                isDisabled={!selectedClass}
              />
              {selectedClassData?.sections.length === 0 && selectedClass && (
                <p className="text-yellow-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="mr-1" size={14} />
                  No sections available for this class
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedClass || !selectedSections.length}
              >
                <option value="">Select Subject</option>
                {selectedClassData?.subjects.map((sub) => (
                  <option key={sub} value={sub} disabled={!availableSubjects.includes(sub)}>
                    {sub} {availableSubjects.includes(sub) ? "" : "(Assigned)"}
                  </option>
                ))}
              </select>
              {availableSubjects.length === 0 && selectedClass && selectedSections.length > 0 && (
                <p className="text-yellow-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="mr-1" size={14} />
                  All subjects are assigned for the selected sections
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <Key className="mr-2" size={16} />
                Class Credentials
              </label>
              <button
                onClick={generateCredentials}
                disabled={!selectedClass || !subject || selectedSections.length === 0}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                Generate
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
              <input
                type="text"
                value={classCredentials.username}
                onChange={(e) => setClassCredentials({ ...classCredentials, username: e.target.value })}
                placeholder="Class username"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input
                type="text"
                value={classCredentials.password}
                onChange={(e) => setClassCredentials({ ...classCredentials, password: e.target.value })}
                placeholder="Class password"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedTeacherData && selectedClassData && subject && selectedSections.length > 0 && (
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-blue-400 font-medium mb-2">Assignment Preview</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p><strong>Teacher:</strong> {selectedTeacherData.name}</p>
                  <p><strong>Class:</strong> {selectedClassData.program} - {selectedClassData.className} - Semester {selectedClassData.semester}</p>
                  <p><strong>Sections:</strong> {selectedSections.join(", ")}</p>
                  <p><strong>Subject:</strong> {subject}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleAssignClass}
            disabled={loading || !selectedTeacher || !selectedClass || !subject || selectedSections.length === 0 || !classCredentials.username || !classCredentials.password}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              "Assigning..."
            ) : (
              <>
                <Send className="mr-2" size={20} />
                Assign Class
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <CheckCircle className="mr-2" size={24} />
            Currently Assigned Classes ({assignedClasses.length})
          </h2>
          <button
            onClick={fetchAssignedClasses}
            disabled={loadingAssigned}
            className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            <RefreshCw className={`${loadingAssigned ? "animate-spin" : ""}`} size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <p className="text-red-400">❌ Error: {error}</p>
            <button onClick={fetchAssignedClasses} className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg">
              Try Again
            </button>
          </div>
        )}

        <div className="space-y-4">
          {loadingAssigned ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Loading assigned classes...</div>
            </div>
          ) : assignedClasses.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto text-gray-500 mb-4" size={48} />
              <p className="text-gray-400">No classes assigned yet</p>
            </div>
          ) : (
            assignedClasses.map((assignment, index) => (
              <div
                key={`${assignment.teacherId}-${assignment.classDetails?.classId || "no-class"}-${assignment.section}-${assignment.subject}-${index}`}
                className="bg-gray-700/50 rounded-lg p-6 border border-gray-600"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-3">👨🏫 Teacher Information</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-400">Name:</span>{" "}
                        <span className="text-white font-medium">{assignment.teacherName || "N/A"}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">Email:</span>{" "}
                        <span className="text-gray-300">{assignment.teacherEmail || "N/A"}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">Subject:</span>{" "}
                        <span className="text-green-400 font-medium">{assignment.subject || "N/A"}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">Assigned:</span>{" "}
                        <span className="text-gray-300">
                          {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold text-lg mb-3">📚 Class Information</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-400">Class:</span>{" "}
                        <span className="text-blue-400 font-medium">{assignment.assignedClass || "N/A"}</span>
                      </p>
                      {assignment.classDetails ? (
                        <>
                          <p>
                            <span className="text-gray-400">Program:</span>{" "}
                            <span className="text-gray-300">{assignment.classDetails.program || "N/A"}</span>
                          </p>
                          <p>
                            <span className="text-gray-400">Semester:</span>{" "}
                            <span className="text-gray-300">{assignment.classDetails.semester || "N/A"}</span>
                          </p>
                          <p>
                            <span className="text-gray-400">Section:</span>{" "}
                            <span className="text-gray-300">{assignment.section || "N/A"}</span>
                          </p>
                          <p>
                            <span className="text-gray-400">Class ID:</span>{" "}
                            <span className="text-gray-300 font-mono text-xs">
                              {assignment.classDetails.classId || "N/A"}
                            </span>
                          </p>
                        </>
                      ) : (
                        <p className="text-yellow-400 text-sm flex items-center">
                          <AlertCircle className="mr-1" size={14} />
                          No class details available
                        </p>
                      )}
                      <button
                        onClick={() =>
                          handleUnassignClass(
                            assignment.teacherId,
                            assignment.classDetails?.classId || assignment.classId,
                            assignment.section,
                            assignment.subject
                          )
                        }
                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                      >
                        <Trash2 className="mr-2" size={14} />
                        Unassign Class
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-600">
                  <h3 className="text-white font-semibold text-lg mb-3">🔐 Student Login Credentials</h3>
                  {assignment.classCredentials ? (
                    <div className="bg-gray-800/50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 text-sm">Username:</span>
                        <div className="bg-gray-900 rounded px-3 py-2 font-mono text-blue-400 text-sm mt-1">
                          {assignment.classCredentials.username || "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Password:</span>
                        <div className="bg-gray-900 rounded px-3 py-2 font-mono text-green-400 text-sm mt-1">
                          {assignment.classCredentials.password || "N/A"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-yellow-400 text-sm flex items-center">
                      <AlertCircle className="mr-1" size={14} />
                      No credentials available
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
