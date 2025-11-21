import { Student, Course, StudentCreate, CourseCreate, StudentQueryParams, CourseQueryParams } from '../types';

const API_URL = 'http://127.0.0.1:8000';
const API_KEY = 'secret123';

// --- Mock Data for Demo Mode ---
let mockCourses: Course[] = [
  { 
    id: 101, 
    title: "Intro to CS", 
    description: "Basic programming concepts", 
    credits: 3,
    days: ["Mon", "Wed"],
    start_time: "09:00",
    end_time: "10:30",
    capacity: 30,
    enrolled_count: 28
  },
  { 
    id: 102, 
    title: "Data Structures", 
    description: "Advanced lists and trees", 
    credits: 4,
    days: ["Tue", "Thu"],
    start_time: "14:00",
    end_time: "16:00",
    capacity: 25,
    enrolled_count: 10
  },
  { 
    id: 103, 
    title: "Web Development", 
    description: "Building modern web apps", 
    credits: 3,
    days: ["Fri"],
    start_time: "10:00",
    end_time: "13:00",
    capacity: 20,
    enrolled_count: 20 // Full
  },
];

let mockStudents: Student[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", age: 20, courses: [] },
  { id: 2, name: "Bob Smith", email: "bob@example.com", age: 22, courses: [] },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", age: 21, courses: [] },
];

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiClient = {
  useMock: true, // Toggle this to switch between Real API and Mock

  async getStudents(params: StudentQueryParams): Promise<Student[]> {
    if (this.useMock) {
      await delay(300);
      let data = [...mockStudents];
      if (params.name) {
        data = data.filter(s => s.name.toLowerCase().includes(params.name!.toLowerCase()));
      }
      if (params.order_by) {
        data.sort((a, b) => (a[params.order_by!] > b[params.order_by!] ? 1 : -1));
      }
      const skip = params.skip || 0;
      const limit = params.limit || 10;
      return data.slice(skip, skip + limit);
    }

    const url = new URL(`${API_URL}/students/`);
    if (params.skip) url.searchParams.append('skip', params.skip.toString());
    if (params.limit) url.searchParams.append('limit', params.limit.toString());
    if (params.name) url.searchParams.append('name', params.name);
    if (params.order_by) url.searchParams.append('order_by', params.order_by);

    const res = await fetch(url.toString(), {
      headers: { 'X-API-KEY': API_KEY }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getCourses(params: CourseQueryParams): Promise<Course[]> {
    if (this.useMock) {
      await delay(300);
      let data = [...mockCourses];
      if (params.title) {
        data = data.filter(c => c.title.toLowerCase().includes(params.title!.toLowerCase()));
      }
      return data;
    }

    const url = new URL(`${API_URL}/courses/`);
    if (params.skip) url.searchParams.append('skip', params.skip.toString());
    if (params.limit) url.searchParams.append('limit', params.limit.toString());
    if (params.title) url.searchParams.append('title', params.title);
    if (params.order_by) url.searchParams.append('order_by', params.order_by);

    const res = await fetch(url.toString(), {
      headers: { 'X-API-KEY': API_KEY }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async createStudent(student: StudentCreate): Promise<Student> {
    if (this.useMock) {
      await delay(300);
      if (mockStudents.some(s => s.email === student.email)) {
         throw new Error("409: Email already exists");
      }
      const newStudent = { ...student, id: Math.floor(Math.random() * 10000), courses: [] };
      mockStudents.push(newStudent);
      return newStudent;
    }

    const res = await fetch(`${API_URL}/students/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY },
      body: JSON.stringify(student)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create student");
    }
    return res.json();
  },

  async createCourse(course: CourseCreate): Promise<Course> {
    if (this.useMock) {
      await delay(300);
      const newCourse: Course = { 
        ...course, 
        id: Math.floor(Math.random() * 10000),
        enrolled_count: 0 
      };
      mockCourses.push(newCourse);
      return newCourse;
    }

    const res = await fetch(`${API_URL}/courses/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY },
      body: JSON.stringify(course)
    });
    if (!res.ok) throw new Error("Failed to create course");
    return res.json();
  },

  async deleteStudent(id: number): Promise<void> {
    if (this.useMock) {
      await delay(300);
      mockStudents = mockStudents.filter(s => s.id !== id);
      return;
    }
    const res = await fetch(`${API_URL}/students/${id}`, {
      method: 'DELETE',
      headers: { 'X-API-KEY': API_KEY }
    });
    if (!res.ok) throw new Error("Failed to delete student");
  },

  async deleteCourse(id: number): Promise<void> {
    if (this.useMock) {
      await delay(300);
      mockCourses = mockCourses.filter(c => c.id !== id);
      return;
    }
    const res = await fetch(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: { 'X-API-KEY': API_KEY }
    });
    if (!res.ok) throw new Error("Failed to delete course");
  },

  async enrollStudent(studentId: number, courseId: number): Promise<any> {
    if (this.useMock) {
        await delay(300);
        const student = mockStudents.find(s => s.id === studentId);
        const course = mockCourses.find(c => c.id === courseId);
        
        if(student && course) {
            if(!student.courses) student.courses = [];
            
            // Check duplication
            if(student.courses.some(c => c.id === courseId)) {
                throw new Error("Student already enrolled");
            }

            // Check capacity
            if (course.enrolled_count >= course.capacity) {
                throw new Error("Course is full");
            }

            student.courses.push(course);
            course.enrolled_count += 1; // Update mock state
        }
        return { message: "Enrolled" };
    }
    const res = await fetch(`${API_URL}/students/${studentId}/enroll/${courseId}`, {
      method: 'POST',
      headers: { 'X-API-KEY': API_KEY }
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to enroll");
    }
    return res.json();
  },

  async unenrollStudent(studentId: number, courseId: number): Promise<any> {
    if (this.useMock) {
        await delay(300);
        const student = mockStudents.find(s => s.id === studentId);
        const course = mockCourses.find(c => c.id === courseId);
        
        if(student && student.courses) {
            const initialLength = student.courses.length;
            student.courses = student.courses.filter(c => c.id !== courseId);
            
            if (course && student.courses.length < initialLength) {
                course.enrolled_count = Math.max(0, course.enrolled_count - 1);
            }
        }
        return { message: "Unenrolled" };
    }
    const res = await fetch(`${API_URL}/students/${studentId}/unenroll/${courseId}`, {
        method: 'POST',
        headers: { 'X-API-KEY': API_KEY }
    });
    if (!res.ok) throw new Error("Failed to unenroll");
    return res.json();
  }
};