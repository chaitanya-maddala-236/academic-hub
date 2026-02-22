import { motion } from 'framer-motion';
import { ExternalLink, Eye, DollarSign, Building2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResearchItem } from '../services/researchApi';

interface ResearchCardProps {
  item: ResearchItem;
  onProjectClick?: (item: ResearchItem) => void;
}

const statusStyle: Record<string, { bg: string; text: string }> = {
  ongoing: { bg: '#DCFCE7', text: '#16A34A' },
  completed: { bg: '#DBEAFE', text: '#2563EB' },
};

export default function ResearchCard({ item, onProjectClick }: ResearchCardProps) {
  const isPublication = item.recordType === 'publication';
  const st = statusStyle[item.status ?? ''] ?? { bg: '#F3F4F6', text: '#6B7280' };

  const handleClick = () => {
    if (!isPublication && onProjectClick) onProjectClick(item);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ y: -3, boxShadow: '0 10px 28px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className={`rounded-2xl p-5 flex flex-col gap-3 ${!isPublication ? 'cursor-pointer' : ''}`}
      style={{
        background: isPublication
          ? 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)'
          : 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        border: '1px solid #E5E7EB',
      }}
    >
      {/* Type badge + status/year */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{
            backgroundColor: isPublication ? '#DBEAFE' : '#DCFCE7',
            color: isPublication ? '#2563EB' : '#16A34A',
          }}
        >
          {isPublication ? 'Publication' : 'Project'}
        </span>
        {item.status && !isPublication && (
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize"
            style={{ backgroundColor: st.bg, color: st.text }}
          >
            {item.status}
          </span>
        )}
        {item.year && (
          <span className="text-xs text-gray-400 ml-auto">{item.year}</span>
        )}
      </div>

      {/* Title */}
      <p className="font-semibold text-sm leading-snug text-gray-900 line-clamp-2">
        {item.title}
      </p>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {isPublication ? (
          <>
            {item.facultyName && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <User size={11} className="shrink-0 text-gray-400" />
                <span className="truncate">{item.facultyName}</span>
              </div>
            )}
            {item.journal && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <ExternalLink size={11} className="shrink-0 text-gray-400" />
                <span className="truncate">{item.journal}</span>
              </div>
            )}
            {item.department && (
              <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
                <Building2 size={11} className="shrink-0 text-gray-400" />
                <span>{item.department}</span>
              </div>
            )}
          </>
        ) : (
          <>
            {item.pi && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <User size={11} className="shrink-0 text-gray-400" />
                <span className="truncate">{item.pi}</span>
              </div>
            )}
            {item.agency && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Building2 size={11} className="shrink-0 text-gray-400" />
                <span className="truncate">{item.agency}</span>
              </div>
            )}
            {item.amount != null && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <DollarSign size={11} className="shrink-0 text-gray-400" />
                <span>₹{item.amount.toFixed(2)} L</span>
              </div>
            )}
            {item.department && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Building2 size={11} className="shrink-0 text-gray-400" />
                <span>{item.department}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        {item.indexing && item.indexing.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {item.indexing.slice(0, 2).map((idx) => (
              <span
                key={idx}
                className="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 font-medium"
              >
                {idx}
              </span>
            ))}
          </div>
        )}
        {isPublication ? (
          <Link
            to={`/research/publication/${item.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-blue-600 hover:underline ml-auto flex items-center gap-1"
          >
            <Eye size={11} /> View Details
          </Link>
        ) : (
          <span className="text-xs text-green-600 ml-auto">Click to expand →</span>
        )}
      </div>
    </motion.div>
  );
}
