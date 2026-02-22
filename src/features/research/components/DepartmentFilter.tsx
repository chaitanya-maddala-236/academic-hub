import { motion } from 'framer-motion';

const DEPARTMENTS = ['All', 'CSE', 'AIDS', 'DS', 'MECH', 'ECE'] as const;

interface DepartmentFilterProps {
  active: string;
  onChange: (dept: string) => void;
}

export default function DepartmentFilter({ active, onChange }: DepartmentFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {DEPARTMENTS.map((dept) => {
        const isActive = active === dept || (dept === 'All' && !active);
        return (
          <motion.button
            key={dept}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(dept === 'All' ? '' : dept)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
            style={{
              backgroundColor: isActive ? '#2563EB' : '#F3F4F6',
              color: isActive ? '#FFFFFF' : '#374151',
              boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
            }}
          >
            {dept}
          </motion.button>
        );
      })}
    </div>
  );
}
