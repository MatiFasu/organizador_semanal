import type { Course, CourseSchedule, CourseResource, CourseTask } from '../types';
import { DEFAULT_CATEGORIES } from '../types';

export const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

export interface DbSchedule {
  id: string;
  day_of_week?: string;
  dayOfWeek?: string;
  start_time?: string;
  startTime?: string;
  end_time?: string;
  endTime?: string;
}

export interface DbCourse {
  id: string;
  title: string;
  category?: string;
  description?: string;
  color?: string;
  notifications_enabled?: boolean;
  phone_number?: string;
  schedules?: DbSchedule[];
  resources?: CourseResource[];
  tasks?: CourseTask[];
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMessage = errorData.error;
      else if (errorData.message) errorMessage = errorData.message;
      else if (errorData.details) errorMessage = errorData.details;
    } catch {
      // Not JSON, use generic message
    }
    throw new ApiError(errorMessage, response.status);
  }

  // If response has no content (204 or empty), return empty object
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

export const api = {
  async login(password: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return response.ok;
  },

  async getCourses(): Promise<Course[]> {
    const rawData = await request<DbCourse[]>('/courses');
    if (!Array.isArray(rawData)) return [];

    return rawData.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      color: c.color,
      category: c.category || DEFAULT_CATEGORIES[0],
      notificationsEnabled: c.notifications_enabled,
      phoneNumber: c.phone_number,
      schedules: Array.isArray(c.schedules)
        ? c.schedules.map((s) => ({
            id: s.id,
            dayOfWeek: s.day_of_week || s.dayOfWeek || '',
            startTime: s.start_time || s.startTime || '',
            endTime: s.end_time || s.endTime,
          }))
        : [],
      resources: Array.isArray(c.resources) ? c.resources : [],
      tasks: Array.isArray(c.tasks) ? c.tasks : [],
    }));
  },

  async createCourse(course: Course): Promise<Course> {
    return request<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(course),
    });
  },

  async updateCourse(id: string, fields: Partial<Omit<Course, 'id'>>): Promise<void> {
    await request<unknown>(`/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    });
  },

  async deleteCourse(id: string): Promise<void> {
    await request<unknown>(`/courses/${id}`, {
      method: 'DELETE',
    });
  },

  async addSchedule(courseId: string, schedule: CourseSchedule): Promise<void> {
    await request<unknown>(`/courses/${courseId}/schedules`, {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
  },

  async deleteSchedule(scheduleId: string): Promise<void> {
    await request<unknown>(`/schedules/${scheduleId}`, {
      method: 'DELETE',
    });
  },

  async moveSchedule(scheduleId: string, dayOfWeek: string): Promise<void> {
    await request<unknown>(`/schedules/${scheduleId}`, {
      method: 'PATCH',
      body: JSON.stringify({ dayOfWeek }),
    });
  },

  async addResource(courseId: string, resource: CourseResource): Promise<void> {
    await request<unknown>(`/courses/${courseId}/resources`, {
      method: 'POST',
      body: JSON.stringify(resource),
    });
  },

  async deleteResource(resourceId: string): Promise<void> {
    await request<unknown>(`/resources/${resourceId}`, {
      method: 'DELETE',
    });
  },

  async addTask(courseId: string, task: CourseTask): Promise<void> {
    await request<unknown>(`/courses/${courseId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  async toggleTask(taskId: string, completed: boolean): Promise<void> {
    await request<unknown>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  },

  async deleteTask(taskId: string): Promise<void> {
    await request<unknown>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  async importCourses(courses: Course[]): Promise<{ count: number }> {
    const data = await request<{ count?: number }>('/courses/import', {
      method: 'POST',
      body: JSON.stringify({ courses }),
    });
    return { count: data.count || courses.length };
  },
};
