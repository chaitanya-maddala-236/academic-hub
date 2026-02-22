import { motion } from 'framer-motion';
import { Calendar, DollarSign, Building2, User } from 'lucide-react';
import { ResearchProject } from '../services/researchApi';

interface ProjectCardProps {
  project: ResearchProject;
  onClick: (project: ResearchProject) => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const isOngoing = project.status === 'ONGOING';

  const formatAmount = (amount: number | null) => {
    if (amount == null) return '—';
    return `₹${amount.toFixed(2)} L`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(project)}
      className="cursor-pointer rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        border: '1px solid #E5E7EB',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm leading-snug text-gray-900 line-clamp-2 flex-1">
          {project.title}
        </h3>
        <span
          className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: isOngoing ? '#DCFCE7' : '#DBEAFE',
            color: isOngoing ? '#16A34A' : '#2563EB',
          }}
        >
          {project.status}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {project.principal_investigator && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <User size={12} className="shrink-0 text-gray-400" />
            <span className="truncate">{project.principal_investigator}</span>
          </div>
        )}
        {project.funding_agency && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <Building2 size={12} className="shrink-0 text-gray-400" />
            <span className="truncate">{project.funding_agency}</span>
          </div>
        )}
        {project.amount_lakhs != null && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <DollarSign size={12} className="shrink-0 text-gray-400" />
            <span>{formatAmount(project.amount_lakhs)}</span>
          </div>
        )}
        {project.sanction_date && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar size={12} className="shrink-0 text-gray-400" />
            <span>{formatDate(project.sanction_date)}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {project.department || 'General'}
        </span>
        <span className="text-xs text-gray-400 hover:text-blue-600 transition-colors">
          View details →
        </span>
      </div>
    </motion.div>
  );
}
