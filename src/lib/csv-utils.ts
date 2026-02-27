import Papa from 'papaparse';
import { CSVRow } from '@/types';

const SEARCHABLE_COLUMNS = [
  'username',
  'fullname',
  'name',
  'bio',
  'category',
  'businesscategory',
  'title',
  'website',
];

export function parseCSV(file: File): Promise<{ data: CSVRow[]; headers: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        resolve({ data: results.data as CSVRow[], headers });
      },
      error: (error) => reject(error),
    });
  });
}

export function getSearchableText(row: CSVRow, headers: string[]): string {
  const lowerHeaders = headers.map((h) => h.toLowerCase());
  const searchableHeaders = SEARCHABLE_COLUMNS.filter((col) =>
    lowerHeaders.includes(col)
  );

  if (searchableHeaders.length === 0) {
    return Object.values(row)
      .filter((v) => typeof v === 'string')
      .join(' ')
      .toLowerCase();
  }

  return searchableHeaders
    .map((col) => {
      const actualHeader = headers.find((h) => h.toLowerCase() === col);
      return actualHeader ? row[actualHeader] || '' : '';
    })
    .join(' ')
    .toLowerCase();
}

export function matchesKeyword(text: string, keyword: string): boolean {
  return text.includes(keyword.toLowerCase());
}

export function filterData(
  data: CSVRow[],
  headers: string[],
  includeKeywords: string[],
  excludeKeywords: string[]
): { filtered: CSVRow[]; matchedIncludes: Map<number, string[]>; matchedExcludes: Map<number, string[]> } {
  const matchedIncludes = new Map<number, string[]>();
  const matchedExcludes = new Map<number, string[]>();
  const seen = new Set<string>();

  const filtered = data.filter((row, index) => {
    const searchText = getSearchableText(row, headers);

    // Check for username deduplication
    const usernameHeader = headers.find((h) => h.toLowerCase() === 'username');
    if (usernameHeader) {
      const username = (row[usernameHeader] || '').toLowerCase();
      if (username && seen.has(username)) {
        return false;
      }
      if (username) seen.add(username);
    }

    // Check exclude keywords first
    const excludeMatches = excludeKeywords.filter((kw) =>
      matchesKeyword(searchText, kw)
    );
    if (excludeMatches.length > 0) {
      matchedExcludes.set(index, excludeMatches);
      return false;
    }

    // Check include keywords
    if (includeKeywords.length === 0) {
      matchedIncludes.set(index, []);
      return true;
    }

    const includeMatches = includeKeywords.filter((kw) =>
      matchesKeyword(searchText, kw)
    );
    if (includeMatches.length > 0) {
      matchedIncludes.set(index, includeMatches);
      return true;
    }

    return false;
  });

  return { filtered, matchedIncludes, matchedExcludes };
}

// Columns to remove from output
const COLUMNS_TO_REMOVE = ['id', 'profilepicurl', 'profilepicture', 'profilepic', 'avatar', 'avatarurl', 'openerError', 'matchedincludekeywords', 'matchedexcludekeywords'];

export function enrichRow(
  row: CSVRow,
  headers: string[],
  matchedInclude: string[],
  matchedExclude: string[]
): CSVRow {
  const enriched = { ...row };

  // Add Instagram URL if username exists
  const usernameHeader = headers.find((h) => h.toLowerCase() === 'username');
  if (usernameHeader && row[usernameHeader]) {
    enriched.instagramUrl = `https://instagram.com/${row[usernameHeader]}`;
  }

  enriched.matchedIncludeKeywords = matchedInclude.join(', ');
  enriched.matchedExcludeKeywords = matchedExclude.join(', ');

  return enriched;
}

export function getCleanHeaders(headers: string[]): string[] {
  return headers.filter(
    (h) => !COLUMNS_TO_REMOVE.includes(h.toLowerCase())
  );
}

export function cleanRow(row: CSVRow, headers: string[]): CSVRow {
  const cleaned: CSVRow = {};
  const cleanHeaders = getCleanHeaders(headers);
  
  for (const header of cleanHeaders) {
    if (row[header] !== undefined) {
      cleaned[header] = row[header];
    }
  }
  
  // Keep enriched columns (excluding matched keywords columns)
  if (row.instagramUrl) cleaned.instagramUrl = row.instagramUrl;
  // Always include opener column - use empty string if not present
  cleaned.opener = row.opener ?? '';
  
  return cleaned;
}

export function generateCSV(data: CSVRow[], headers: string[]): string {
  const cleanHeaders = getCleanHeaders(headers);
  const enrichedHeaders = [
    ...cleanHeaders,
    'instagramUrl',
    'opener',
  ];

  const cleanedData = data.map((row) => cleanRow(row, headers));

  return Papa.unparse(cleanedData, {
    columns: enrichedHeaders,
  });
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
