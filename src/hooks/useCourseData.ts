import { useState, useEffect } from "react";
import type { Course, CourseSchedule, CourseResource } from "../types";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "weekly_flow_courses_v2";

export const useCourseData = () => {
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: convert old 'url' field to 'resources' if necessary
        return parsed.map((c: any) => {
          if (c.url !== undefined && !c.resources) {
            const resources = c.url ? [{ id: uuidv4(), name: 'Enlace Principal', url: c.url }] : [];
            const { url, ...rest } = c;
            return { ...rest, resources };
          }
          if (!c.resources) return { ...c, resources: [] };
          return c;
        });
      } catch (e) {
        console.error("Failed to parse saved courses", e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

  const addCourse = (course: Omit<Course, "id" | "schedules" | "resources">) => {
    const newCourse: Course = {
      ...course,
      id: uuidv4(),
      schedules: [],
      resources: [],
    };
    setCourses((prev) => [...prev, newCourse]);
    return newCourse;
  };

  const updateCourse = (id: string, updatedFields: Partial<Omit<Course, "id">>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const addSchedule = (courseId: string, schedule: Omit<CourseSchedule, "id">) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            schedules: [...c.schedules, { ...schedule, id: uuidv4() }],
          };
        }
        return c;
      })
    );
  };

  const removeSchedule = (courseId: string, scheduleId: string) => {
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
  };

  const addResource = (courseId: string, resource: Omit<CourseResource, "id">) => {
    // Add protocol if missing
    let formattedUrl = resource.url.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            resources: [...c.resources, { ...resource, url: formattedUrl, id: uuidv4() }],
          };
        }
        return c;
      })
    );
  };

  const removeResource = (courseId: string, resourceId: string) => {
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
  };

  return {
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    addSchedule,
    removeSchedule,
    addResource,
    removeResource,
  };
};
