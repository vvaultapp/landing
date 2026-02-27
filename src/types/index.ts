export interface CSVRow {
  [key: string]: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterRun {
  id: string;
  name: string;
  timestamp: Date;
  totalProfiles: number;
  matchingProfiles: number;
  includeKeywords: string[];
  excludeKeywords: string[];
  filteredData: CSVRow[];
  originalHeaders: string[];
  // New fields for opener generation
  promptId?: string | null;
  promptSnapshot?: string | null;
  generateOpeners: boolean;
}

export interface AppState {
  csvData: CSVRow[];
  headers: string[];
  includeKeywords: string[];
  excludeKeywords: string[];
  runs: FilterRun[];
  isProcessing: boolean;
  fileName: string | null;
}
