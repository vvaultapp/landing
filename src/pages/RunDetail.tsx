import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { useFilterRuns } from '@/hooks/useFilterRuns';
import { generateCSV, downloadCSV } from '@/lib/csv-utils';
import { FilterRun } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import acqLogo from '@/assets/ACQ_new_logo.png';

// Columns to exclude from display
const EXCLUDED_COLUMNS = [
  'id',
  'profilepicurl',
  'profilepicture',
  'profilepic',
  'avatar',
  'avatarurl',
  'matchedIncludeKeywords',
  'matchedExcludeKeywords',
  'openerError',
];

export default function RunDetail() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { portalRole, loading: portalLoading } = usePortalAuth();
  const { getRunWithData } = useFilterRuns();
  const [run, setRun] = useState<FilterRun | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || portalLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    if (portalRole === 'client') {
      navigate('/portal/meetings', { replace: true });
      return;
    }

    if (runId) {
      getRunWithData(runId).then((data) => {
        setRun(data);
        setLoading(false);
      });
    }
  }, [runId, user, authLoading, portalLoading, portalRole, navigate, getRunWithData]);

  const handleDownload = () => {
    if (!run) return;
    const csv = generateCSV(run.filteredData, run.originalHeaders);
    downloadCSV(csv, `${run.name.toLowerCase().replace(/\s/g, '-')}.csv`);
  };

  // Get display columns
  const getDisplayColumns = () => {
    if (!run || run.filteredData.length === 0) return [];
    
    const allColumns = Object.keys(run.filteredData[0]);
    return allColumns.filter(
      (col) => !EXCLUDED_COLUMNS.includes(col.toLowerCase())
    );
  };

  if (authLoading || portalLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-60 rounded-xl bg-white/[0.08]" />
            <Skeleton className="h-9 w-32 rounded-xl bg-white/[0.08]" />
          </div>
          <Skeleton className="h-6 w-64 rounded-xl bg-white/[0.10]" />
          <Skeleton className="h-4 w-80 rounded-xl bg-white/[0.06] mt-2" />
          <div className="mt-8 space-y-2">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="border border-white/10 rounded-2xl p-4 bg-black">
                <div className="flex items-center justify-between gap-6">
                  <Skeleton className="h-4 w-44 rounded-xl bg-white/[0.08]" />
                  <Skeleton className="h-4 w-64 rounded-xl bg-white/[0.06]" />
                  <Skeleton className="h-4 w-40 rounded-xl bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Run not found</p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const displayColumns = getDisplayColumns();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="tracking-tight font-sans text-lg font-normal">FILTERLEAD</h1>
              <span className="text-sm text-muted-foreground">by</span>
              <img src={acqLogo} alt="ACQ" className="h-4" />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
        </header>

        {/* Run Info */}
        <div className="mb-6 space-y-1">
          <h2 className="text-xl font-medium">{run.name}</h2>
          <p className="text-sm text-muted-foreground">
            {run.matchingProfiles} matching from {run.totalProfiles} total profiles
          </p>
          {run.includeKeywords.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Include: {run.includeKeywords.join(', ')}
            </p>
          )}
          {run.excludeKeywords.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Exclude: {run.excludeKeywords.join(', ')}
            </p>
          )}
          {run.generateOpeners && (
            <p className="text-xs text-muted-foreground">✓ Openers generated</p>
          )}
        </div>

        {/* Data Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12 text-center">#</TableHead>
                  {displayColumns.map((col) => (
                    <TableHead key={col} className="min-w-[120px]">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {run.filteredData.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/30">
                    <TableCell className="text-center text-muted-foreground text-xs">
                      {index + 1}
                    </TableCell>
                    {displayColumns.map((col) => (
                      <TableCell key={col} className="text-sm max-w-[300px] truncate">
                        {row[col] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {run.filteredData.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No data in this run
          </div>
        )}
      </div>
    </div>
  );
}
