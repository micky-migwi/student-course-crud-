import React, { useState, useEffect } from 'react';
import { apiClient } from './services/api';
import { StudentManager } from './components/StudentManager';
import { CourseManager } from './components/CourseManager';
import { GraduationCap, BookOpen, LayoutDashboard, Radio, Users, Shield } from 'lucide-react';
import { Course, UserRole } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'students' | 'courses'>('students');
  const [isMock, setIsMock] = useState(apiClient.useMock);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  
  // Triggers for refreshing data across components
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const toggleMock = () => {
    apiClient.useMock = !apiClient.useMock;
    setIsMock(apiClient.useMock);
    setRefreshTrigger(prev => prev + 1);
  };

  // Fetch courses globally so they can be passed to StudentManager for enrollment
  const loadCourses = async () => {
    try {
        const data = await apiClient.getCourses({ order_by: 'title' });
        setAllCourses(data);
    } catch (e) {
        console.error("Failed to load global course list");
    }
  };

  useEffect(() => {
    loadCourses();
  }, [refreshTrigger]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <GraduationCap size={24} className="text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">UniManager</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'students' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Students</span>
          </button>
          
          <button
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'courses' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen size={20} />
            <span>Courses</span>
          </button>
        </nav>

        {/* Role Switcher (Simulation) */}
        <div className="p-4 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">
            Active Role
          </label>
          <div className="space-y-1 bg-slate-800 rounded-lg p-1">
            {(['admin', 'teacher', 'student'] as UserRole[]).map((role) => (
               <button
                 key={role}
                 onClick={() => setUserRole(role)}
                 className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                    userRole === role 
                    ? 'bg-slate-700 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                 }`}
               >
                 {role === 'admin' && <Shield size={14} className="text-rose-400"/>}
                 {role === 'teacher' && <BookOpen size={14} className="text-emerald-400"/>}
                 {role === 'student' && <Users size={14} className="text-blue-400"/>}
                 <span className="capitalize">{role}</span>
               </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Radio size={16} className={isMock ? 'text-orange-400' : 'text-green-400'} />
              <span className="text-xs font-medium text-slate-300">
                {isMock ? 'Mock Mode' : 'Live API'}
              </span>
            </div>
            <button 
              onClick={toggleMock}
              className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-slate-200 transition-colors"
            >
              Switch
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <header className="bg-white shadow-sm p-6 md:p-8 flex flex-col gap-2">
          <div className="flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'students' ? 'Student Management' : 'Course Catalog'}
                </h2>
                <p className="text-gray-500">
                    {activeTab === 'students' 
                    ? 'Manage student enrollments, add new students, and view details.' 
                    : 'Create and manage courses offered by the university.'}
                </p>
             </div>
             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <span className={`w-2 h-2 rounded-full ${
                    userRole === 'admin' ? 'bg-rose-500' : 
                    userRole === 'teacher' ? 'bg-emerald-500' : 'bg-blue-500'
                }`} />
                Viewing as {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
             </span>
          </div>
        </header>

        <div className="p-6 md:p-8">
          {activeTab === 'students' ? (
            <StudentManager 
                role={userRole}
                courses={allCourses} 
                refreshTrigger={refreshTrigger} 
                onEnrollmentChange={() => setRefreshTrigger(prev => prev + 1)} 
            />
          ) : (
            <CourseManager 
                role={userRole}
                onCourseChange={() => setRefreshTrigger(prev => prev + 1)} 
            />
          )}
        </div>
      </main>
    </div>
  );
}