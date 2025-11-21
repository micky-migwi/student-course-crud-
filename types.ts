export type UserRole = 'admin' | 'teacher' | 'student';

export interface Course {
  id: number;
  title: string;
  description: string;
  credits: number;
  days: string[];      // e.g. ["Mon", "Wed"]
  start_time: string;  // e.g. "14:00"
  end_time: string;    // e.g. "15:30"
  capacity: number;
  enrolled_count: number;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  age: number;
  courses?: Course[]; // Nested object as per "Advanced Features #2"
}

export interface StudentCreate {
  name: string;
  email: string;
  age: number;
}

export interface CourseCreate {
  title: string;
  description: string;
  credits: number;
  days: string[];
  start_time: string;
  end_time: string;
  capacity: number;
}

export interface ApiError {
  detail: string;
}

// API Query Parameters
export interface StudentQueryParams {
  skip?: number;
  limit?: number;
  name?: string;
  order_by?: 'name' | 'age';
}

export interface CourseQueryParams {
  skip?: number;
  limit?: number;
  title?: string;
  order_by?: 'title';
}