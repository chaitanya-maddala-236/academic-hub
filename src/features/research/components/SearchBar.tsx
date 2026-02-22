import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFiltersToggle: () => void;
  showFilters: boolean;
}

export default function SearchBar({ value, onChange, onFiltersToggle, showFilters }: SearchBarProps) {
  return (
    <div className="flex gap-3 flex-wrap items-center">
      <div className="relative flex-1 min-w-52">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search by title, faculty, journal, agency..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 rounded-xl"
        />
      </div>
      <Button
        variant={showFilters ? 'default' : 'outline'}
        className="gap-2 rounded-xl"
        onClick={onFiltersToggle}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </Button>
    </div>
  );
}
