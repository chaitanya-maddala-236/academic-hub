import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FolderKanban, LayoutGrid } from 'lucide-react';
import { ActiveTab } from '../hooks/useResearch';

interface Tab {
  key: ActiveTab;
  label: string;
  count: number;
  icon: React.ElementType;
}

interface ResearchTabsProps {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
  counts: { all: number; publication: number; project: number };
}

export default function ResearchTabs({ activeTab, onChange, counts }: ResearchTabsProps) {
  const tabs: Tab[] = [
    { key: 'all', label: 'All Research', count: counts.all, icon: LayoutGrid },
    { key: 'publication', label: 'Publications', count: counts.publication, icon: BookOpen },
    { key: 'project', label: 'Projects', count: counts.project, icon: FolderKanban },
  ];

  return (
    <div
      className="flex gap-1 p-1 rounded-xl"
      style={{ backgroundColor: '#E5E7EB' }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(tab.key)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              backgroundColor: isActive ? '#2563EB' : 'transparent',
              color: isActive ? '#FFFFFF' : '#374151',
            }}
          >
            <Icon size={15} />
            {tab.label}
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#D1D5DB',
                color: isActive ? '#FFFFFF' : '#374151',
              }}
            >
              {tab.count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
