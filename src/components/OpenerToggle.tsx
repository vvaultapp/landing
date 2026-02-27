import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type OpenerStyle = 'pain-driven' | 'curiosity-driven' | 'ai-generated' | 'randomize' | 'custom';

interface OpenerToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  style: OpenerStyle;
  onStyleChange: (style: OpenerStyle) => void;
  customScript: string;
  onCustomScriptChange: (script: string) => void;
}

export function OpenerToggle({
  enabled,
  onToggle,
  style,
  onStyleChange,
  customScript,
  onCustomScriptChange,
}: OpenerToggleProps) {
  const [isExpanded, setIsExpanded] = useState(enabled);

  useEffect(() => {
    if (enabled) {
      // Small delay to allow smooth transition
      const timer = setTimeout(() => setIsExpanded(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsExpanded(false);
    }
  }, [enabled]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="generateOpeners" className="text-sm font-medium cursor-pointer">
          Generate openers
        </Label>
        <Switch
          id="generateOpeners"
          checked={enabled}
          onCheckedChange={onToggle}
        />
      </div>

      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          enabled ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 pt-2">
            <Select value={style} onValueChange={(v) => onStyleChange(v as OpenerStyle)}>
              <SelectTrigger className="w-full bg-background border-input">
                <SelectValue placeholder="Select opener style..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                <SelectItem 
                  value="pain-driven"
                  className="focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                >
                  Pain-driven
                </SelectItem>
                <SelectItem 
                  value="curiosity-driven"
                  className="focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                >
                  Curiosity-driven
                </SelectItem>
                <SelectItem 
                  value="ai-generated"
                  className="focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                >
                  AI-generated
                </SelectItem>
                <SelectItem 
                  value="randomize"
                  className="focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                >
                  Randomize
                </SelectItem>
                <SelectItem 
                  value="custom"
                  className="focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                >
                  Custom
                </SelectItem>
              </SelectContent>
            </Select>

            {style === 'custom' && (
              <div className="space-y-2">
                <Textarea
                  value={customScript}
                  onChange={(e) => onCustomScriptChange(e.target.value)}
                  placeholder="Enter your custom opener script..."
                  className="min-h-[80px] text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
