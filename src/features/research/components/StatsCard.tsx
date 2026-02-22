import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

export default function StatsCard({ label, value, icon: Icon, iconBg, iconColor }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-4 rounded-2xl p-5"
      style={{
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #E5E7EB',
      }}
    >
      <div
        className="flex items-center justify-center rounded-xl shrink-0"
        style={{ width: 48, height: 48, backgroundColor: iconBg }}
      >
        <Icon size={22} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-tight" style={{ color: '#111827' }}>
          {value}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}
