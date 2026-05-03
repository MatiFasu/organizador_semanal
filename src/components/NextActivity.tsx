import React, { useEffect, useState } from 'react';
import { useCourseData } from '../hooks/useCourseData';
import { DAYS_OF_WEEK } from '../types';
import { Clock, ExternalLink, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NextActivity: React.FC = () => {
  const { courses } = useCourseData();
  const [next, setNext] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const todayIndex = currentTime.getDay(); // 0 is Sunday, 1 is Monday
    const todayName = DAYS_OF_WEEK[(todayIndex + 6) % 7];
    const currentHM = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

    let upcoming: any[] = [];

    courses.forEach(course => {
      course.schedules.forEach(schedule => {
        if (schedule.dayOfWeek === todayName && schedule.startTime > currentHM) {
          upcoming.push({
            ...course,
            startTime: schedule.startTime,
            timeDiff: schedule.startTime.localeCompare(currentHM)
          });
        }
      });
    });

    upcoming.sort((a, b) => a.startTime.localeCompare(b.startTime));
    setNext(upcoming[0] || null);
  }, [courses, currentTime]);

  if (!next) return null;

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
                <div className="next-time">
                  <Clock size={16} />
                  <span>Hoy a las {next.startTime} hs</span>
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
            border-radius: 16px;
            position: relative;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
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
            font-weight: 800;
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
              gap: 1rem;
            }
          }

          .next-main-info {
            display: flex;
            align-items: center;
            gap: 1.5rem;
          }

          .next-icon-wrapper {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }

          .next-main-info h2 {
            font-size: 1.5rem;
            margin: 0;
            font-weight: 700;
          }

          .next-time {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #94a3b8;
            font-size: 0.9rem;
            margin-top: 4px;
          }

          .next-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .next-resource-btn {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.2s;
          }

          .next-resource-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};
