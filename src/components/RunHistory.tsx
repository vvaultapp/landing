import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FilterRun } from '@/types';

interface RunHistoryProps {
  runs: FilterRun[];
  onDelete: (id: string) => void;
  maxVisible?: number;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function RunHistory({ runs, onDelete, maxVisible = 5 }: RunHistoryProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleViewRun = (runId: string) => {
    navigate(`/run/${runId}`);
  };

  const visibleRuns = runs.slice(0, maxVisible);
  const hasMore = runs.length > maxVisible;

  if (runs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No runs yet
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {visibleRuns.map((run) => (
          <div 
            key={run.id} 
            className="p-4 bg-card border border-border rounded-lg relative group cursor-pointer hover:border-border transition-colors"
            onClick={() => handleViewRun(run.id)}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleDeleteClick(run.id, e)}
              className="absolute top-2 right-2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            
            <div className="mb-2 pr-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{run.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(run.timestamp)}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              {run.matchingProfiles} matching / {run.totalProfiles} total
            </p>
            
            {run.generateOpeners && (
              <p className="text-xs text-muted-foreground mt-1">
                ✓ Openers
              </p>
            )}
            
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        ))}

        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/runs')}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            View all runs →
          </Button>
        )}
      </div>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this run from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
