import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Course, CourseSchedule, CourseResource, CourseTask } from '../types';
import { DEFAULT_CATEGORIES } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../services/api';
import { CourseContext } from './courseContextDef';
import type { CourseContextValue, NotificationState } from './courseContextDef';

export const CourseProvider: React.FC<{ children: React.ReactNode; initialCourses?: Course[] }> = ({
  children,
  initialCourses,
}) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses || []);
  const [loading, setLoading] = useState<boolean>(initialCourses === undefined);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ type, message });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 5000);
  }, []);

  const clearNotification = useCallback(() => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification(null);
  }, []);

  const refreshCourses = useCallback(async () => {
    try {
      const data = await api.getCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      showNotification('error', 'Error al cargar los cursos del servidor');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    if (initialCourses !== undefined) return;

    let isMounted = true;
    api
      .getCourses()
      .then((data) => {
        if (isMounted) {
          setCourses(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to fetch courses:', err);
          showNotification('error', 'Error al cargar los cursos del servidor');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialCourses, showNotification]);

  const addCourse = async (courseData: Omit<Course, 'id' | 'schedules' | 'resources' | 'tasks'>): Promise<Course> => {
    const previousCourses = courses;
    const newCourse: Course = {
      ...courseData,
      id: uuidv4(),
      category: courseData.category || DEFAULT_CATEGORIES[0],
      schedules: [],
      resources: [],
      tasks: [],
    };

    // Optimistic update
    setCourses((prev) => [...prev, newCourse]);

    try {
      await api.createCourse(newCourse);
      showNotification('success', `Curso "${newCourse.title}" creado con éxito`);
      return newCourse;
    } catch (err) {
      console.error('Failed to add course:', err);
      setCourses(previousCourses);
      showNotification('error', 'No se pudo crear el curso. Los cambios fueron revertidos.');
      throw err;
    }
  };

  const updateCourse = async (id: string, updatedFields: Partial<Omit<Course, 'id'>>) => {
    const previousCourses = courses;

    // Optimistic update
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );

    try {
      await api.updateCourse(id, updatedFields);
    } catch (err) {
      console.error('Failed to update course:', err);
      setCourses(previousCourses);
      showNotification('error', 'Error al actualizar el curso. Cambios revertidos.');
      throw err;
    }
  };

  const deleteCourse = async (id: string) => {
    const previousCourses = courses;
    const courseToDelete = courses.find((c) => c.id === id);

    // Optimistic update
    setCourses((prev) => prev.filter((c) => c.id !== id));

    try {
      await api.deleteCourse(id);
      showNotification('success', `Curso "${courseToDelete?.title || ''}" eliminado`);
    } catch (err) {
      console.error('Failed to delete course:', err);
      setCourses(previousCourses);
      showNotification('error', 'Error al eliminar el curso en el servidor.');
      throw err;
    }
  };

  const addSchedule = async (courseId: string, scheduleData: Omit<CourseSchedule, 'id'>) => {
    const previousCourses = courses;
    const newSchedule: CourseSchedule = {
      ...scheduleData,
      id: uuidv4(),
    };

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
      await api.addSchedule(courseId, newSchedule);
    } catch (err) {
      console.error('Failed to add schedule:', err);
      setCourses(previousCourses);
      showNotification('error', 'Error al guardar el nuevo horario.');
      throw err;
    }
  };

  const removeSchedule = async (courseId: string, scheduleId: string) => {
    const previousCourses = courses;

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
      await api.deleteSchedule(scheduleId);
    } catch (err) {
      console.error('Failed to remove schedule:', err);
      setCourses(previousCourses);
      showNotification('error', 'Error al eliminar el horario.');
      throw err;
    }
  };

  const moveSchedule = async (scheduleId: string, newDay: string) => {
    const previousCourses = courses;

    // Optimistic update
    setCourses((prev) => {
      const courseWithSchedule = prev.find((c) => c.schedules.some((s) => s.id === scheduleId));
      if (!courseWithSchedule) return prev;

      return prev.map((c) => {
        if (c.id === courseWithSchedule.id) {
          return {
            ...c,
            schedules: c.schedules.map((s) =>
              s.id === scheduleId ? { ...s, dayOfWeek: newDay } : s
            ),
          };
        }
        return c;
      });
    });

    try {
      await api.moveSchedule(scheduleId, newDay);
    } catch (err) {
      console.error('Failed to move schedule:', err);
      setCourses(previousCourses);
      showNotification('error', 'Error al mover el horario.');
      throw err;
    }
  };

  const addResource = async (courseId: string, resourceData: Omit<CourseResource, 'id'>) => {
    const previousCourses = courses;

    let formattedUrl = resourceData.url.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const newResource: CourseResource = {
      ...resourceData,
      url: formattedUrl,
      id: uuidv4(),
    };

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
      await api.addResource(courseId, newResource);
    } catch (err) {
      console.error('Failed to add resource:', err);
      setCourses(previousCourses);
      showNotification('error', 'Error al guardar el recurso.');
      throw err;
    }
  };

  const removeResource = async (courseId: string, resourceId: string) => {
    const previousCourses = courses;

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
      await api.deleteResource(resourceId);
    } catch (err) {
      console.error('Failed to remove resource:', err);
      setCourses(previousCourses);
      showNotification('error', 'Error al eliminar el recurso.');
      throw err;
    }
  };

  const addTask = async (courseId: string, title: string) => {
    const previousCourses = courses;
    const newTask: CourseTask = { id: uuidv4(), title: title.trim(), completed: false };

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
      await api.addTask(courseId, newTask);
    } catch (err) {
      console.error('Failed to add task:', err);
      setCourses(previousCourses);
      showNotification('error', 'Error al añadir la tarea.');
      throw err;
    }
  };

  const toggleTask = async (courseId: string, taskId: string) => {
    const previousCourses = courses;
    let newStatus = false;

    // Optimistic update
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
      await api.toggleTask(taskId, newStatus);
    } catch (err) {
      console.error('Failed to toggle task:', err);
      setCourses(previousCourses);
      showNotification('error', 'Error al cambiar estado de la tarea.');
      throw err;
    }
  };

  const removeTask = async (courseId: string, taskId: string) => {
    const previousCourses = courses;

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
      await api.deleteTask(taskId);
    } catch (err) {
      console.error('Failed to remove task:', err);
      setCourses(previousCourses);
      showNotification('error', 'Error al eliminar la tarea.');
      throw err;
    }
  };

  const importCourses = async (
    importedCourses: Course[]
  ): Promise<{ success: boolean; count?: number; error?: string }> => {
    const previousCourses = courses;

    // Optimistic merge
    setCourses((prev) => {
      const courseMap = new Map(prev.map((c) => [c.id, c]));
      importedCourses.forEach((c) => courseMap.set(c.id, c));
      return Array.from(courseMap.values());
    });

    try {
      const result = await api.importCourses(importedCourses);
      showNotification('success', `¡${result.count} curso(s) importado(s) exitosamente!`);
      return { success: true, count: result.count };
    } catch (err) {
      console.error('Failed to import courses:', err);
      setCourses(previousCourses);
      const errorMessage = err instanceof Error ? err.message : 'Error al importar cursos';
      showNotification('error', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const exportCourses = (coursesToExport?: Course[]) => {
    const dataToExport = coursesToExport ?? courses;
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];

    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `weekly-flow-export-${dateStr}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  };

  const value: CourseContextValue = {
    courses,
    loading,
    notification,
    showNotification,
    clearNotification,
    refreshCourses,
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
    importCourses,
    exportCourses,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};
