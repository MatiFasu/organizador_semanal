import { useCourseContext } from '../context/courseContextDef';

/**
 * useCourseData hook.
 * Connects to the global CourseContext provider, giving every component
 * access to synchronized course state, optimistic mutations, rollback on failure,
 * and notifications.
 */
export const useCourseData = () => {
  return useCourseContext();
};
