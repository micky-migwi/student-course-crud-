import React, { useState, useEffect, useCallback } from 'react';
import { Student, Course, StudentCreate, UserRole } from '../types';
import { apiClient } from '../services/api';
import { User, Trash2, BookOpen, Plus, Search, AlertCircle, Lock } from 'lucide-react';

interface StudentManagerProps {
  courses: Course[];
  refreshTrigger: number;
  onEnrollmentChange: () => void;
  role: UserRole;
}

export const StudentManager: React.FC<StudentManagerProps> = ({ courses, refreshTrigger, onEnrollmentChange, role }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState<'name' | 'age'>('name');
  const [page, setPage] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState<StudentCreate>({ name: '', email: '', age: 18 });
  
  const [enrollModalOpen, setEnrollModalOpen] = useState<number | null>(null); // Student ID

  const canModify = role === 'admin';
  const canEnroll = role === 'admin' || role === 'teacher';

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getStudents({
        skip: page * 10,
        limit: 10,
        name: search,
        order_by: orderBy
      });
      setStudents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [page, search, orderBy, refreshTrigger]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createStudent(newStudent);
      setIsModalOpen(false);
      setNewStudent({ name: '', email: '', age: 18 });
      fetchStudents();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canModify) return;
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await apiClient.deleteStudent(id);
      fetchStudents();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEnroll = async (studentId: number, courseId: number) => {
    try {
      await apiClient.enrollStudent(studentId, courseId);
      fetchStudents(); // Refresh to show new enrollment
      onEnrollmentChange();
    } catch (err: any) {
      setError(err.message); // Show capacity errors here
    }
  };

  const handleUnenroll = async (studentId: number, courseId: number) => {
    try {
      await apiClient.unenrollStudent(studentId, courseId);
      fetchStudents();
      onEnrollmentChange();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 items-center w-full md:w-auto">
            <select 
                className="p-2 border rounded-md bg-gray-50 text-sm"
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value as 'name' | 'age')}
            >
                <option value="name">Sort by Name</option>
                <option value="age">Sort by Age</option>
            </select>
            
            {canModify && (
                <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                <Plus size={18} />
                Add Student
                </button>
            )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
        </div>
      )}

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {students.map(student => (
          <div key={student.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                  Age: {student.age}
                </span>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <BookOpen size={16} className="text-gray-400" />
                  Enrolled Courses ({student.courses?.length || 0})
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.courses && student.courses.length > 0 ? (
                    student.courses.map(c => (
                      <span key={c.id} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-100">
                        {c.title}
                        {canEnroll && (
                            <button onClick={() => handleUnenroll(student.id, c.id)} className="hover:text-red-500 ml-1">×</button>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">No active enrollments</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
               {canEnroll ? (
                    <button 
                    onClick={() => setEnrollModalOpen(student.id)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                    Manage Courses
                    </button>
               ) : (
                   <span className="text-xs text-gray-400 flex items-center gap-1">
                       <Lock size={12}/> Read Only
                   </span>
               )}
               
               {canModify && (
                    <button 
                    onClick={() => handleDelete(student.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                    <Trash2 size={18} />
                    </button>
               )}
            </div>
          </div>
        ))}
      </div>

      {students.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
            No students found.
        </div>
      )}
      
      {/* Pagination */}
      <div className="flex justify-center gap-4 pt-4">
        <button 
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
        >
            Previous
        </button>
        <span className="py-2 text-gray-600">Page {page + 1}</span>
        <button 
            disabled={students.length < 10}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
        >
            Next
        </button>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add New Student</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  required
                  minLength={2}
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  value={newStudent.name}
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  value={newStudent.email}
                  onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  required
                  type="number"
                  min={1}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  value={newStudent.age}
                  onChange={e => setNewStudent({...newStudent, age: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {enrollModalOpen !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <h3 className="text-lg font-bold mb-4">Enroll in Course</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {courses.map(course => {
                        const student = students.find(s => s.id === enrollModalOpen);
                        const isEnrolled = student?.courses?.some(c => c.id === course.id);
                        const isFull = course.enrolled_count >= course.capacity;
                        
                        if (isEnrolled) return null;

                        return (
                            <div key={course.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        {course.title}
                                        {isFull && <span className="text-xs bg-red-100 text-red-700 px-1 rounded">Full</span>}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {course.days.join(', ')} {course.start_time} | {course.enrolled_count}/{course.capacity}
                                    </div>
                                </div>
                                <button
                                    disabled={isFull}
                                    onClick={() => handleEnroll(enrollModalOpen!, course.id)}
                                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Enroll
                                </button>
                            </div>
                        );
                    })}
                    {courses.every(c => students.find(s => s.id === enrollModalOpen)?.courses?.some(enrolled => enrolled.id === c.id)) && (
                        <p className="text-center text-gray-500 italic">Student is enrolled in all available courses.</p>
                    )}
                </div>
                <div className="mt-4 text-right">
                    <button onClick={() => setEnrollModalOpen(null)} className="text-gray-600 hover:text-gray-900">Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};