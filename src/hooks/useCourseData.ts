import { useState, useEffect } from "react";
import type { Course, CourseSchedule, CourseResource } from "../types";
import { v4 as uuidv4 } from "uuid";

import { DEFAULT_CATEGORIES } from "../types";

const API_URL = import.meta.env.PROD ? "/api" : "http://localhost:3001/api";

export const useCourseData = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/courses`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const mappedData = data.map((c: any) => ({
              ...c,
              category: c.category || DEFAULT_CATEGORIES[0],
              notificationsEnabled: c.notifications_enabled,
              phoneNumber: c.phone_number,
              schedules: Array.isArray(c.schedules) ? c.schedules.map((s: any) => ({
                  ...s,
                  dayOfWeek: s.day_of_week || s.dayOfWeek,
                  startTime: s.start_time || s.startTime,
                  endTime: s.end_time || s.endTime
              })) : [],
              resources: Array.isArray(c.resources) ? c.resources : [],
              tasks: Array.isArray(c.tasks) ? c.tasks : []
            }));
            setCourses(mappedData);
          }
        }
      } catch (e) {
        console.error("Failed to fetch courses from database", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addCourse = async (course: Omit<Course, "id" | "schedules" | "resources" | "tasks">) => {
    const id = uuidv4();
    const newCourse: Course = {
      ...course,
      id,
      category: course.category || DEFAULT_CATEGORIES[0],
      schedules: [],
      resources: [],
      tasks: [],
    };

    // Optimistic update
    setCourses((prev) => [...prev, newCourse]);

    try {
      await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });
    } catch (e) {
      console.error("Failed to add course", e);
    }
    return newCourse;
  };

  const updateCourse = async (id: string, updatedFields: Partial<Omit<Course, "id">>) => {
    // Optimistic update
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );

    try {
      await fetch(`${API_URL}/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
    } catch (e) {
      console.error("Failed to update course", e);
    }
  };

  const deleteCourse = async (id: string) => {
    // Optimistic update
    setCourses((prev) => prev.filter((c) => c.id !== id));

    try {
      await fetch(`${API_URL}/courses/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error("Failed to delete course", e);
    }
  };

  const addSchedule = async (courseId: string, schedule: Omit<CourseSchedule, "id">) => {
    const id = uuidv4();
    const newSchedule = { ...schedule, id };

    // Optimistic update
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            schedules: [...c.schedules, newSchedule],
          };
        }
        return c;
      })
    );

    try {
      await fetch(`${API_URL}/courses/${courseId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime
        }),
      });
    } catch (e) {
      console.error("Failed to add schedule", e);
    }
  };

  const removeSchedule = async (courseId: string, scheduleId: string) => {
    // Optimistic update
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            schedules: c.schedules.filter((s) => s.id !== scheduleId),
          };
        }
        return c;
      })
    );

    try {
      await fetch(`${API_URL}/schedules/${scheduleId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error("Failed to remove schedule", e);
    }
  };

  const moveSchedule = async (scheduleId: string, newDay: string) => {
    // Optimistic update
    setCourses((prev) => {
      const courseWithSchedule = prev.find(c => c.schedules.some(s => s.id === scheduleId));
      if (!courseWithSchedule) return prev;

      return prev.map(c => {
        if (c.id === courseWithSchedule.id) {
          return {
            ...c,
            schedules: c.schedules.map(s => 
              s.id === scheduleId ? { ...s, dayOfWeek: newDay } : s
            )
          };
        }
        return c;
      });
    });

    try {
      await fetch(`${API_URL}/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek: newDay }),
      });
    } catch (e) {
      console.error("Failed to move schedule", e);
    }
  };

  const addResource = async (courseId: string, resource: Omit<CourseResource, "id">) => {
    let formattedUrl = resource.url.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const id = uuidv4();
    const newResource = { ...resource, url: formattedUrl, id };

    // Optimistic update
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            resources: [...c.resources, newResource],
          };
        }
        return c;
      })
    );

    try {
      await fetch(`${API_URL}/courses/${courseId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResource),
      });
    } catch (e) {
      console.error("Failed to add resource", e);
    }
  };

  const removeResource = async (courseId: string, resourceId: string) => {
    // Optimistic update
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            resources: c.resources.filter((r) => r.id !== resourceId),
          };
        }
        return c;
      })
    );

    try {
      await fetch(`${API_URL}/resources/${resourceId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error("Failed to remove resource", e);
    }
  };

  const addTask = async (courseId: string, title: string) => {
    const id = uuidv4();
    const newTask = { id, title, completed: false };

    // Optimistic update
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            tasks: [...c.tasks, newTask],
          };
        }
        return c;
      })
    );

    try {
      await fetch(`${API_URL}/courses/${courseId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
    } catch (e) {
      console.error("Failed to add task", e);
    }
  };

  const toggleTask = async (courseId: string, taskId: string) => {
    let newStatus = false;
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedTasks = c.tasks.map((t) => {
            if (t.id === taskId) {
              newStatus = !t.completed;
              return { ...t, completed: newStatus };
            }
            return t;
          });
          return { ...c, tasks: updatedTasks };
        }
        return c;
      })
    );

    try {
      await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newStatus }),
      });
    } catch (e) {
      console.error("Failed to toggle task", e);
    }
  };

  const removeTask = async (courseId: string, taskId: string) => {
    // Optimistic update
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            tasks: c.tasks.filter((t) => t.id !== taskId),
          };
        }
        return c;
      })
    );

    try {
      await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error("Failed to remove task", e);
    }
  };

  return {
    courses,
    loading,
    addCourse,
    updateCourse,
    deleteCourse,
    addSchedule,
    removeSchedule,
    moveSchedule,
    addResource,
    removeResource,
    addTask,
    toggleTask,
    removeTask,
  };
};
