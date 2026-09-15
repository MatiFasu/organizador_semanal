import type { Course, CourseSchedule, CourseResource, CourseTask } from '../types';
import { DEFAULT_CATEGORIES, DAYS_OF_WEEK } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface ValidationResult {
  valid: boolean;
  courses?: Course[];
  error?: string;
}

const isValidUuid = (str: unknown): boolean => {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export const validateCoursesJson = (jsonContent: string): ValidationResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonContent);
  } catch {
    return {
      valid: false,
      error: 'El archivo seleccionado no tiene un formato JSON válido.',
    };
  }

  // Support either a raw array of courses or an object containing { courses: [...] }
  let rawList: unknown[];
  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else if (
    parsed &&
    typeof parsed === 'object' &&
    'courses' in parsed &&
    Array.isArray((parsed as { courses: unknown }).courses)
  ) {
    rawList = (parsed as { courses: unknown[] }).courses;
  } else {
    return {
      valid: false,
      error: 'El JSON debe ser un array de cursos o un objeto con la propiedad "courses".',
    };
  }

  if (rawList.length === 0) {
    return {
      valid: false,
      error: 'El archivo JSON está vacío o no contiene ningún curso.',
    };
  }

  const validatedCourses: Course[] = [];

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    const indexLabel = `Curso #${i + 1}`;

    if (!item || typeof item !== 'object') {
      return {
        valid: false,
        error: `${indexLabel} no es un objeto válido.`,
      };
    }

    const c = item as Record<string, unknown>;

    // Validate mandatory field: title
    if (!c.title || typeof c.title !== 'string' || !c.title.trim()) {
      return {
        valid: false,
        error: `${indexLabel} no contiene un título o nombre ("title") obligatorio.`,
      };
    }

    const title = c.title.trim();
    const id = isValidUuid(c.id) ? (c.id as string) : uuidv4();
    const category =
      typeof c.category === 'string' && c.category.trim()
        ? c.category.trim()
        : DEFAULT_CATEGORIES[0];
    const description = typeof c.description === 'string' ? c.description : undefined;
    const color = typeof c.color === 'string' ? c.color : '#3b82f6';
    const notificationsEnabled =
      typeof c.notificationsEnabled === 'boolean'
        ? c.notificationsEnabled
        : typeof c.notifications_enabled === 'boolean'
        ? c.notifications_enabled
        : undefined;
    const phoneNumber =
      typeof c.phoneNumber === 'string'
        ? c.phoneNumber
        : typeof c.phone_number === 'string'
        ? c.phone_number
        : undefined;

    // Validate schedules
    const schedules: CourseSchedule[] = [];
    if (c.schedules !== undefined && c.schedules !== null) {
      if (!Array.isArray(c.schedules)) {
        return {
          valid: false,
          error: `Los horarios ("schedules") del curso "${title}" deben ser una lista (array).`,
        };
      }

      for (let sIdx = 0; sIdx < c.schedules.length; sIdx++) {
        const s = c.schedules[sIdx];
        if (!s || typeof s !== 'object') {
          return {
            valid: false,
            error: `El horario #${sIdx + 1} de "${title}" no es un objeto válido.`,
          };
        }
        const sRec = s as Record<string, unknown>;
        const dayOfWeek = (sRec.dayOfWeek || sRec.day_of_week) as string;
        const startTime = (sRec.startTime || sRec.start_time) as string;
        const endTime = (sRec.endTime || sRec.end_time) as string | undefined;

        if (!dayOfWeek || typeof dayOfWeek !== 'string' || !DAYS_OF_WEEK.includes(dayOfWeek)) {
          return {
            valid: false,
            error: `El horario #${sIdx + 1} de "${title}" tiene un día ("dayOfWeek") inválido. Debe ser uno de: ${DAYS_OF_WEEK.join(', ')}.`,
          };
        }

        if (!startTime || typeof startTime !== 'string') {
          return {
            valid: false,
            error: `El horario #${sIdx + 1} de "${title}" requiere una hora de inicio ("startTime") válida.`,
          };
        }

        schedules.push({
          id: isValidUuid(sRec.id) ? (sRec.id as string) : uuidv4(),
          dayOfWeek,
          startTime,
          endTime: typeof endTime === 'string' ? endTime : undefined,
        });
      }
    }

    // Validate resources
    const resources: CourseResource[] = [];
    if (c.resources !== undefined && c.resources !== null) {
      if (!Array.isArray(c.resources)) {
        return {
          valid: false,
          error: `Los recursos ("resources") del curso "${title}" deben ser una lista (array).`,
        };
      }

      for (let rIdx = 0; rIdx < c.resources.length; rIdx++) {
        const r = c.resources[rIdx];
        if (!r || typeof r !== 'object') {
          return {
            valid: false,
            error: `El recurso #${rIdx + 1} de "${title}" no es un objeto válido.`,
          };
        }
        const rRec = r as Record<string, unknown>;
        if (!rRec.name || typeof rRec.name !== 'string' || !rRec.url || typeof rRec.url !== 'string') {
          return {
            valid: false,
            error: `El recurso #${rIdx + 1} de "${title}" debe contener campos "name" y "url" válidos.`,
          };
        }

        resources.push({
          id: isValidUuid(rRec.id) ? (rRec.id as string) : uuidv4(),
          name: rRec.name.trim(),
          url: rRec.url.trim(),
        });
      }
    }

    // Validate tasks
    const tasks: CourseTask[] = [];
    if (c.tasks !== undefined && c.tasks !== null) {
      if (!Array.isArray(c.tasks)) {
        return {
          valid: false,
          error: `Las tareas ("tasks") del curso "${title}" deben ser una lista (array).`,
        };
      }

      for (let tIdx = 0; tIdx < c.tasks.length; tIdx++) {
        const t = c.tasks[tIdx];
        if (!t || typeof t !== 'object') {
          return {
            valid: false,
            error: `La tarea #${tIdx + 1} de "${title}" no es un objeto válido.`,
          };
        }
        const tRec = t as Record<string, unknown>;
        if (!tRec.title || typeof tRec.title !== 'string') {
          return {
            valid: false,
            error: `La tarea #${tIdx + 1} de "${title}" debe contener un "title" válido.`,
          };
        }

        tasks.push({
          id: isValidUuid(tRec.id) ? (tRec.id as string) : uuidv4(),
          title: tRec.title.trim(),
          completed: Boolean(tRec.completed),
        });
      }
    }

    validatedCourses.push({
      id,
      title,
      category,
      description,
      color,
      notificationsEnabled,
      phoneNumber,
      schedules,
      resources,
      tasks,
    });
  }

  return {
    valid: true,
    courses: validatedCourses,
  };
};
