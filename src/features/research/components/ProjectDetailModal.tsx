import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, Building2, User, Users, Clock } from 'lucide-react';
import { ResearchProject } from '../services/researchApi';

interface ProjectDetailModalProps {
  project: ResearchProject | null;
  onClose: () => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-lg bg-blue-50 shrink-0">
        <Icon size={14} className="text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const formatAmount = (amount: number | null) => {
    if (amount == null) return null;
    return `₹${amount.toFixed(2)} Lakhs`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const isOngoing = project?.status === 'ONGOING';

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              style={{ background: '#ffffff' }}
            >
              {/* Header */}
              <div
                className="sticky top-0 flex items-start justify-between gap-3 p-5 border-b border-gray-100 rounded-t-2xl"
                style={{ background: '#ffffff' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isOngoing ? '#DCFCE7' : '#DBEAFE',
                        color: isOngoing ? '#16A34A' : '#2563EB',
                      }}
                    >
                      {project.status}
                    </span>
                    {project.department && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {project.department}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-gray-900 leading-snug">{project.title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={User} label="Principal Investigator" value={project.principal_investigator} />
                  <InfoRow icon={Users} label="Co-Investigators" value={project.co_investigators} />
                  <InfoRow icon={Building2} label="Funding Agency" value={project.funding_agency} />
                  <InfoRow icon={DollarSign} label="Sanctioned Amount" value={formatAmount(project.amount_lakhs)} />
                  <InfoRow icon={Calendar} label="Sanction Date" value={formatDate(project.sanction_date)} />
                  <InfoRow icon={Clock} label="Duration" value={project.duration} />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
