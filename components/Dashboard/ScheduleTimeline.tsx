import React from 'react';
import { cn } from '../../lib/utils';

interface TimelineJob {
  id: string;
  name: string;
  time: string;
  status: 'success' | 'processing' | 'queued';
  avatar?: string;
  imageUrl?: string; // Üretilen görsel URL'i
}

interface ScheduleTimelineProps {
  jobs?: TimelineJob[];
}

const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ jobs }) => {
  const displayJobs = jobs || [];
  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-primary';
      case 'processing': return 'bg-blue-500';
      case 'queued': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Success';
      case 'processing': return 'Processing';
      case 'queued': return 'Queued';
      default: return status;
    }
  };

  return (
    <div className="bg-card-dark rounded-xl border border-border-dark p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="material-icons-round text-primary text-lg">calendar_today</span>
          <h3 className="text-sm font-semibold text-white">Schedule Timeline</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-7 h-7 rounded-lg bg-background-dark border border-border-dark flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <span className="material-icons-round text-sm">chevron_left</span>
          </button>
          <button className="w-7 h-7 rounded-lg bg-background-dark border border-border-dark flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <span className="material-icons-round text-sm">chevron_right</span>
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-background-dark border border-border-dark text-xs font-medium text-slate-300 hover:text-white transition-colors">
            View Calendar
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Time axis */}
        <div className="flex justify-between mb-8 text-xs text-slate-500">
          {hours.map((hour) => (
            <span key={hour}>{hour}</span>
          ))}
        </div>

        {/* Timeline line */}
        <div className="absolute top-8 left-0 right-0 h-px bg-border-dark" />

        {/* Current time indicator */}
        <div className="absolute top-6 left-[45%] w-2 h-2 bg-primary rounded-full" />

        {/* Jobs */}
        <div className="relative h-40 mt-4">
          {displayJobs.map((job, index) => (
            <div
              key={job.id}
              className={cn(
                'absolute px-4 py-3 rounded-xl border transition-all hover:scale-105',
                job.status === 'processing'
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-card-dark border-border-dark'
              )}
              style={{
                left: `${30 + index * 15}%`,
                top: `${index * 50}px`,
              }}
            >
              <div className="flex items-center gap-3">
                {job.imageUrl ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-border-dark shrink-0">
                    <img
                      src={job.imageUrl}
                      alt={job.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-white text-sm">image</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white">{job.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500">{job.time}</span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className={cn('text-[10px] font-medium',
                      job.status === 'success' ? 'text-primary' :
                      job.status === 'processing' ? 'text-blue-400' : 'text-slate-400'
                    )}>
                      {getStatusText(job.status)}
                    </span>
                  </div>
                </div>
              </div>
              {/* Progress bar for processing */}
              {job.status === 'processing' && (
                <div className="mt-2 h-1 bg-blue-500/20 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-blue-500 rounded-full animate-pulse" />
                </div>
              )}
              {job.status === 'success' && (
                <div className="mt-2 h-1 bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-primary rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleTimeline;
