import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface Job {
  id: string;
  type: string;
  persona: string;
  status: 'completed' | 'processing' | 'queued';
  time: string;
  imageUrl?: string; // Üretilen görsel URL'i
}

interface RecentJobsProps {
  jobs?: Job[];
  onViewHistory?: () => void;
}

const RecentJobs: React.FC<RecentJobsProps> = ({ jobs, onViewHistory }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const defaultJobs: Job[] = [
    { id: '#d2feb7', type: 'Pose Gen', persona: 'newfluencer', status: 'completed', time: '12m ago' },
    { id: '#f8ae23', type: 'Virtual Try-on', persona: 'fashion_icon_01', status: 'processing', time: 'Just now' },
    { id: '#e9c112', type: 'Bulk Upscale', persona: 'studio_admin', status: 'queued', time: '1h ago' },
  ];

  const displayJobs = jobs || defaultJobs;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-500/20 text-green-400">Completed</span>;
      case 'processing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400">Processing</span>;
      case 'queued':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-500/20 text-slate-400">Queued</span>;
      default:
        return null;
    }
  };

  const getPersonaAvatar = (persona: string) => {
    const colors: Record<string, string> = {
      'newfluencer': 'from-blue-400 to-cyan-500',
      'fashion_icon_01': 'from-secondary to-pink-500',
      'studio_admin': 'from-amber-400 to-orange-500',
    };
    return colors[persona] || 'from-slate-400 to-slate-500';
  };

  return (
    <div className="bg-card-dark rounded-xl border border-border-dark p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Recent Jobs</h3>
        <button
          onClick={onViewHistory}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View All History
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 pb-3 border-b border-border-dark mb-3">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Görsel</span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Type</span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Job ID</span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Time</span>
      </div>

      {/* Table Body */}
      <div className="space-y-3">
        {displayJobs.map((job) => (
          <div key={job.id} className="grid grid-cols-5 gap-4 items-center py-2 hover:bg-white/5 rounded-lg transition-colors -mx-2 px-2">
            {/* Görsel Thumbnail */}
            <div className="flex items-center">
              {job.imageUrl ? (
                <button
                  onClick={() => setSelectedImage(job.imageUrl || null)}
                  className="relative w-10 h-10 rounded-lg overflow-hidden border border-border-dark hover:border-primary/50 transition-all hover:scale-105 group"
                >
                  <img
                    src={job.imageUrl}
                    alt={job.type}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="material-icons-round text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">zoom_in</span>
                  </div>
                </button>
              ) : (
                <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm text-white font-bold', getPersonaAvatar(job.persona))}>
                  <span className="material-icons-round text-lg">image</span>
                </div>
              )}
            </div>
            <span className="text-xs text-white">{job.type}</span>
            <span className="text-xs font-mono text-slate-400">{job.id}</span>
            {getStatusBadge(job.status)}
            <span className="text-xs text-slate-500">{job.time}</span>
          </div>
        ))}
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <span className="material-icons-round">close</span>
            </button>
            <img
              src={selectedImage}
              alt="Generated Image"
              className="max-w-full max-h-[85vh] rounded-xl border border-border-dark shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentJobs;
