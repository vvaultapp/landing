import { FilterRun } from '@/types';

const STORAGE_KEY = 'lead-csv-filter-runs';
const MAX_RUNS = 20;
const MAX_AGE_DAYS = 7;

// Strip PII from stored runs - only keep metadata for history, but preserve openers
function sanitizeRunForStorage(run: FilterRun): FilterRun {
  return {
    ...run,
    filteredData: run.filteredData.map(row => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, phone, ...safeRow } = row;
      // Ensure opener is preserved
      return {
        ...safeRow,
        opener: row.opener ?? '',
      };
    }),
  };
}

function isExpired(run: FilterRun): boolean {
  const timestamp = run.timestamp instanceof Date ? run.timestamp : new Date(run.timestamp);
  const age = Date.now() - timestamp.getTime();
  return age > MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

export function saveRuns(runs: FilterRun[]): void {
  try {
    // Only keep recent runs and limit count
    const validRuns = runs
      .filter(r => !isExpired(r))
      .slice(0, MAX_RUNS)
      .map(sanitizeRunForStorage);
    
    const serialized = JSON.stringify(validRuns);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save runs');
  }
}

export function loadRuns(): FilterRun[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    const runs = parsed.map((run: FilterRun) => ({
      ...run,
      timestamp: new Date(run.timestamp),
      generateOpeners: run.generateOpeners ?? false,
    }));
    
    // Clean up expired runs on load
    const validRuns = runs.filter((r: FilterRun) => !isExpired(r)).slice(0, MAX_RUNS);
    if (validRuns.length !== runs.length) {
      saveRuns(validRuns);
    }
    
    return validRuns;
  } catch (error) {
    console.error('Failed to load runs');
    return [];
  }
}

export function deleteRun(runs: FilterRun[], runId: string): FilterRun[] {
  const updated = runs.filter((r) => r.id !== runId);
  saveRuns(updated);
  return updated;
}

export function clearAllRuns(): void {
  localStorage.removeItem(STORAGE_KEY);
}
