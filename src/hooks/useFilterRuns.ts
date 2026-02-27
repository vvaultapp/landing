import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { CSVRow, FilterRun } from '@/types';

interface DbFilterRun {
  id: string;
  user_id: string;
  workspace_id: string | null;
  name: string;
  total_profiles: number;
  matching_profiles: number;
  include_keywords: string[];
  exclude_keywords: string[];
  original_headers: string[];
  prompt_id: string | null;
  prompt_snapshot: string | null;
  generate_openers: boolean;
  created_at: string;
}

interface DbRunData {
  id: string;
  run_id: string;
  row_index: number;
  row_data: CSVRow;
}

export function useFilterRuns() {
  const { user, profile } = useAuth();
  const [runs, setRuns] = useState<FilterRun[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = useCallback(async () => {
    if (!user) {
      setRuns([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch runs for current workspace if available, otherwise user's personal runs
    let query = supabase
      .from('filter_runs')
      .select('*')
      .order('created_at', { ascending: false });

    if (profile?.current_workspace_id) {
      query = query.eq('workspace_id', profile.current_workspace_id);
    } else {
      query = query.eq('user_id', user.id).is('workspace_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching runs:', error);
      setLoading(false);
      return;
    }

    const formattedRuns: FilterRun[] = (data as DbFilterRun[]).map((run) => ({
      id: run.id,
      name: run.name,
      timestamp: new Date(run.created_at),
      totalProfiles: run.total_profiles,
      matchingProfiles: run.matching_profiles,
      includeKeywords: run.include_keywords || [],
      excludeKeywords: run.exclude_keywords || [],
      filteredData: [],
      originalHeaders: run.original_headers || [],
      promptId: run.prompt_id,
      promptSnapshot: run.prompt_snapshot,
      generateOpeners: run.generate_openers,
    }));

    setRuns(formattedRuns);
    setLoading(false);
  }, [user, profile?.current_workspace_id]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  const createRun = async (run: Omit<FilterRun, 'id'>) => {
    if (!user) return { error: new Error('Not authenticated'), run: null };

    // Insert the run metadata
    const { data: runData, error: runError } = await supabase
      .from('filter_runs')
      .insert({
        user_id: user.id,
        workspace_id: profile?.current_workspace_id || null,
        name: run.name,
        total_profiles: run.totalProfiles,
        matching_profiles: run.matchingProfiles,
        include_keywords: run.includeKeywords,
        exclude_keywords: run.excludeKeywords,
        original_headers: run.originalHeaders,
        prompt_id: run.promptId || null,
        prompt_snapshot: run.promptSnapshot || null,
        generate_openers: run.generateOpeners,
      })
      .select()
      .single();

    if (runError || !runData) {
      return { error: runError as Error, run: null };
    }

    // Insert the run data rows in batches
    const batchSize = 100;
    const rows = run.filteredData.map((row, index) => ({
      run_id: runData.id,
      row_index: index,
      row_data: row,
    }));

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error: dataError } = await supabase
        .from('run_data')
        .insert(batch);

      if (dataError) {
        console.error('Error inserting run data:', dataError);
      }
    }

    const newRun: FilterRun = {
      ...run,
      id: runData.id,
      timestamp: new Date(runData.created_at),
    };

    setRuns((prev) => [newRun, ...prev]);
    return { error: null, run: newRun };
  };

  const getRunWithData = async (runId: string): Promise<FilterRun | null> => {
    const { data: runData, error: runError } = await supabase
      .from('filter_runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (runError || !runData) return null;

    const { data: rowsData, error: rowsError } = await supabase
      .from('run_data')
      .select('*')
      .eq('run_id', runId)
      .order('row_index', { ascending: true });

    if (rowsError) return null;

    const typedRunData = runData as DbFilterRun;
    const typedRowsData = rowsData as DbRunData[];

    return {
      id: typedRunData.id,
      name: typedRunData.name,
      timestamp: new Date(typedRunData.created_at),
      totalProfiles: typedRunData.total_profiles,
      matchingProfiles: typedRunData.matching_profiles,
      includeKeywords: typedRunData.include_keywords || [],
      excludeKeywords: typedRunData.exclude_keywords || [],
      filteredData: typedRowsData.map((r) => r.row_data),
      originalHeaders: typedRunData.original_headers || [],
      promptId: typedRunData.prompt_id,
      promptSnapshot: typedRunData.prompt_snapshot,
      generateOpeners: typedRunData.generate_openers,
    };
  };

  const deleteRun = async (runId: string) => {
    const { error } = await supabase
      .from('filter_runs')
      .delete()
      .eq('id', runId);

    if (!error) {
      setRuns((prev) => prev.filter((r) => r.id !== runId));
    }

    return { error: error as Error | null };
  };

  return {
    runs,
    loading,
    createRun,
    deleteRun,
    getRunWithData,
    refreshRuns: fetchRuns,
  };
}
