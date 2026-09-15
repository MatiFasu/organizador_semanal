import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useCourseData } from '../hooks/useCourseData';
import { DAYS_OF_WEEK } from '../types';
import type { Course, CourseResource, CourseTask } from '../types';
import { Clock, ExternalLink, Play, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type UpcomingActivity = Course & {
  startTime: string;
};

export const NextActivity: React.FC = () => {
  const { courses } = useCourseData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const sentNotificationsRef = useRef<Set<string>>(new Set());

  const sendWhatsApp = useCallback((course: Course, time: string) => {
    if (!course.phoneNumber) return;
    const cleanPhone = course.phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent(
      `¡Hola! Recordatorio de Weekly Flow: Tu curso "${course.title}" comienza en 5 minutos (${time} hs).\n\nEnlaces rápidos:\n${(course.resources || []).map((r: CourseResource) => `- ${r.name}: ${r.url}`).join('\n')}`
    );
    const wpUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    
    window.open(wpUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const checkAndNotify = useCallback((now: Date) => {
    const todayIndex = now.getDay();
    const todayName = DAYS_OF_WEEK[(todayIndex + 6) % 7];
    const currentH = now.getHours();
    const currentM = now.getMinutes();

    courses.forEach((course: Course) => {
      if (course.notificationsEnabled && course.phoneNumber) {
        (course.schedules || []).forEach((schedule) => {
          if (schedule.dayOfWeek === todayName) {
            const [schedH, schedM] = schedule.startTime.split(':').map(Number);
            if (isNaN(schedH) || isNaN(schedM)) return;

            const schedTotalMinutes = schedH * 60 + schedM;
            const currentTotalMinutes = currentH * 60 + currentM;

            // Check if it's 5 minutes before schedule
            if (schedTotalMinutes - currentTotalMinutes === 5) {
              const notificationKey = `${course.id}-${schedule.id}-${now.toDateString()}`;
              if (!sentNotificationsRef.current.has(notificationKey)) {
                sentNotificationsRef.current.add(notificationKey);
                sendWhatsApp(course, schedule.startTime);
              }
            }
          }
        });
      }
    });
  }, [courses, sendWhatsApp]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      checkAndNotify(now);
    }, 15000);
    return () => clearInterval(timer);
  }, [checkAndNotify]);

  const next = useMemo<UpcomingActivity | null>(() => {
    const todayIndex = currentTime.getDay();
    const todayName = DAYS_OF_WEEK[(todayIndex + 6) % 7];
    const currentHM = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

    const upcoming: UpcomingActivity[] = [];

    courses.forEach((course) => {
      (course.schedules || []).forEach((schedule) => {
        if (schedule.dayOfWeek === todayName && schedule.startTime >= currentHM) {
          upcoming.push({
            ...course,
            startTime: schedule.startTime,
          });
        }
      });
    });

    upcoming.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return upcoming[0] || null;
  }, [courses, currentTime]);

  if (!next) return null;

  const pendingTasks = (next.tasks || []).filter((t: CourseTask) => !t.completed).length;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="next-activity-container"
      >
        <div className="next-activity-card">
          <div className="next-badge-row">
            <span className="next-badge">PRÓXIMA ACTIVIDAD</span>
          </div>

          <div className="next-content">
            <div className="next-main-info">
              <div className="next-icon-wrapper" style={{ backgroundColor: next.color || '#3b82f6' }}>
                <Play fill="white" color="white" size={22} />
              </div>
              <div>
                <h2>{next.title}</h2>
                <div className="next-meta">
                  <div className="next-time">
                    <Clock size={16} />
                    <span>Hoy a las {next.startTime} hs</span>
                  </div>
                  {pendingTasks > 0 && (
                    <div className="next-tasks-badge">
                      <CheckCircle2 size={14} />
                      <span>{pendingTasks} pendientes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="next-actions">
              {(next.resources || []).map((res: CourseResource) => (
                <button 
                  key={res.id} 
                  type="button"
                  className="next-resource-btn"
                  onClick={() => window.open(res.url, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink size={16} />
                  <span>{res.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          .next-activity-container {
            margin-bottom: 2rem;
          }

          .next-activity-card {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 1.5rem;
            border-radius: 20px;
            box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .next-badge-row {
            display: flex;
            align-items: center;
          }

          .next-badge {
            background: var(--primary, #3b82f6);
            color: white;
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 0.05em;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            display: inline-flex;
            align-items: center;
          }

          .next-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 2rem;
          }

          @media (max-width: 768px) {
            .next-content {
              flex-direction: column;
              align-items: flex-start;
              gap: 1.5rem;
            }
          }

          .next-main-info {
            display: flex;
            align-items: center;
            gap: 1.25rem;
          }

          .next-icon-wrapper {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
            flex-shrink: 0;
          }

          .next-main-info h2 {
            font-size: 1.4rem;
            margin: 0;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #ffffff;
          }

          .next-meta {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-top: 6px;
            flex-wrap: wrap;
          }

          .next-time {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #94a3b8;
            font-size: 0.9rem;
            font-weight: 600;
          }

          .next-tasks-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #10b981;
            font-size: 0.85rem;
            font-weight: 700;
            background: rgba(16, 185, 129, 0.15);
            padding: 2px 10px;
            border-radius: 10px;
          }

          .next-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .next-resource-btn {
            background: rgba(255, 255, 255, 0.08);
            color: white;
            padding: 10px 18px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
            font-weight: 700;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.2s;
            cursor: pointer;
          }

          .next-resource-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};
