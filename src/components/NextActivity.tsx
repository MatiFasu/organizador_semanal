import React, { useEffect, useState } from 'react';
import { useCourseData } from '../hooks/useCourseData';
import { DAYS_OF_WEEK } from '../types';
import { Clock, ExternalLink, Play, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NextActivity: React.FC = () => {
  const { courses } = useCourseData();
  const [next, setNext] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      checkAndNotify(now);
    }, 60000);
    return () => clearInterval(timer);
  }, [courses]);

  const checkAndNotify = (now: Date) => {
    const todayIndex = now.getDay();
    const todayName = DAYS_OF_WEEK[(todayIndex + 6) % 7];
    const currentH = now.getHours();
    const currentM = now.getMinutes();

    courses.forEach(course => {
      if (course.notificationsEnabled && course.phoneNumber) {
        course.schedules.forEach(schedule => {
          if (schedule.dayOfWeek === todayName) {
            const [schedH, schedM] = schedule.startTime.split(':').map(Number);
            
            // Check if it's exactly 5 minutes before
            const schedTotalMinutes = schedH * 60 + schedM;
            const currentTotalMinutes = currentH * 60 + currentM;

            if (schedTotalMinutes - currentTotalMinutes === 5) {
              sendWhatsApp(course, schedule.startTime);
            }
          }
        });
      }
    });
  };

  const sendWhatsApp = (course: any, time: string) => {
    const message = `¡Hola! Recordatorio de Weekly Flow: Tu curso "${course.title}" comienza en 5 minutos (${time} hs).%0A%0AEnlaces rápidos:%0A${course.resources.map((r: any) => `- ${r.name}: ${r.url}`).join('%0A')}`;
    const wpUrl = `https://wa.me/${course.phoneNumber}?text=${message}`;
    
    // We open it in a new tab. In a PWA or Mobile, this triggers the app.
    window.open(wpUrl, '_blank');
  };

  useEffect(() => {
    const todayIndex = currentTime.getDay();
    const todayName = DAYS_OF_WEEK[(todayIndex + 6) % 7];
    const currentHM = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

    let upcoming: any[] = [];

    courses.forEach(course => {
      course.schedules.forEach(schedule => {
        if (schedule.dayOfWeek === todayName && schedule.startTime > currentHM) {
          upcoming.push({
            ...course,
            startTime: schedule.startTime,
          });
        }
      });
    });

    upcoming.sort((a, b) => a.startTime.localeCompare(b.startTime));
    setNext(upcoming[0] || null);
  }, [courses, currentTime]);

  if (!next) return null;

  const pendingTasks = next.tasks.filter((t: any) => !t.completed).length;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="next-activity-container"
      >
        <div className="next-activity-card">
          <div className="next-badge">PRÓXIMA ACTIVIDAD</div>
          <div className="next-content">
            <div className="next-main-info">
              <div className="next-icon-wrapper" style={{ backgroundColor: next.color }}>
                <Play fill="white" color="white" size={20} />
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
                      <span>{pendingTasks} tareas pendientes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="next-actions">
              {next.resources.map((res: any) => (
                <button 
                  key={res.id} 
                  className="next-resource-btn"
                  onClick={() => window.open(res.url, '_blank')}
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
            overflow: hidden;
          }

          .next-activity-card {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 1.5rem;
            border-radius: 20px;
            position: relative;
            box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.3);
          }

          .next-badge {
            position: absolute;
            top: -10px;
            left: 20px;
            background: var(--primary);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.7rem;
            font-weight: 900;
            letter-spacing: 0.05em;
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
            gap: 1.5rem;
          }

          .next-icon-wrapper {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
          }

          .next-main-info h2 {
            font-size: 1.6rem;
            margin: 0;
            font-weight: 800;
            letter-spacing: -0.02em;
          }

          .next-meta {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-top: 6px;
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
            background: rgba(16, 185, 129, 0.1);
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
          }

          .next-resource-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};
