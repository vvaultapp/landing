import { useState } from 'react';
import { Plus, X } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface KeywordInputProps {
  label: string;
  keywords: string[];
  onAdd: (keyword: string) => void;
  onRemove: (keyword: string) => void;
  placeholder?: string;
}

export function KeywordInput({
  label,
  keywords,
  onAdd,
  onRemove,
  placeholder,
}: KeywordInputProps) {
  const [value, setValue] = useState('');

  const handleAdd = () => {
    const trimmed = value.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      onAdd(trimmed);
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 h-9"
        />
        <Button
          onClick={handleAdd}
          size="sm"
          variant="secondary"
          className="h-9 px-3"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-xs rounded"
            >
              {kw}
              <button
                onClick={() => onRemove(kw)}
                className="hover:text-foreground text-muted-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
