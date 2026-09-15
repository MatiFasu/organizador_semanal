import { createContext, useContext } from 'react';
import type { Course, CourseSchedule, CourseResource } from '../types';

export interface NotificationState {
  type: 'success' | 'error';
  message: string;
}

export interface CourseContextValue {
  courses: Course[];
  loading: boolean;
  notification: NotificationState | null;
  showNotification: (type: 'success' | 'error', message: string) => void;
  clearNotification: () => void;
  refreshCourses: () => Promise<void>;
  addCourse: (course: Omit<Course, 'id' | 'schedules' | 'resources' | 'tasks'>) => Promise<Course>;
  updateCourse: (id: string, fields: Partial<Omit<Course, 'id'>>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  addSchedule: (courseId: string, schedule: Omit<CourseSchedule, 'id'>) => Promise<void>;
  removeSchedule: (courseId: string, scheduleId: string) => Promise<void>;
  moveSchedule: (scheduleId: string, newDay: string) => Promise<void>;
  addResource: (courseId: string, resource: Omit<CourseResource, 'id'>) => Promise<void>;
  removeResource: (courseId: string, resourceId: string) => Promise<void>;
  addTask: (courseId: string, title: string) => Promise<void>;
  toggleTask: (courseId: string, taskId: string) => Promise<void>;
  removeTask: (courseId: string, taskId: string) => Promise<void>;
  importCourses: (importedCourses: Course[]) => Promise<{ success: boolean; count?: number; error?: string }>;
  exportCourses: (coursesToExport?: Course[]) => void;
}

export const CourseContext = createContext<CourseContextValue | undefined>(undefined);

export const useCourseContext = (): CourseContextValue => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourseContext must be used within a CourseProvider');
  }
  return context;
};
