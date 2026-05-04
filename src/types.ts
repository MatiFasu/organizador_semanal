export type CourseSchedule = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime?: string;
};

export type CourseResource = {
  id: string;
  name: string;
  url: string;
};

export type CourseTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Course = {
  id: string;
  title: string;
  category: string;
  description?: string;
  color?: string;
  schedules: CourseSchedule[];
  resources: CourseResource[];
  tasks: CourseTask[];
};

export const DEFAULT_CATEGORIES = ["Facultad", "Extras", "Otros"];

export const DAYS_OF_WEEK = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export const COURSE_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#6366f1", // Indigo
  "#14b8a6", // Teal
];
