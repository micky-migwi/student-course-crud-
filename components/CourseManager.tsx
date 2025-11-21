import React, { useState, useEffect, useCallback } from 'react';
import { Course, CourseCreate, UserRole } from '../types';
import { apiClient } from '../services/api';
import { Book, Trash2, Plus, Search, AlertCircle, Clock, Calendar, Users } from 'lucide-react';

interface CourseManagerProps {
  role: UserRole;
  onCourseChange: () => void;
}

const DAYS_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const CourseManager: React.FC<CourseManagerProps> = ({ role, onCourseChange }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState<CourseCreate>({ 
    title: '', 
    description: '', 
    credits: 3,
    days: [],
    start_time: '09:00',
    end_time: '10:30',
    capacity: 20
  });

  const canEdit = role === 'admin' || role === 'teacher';
  const canDelete = role === 'admin';

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getCourses({
        title: search,
        order_by: 'title'
      });
      setCourses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCourse.days.length === 0) {
        setError("Please select at least one day.");
        return;
    }
    try {
      await apiClient.createCourse(newCourse);
      setIsModalOpen(false);
      setNewCourse({ 
          title: '', description: '', credits: 3, 
          days: [], start_time: '09:00', end_time: '10:30', capacity: 20 
      });
      fetchCourses();
      onCourseChange();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDelete) return;
    if (!window.confirm("Delete this course? Note: Enrollments might be affected.")) return;
    try {
      await apiClient.deleteCourse(id);
      fetchCourses();
      onCourseChange();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleDay = (day: string) => {
      setNewCourse(prev => {
          if (prev.days.includes(day)) {
              return { ...prev, days: prev.days.filter(d => d !== day) };
          }
          return { ...prev, days: [...prev.days, day] };
      })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {canEdit && (
            <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors whitespace-nowrap"
            >
            <Plus size={18} />
            Create Course
            </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map(course => {
          const usagePct = Math.min(100, (course.enrolled_count / course.capacity) * 100);
          const isFull = course.enrolled_count >= course.capacity;

          return (
            <div key={course.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Book size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                        <span className="text-sm text-gray-500">{course.credits} Credits</span>
                    </div>
                </div>
                </div>
                
                <p className="text-gray-600 flex-grow mb-4 text-sm line-clamp-2">{course.description}</p>
                
                {/* Schedule & Capacity Info */}
                <div className="space-y-3 mb-4 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium">{course.days?.join(", ") || "TBA"}</span>
                        <span className="text-gray-300">|</span>
                        <Clock size={16} className="text-gray-400" />
                        <span>{course.start_time} - {course.end_time}</span>
                    </div>
                    
                    <div>
                        <div className="flex justify-between text-xs mb-1 font-medium">
                            <div className="flex items-center gap-1 text-gray-600">
                                <Users size={14} />
                                Capacity
                            </div>
                            <span className={isFull ? "text-red-600" : "text-emerald-600"}>
                                {course.enrolled_count} / {course.capacity} Enrolled
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-2 rounded-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${usagePct}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {canDelete && (
                    <div className="flex justify-end pt-3 border-t border-gray-100">
                        <button 
                            onClick={() => handleDelete(course.id)}
                            className="text-gray-400 hover:text-red-600 flex items-center gap-2 text-sm transition-colors"
                        >
                            <Trash2 size={16} />
                            Delete Course
                        </button>
                    </div>
                )}
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Course</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                    <input
                    required
                    minLength={2}
                    type="text"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                    value={newCourse.title}
                    onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                    required
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                    rows={2}
                    value={newCourse.description}
                    onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                    <input
                    required
                    type="number"
                    min={1}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                    value={newCourse.credits}
                    onChange={e => setNewCourse({...newCourse, credits: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                    <input
                    required
                    type="number"
                    min={1}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                    value={newCourse.capacity}
                    onChange={e => setNewCourse({...newCourse, capacity: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  {/* Scheduling */}
                  <div className="col-span-2 border-t pt-4 mt-2">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Schedule</h4>
                      <div className="flex gap-3 mb-4">
                          {DAYS_OPTIONS.map(day => (
                              <label key={day} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={newCourse.days.includes(day)}
                                    onChange={() => toggleDay(day)}
                                    className="rounded text-emerald-600 focus:ring-emerald-500"
                                  />
                                  <span className="text-sm text-gray-700">{day}</span>
                              </label>
                          ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                            <input 
                                type="time" 
                                required
                                value={newCourse.start_time}
                                onChange={e => setNewCourse({...newCourse, start_time: e.target.value})}
                                className="w-full p-2 border rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                            <input 
                                type="time" 
                                required
                                value={newCourse.end_time}
                                onChange={e => setNewCourse({...newCourse, end_time: e.target.value})}
                                className="w-full p-2 border rounded text-sm"
                            />
                        </div>
                      </div>
                  </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};