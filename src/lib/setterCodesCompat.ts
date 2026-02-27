const setterCodesSchemaWarnings = new Set<string>();

function asMessage(error: unknown): string {
  const anyErr = error as any;
  return String(anyErr?.message || anyErr?.details || anyErr?.hint || error || '').toLowerCase();
}

export function isSetterCodesSchemaMismatch(error: unknown): boolean {
  const anyErr = error as any;
  const code = String(anyErr?.code || '').trim();
  const text = asMessage(error);

  if (code === '42703') return true;
  if (!text.includes('setter_codes')) return false;
  return text.includes('does not exist') || text.includes('column') || text.includes('schema cache');
}

export function warnSetterCodesSchemaMismatchOnce(scope: string, error: unknown): boolean {
  if (!isSetterCodesSchemaMismatch(error)) return false;
  const key = String(scope || 'unknown').trim() || 'unknown';
  if (setterCodesSchemaWarnings.has(key)) return true;
  setterCodesSchemaWarnings.add(key);
  console.warn(`[setter_codes:${key}] Schema mismatch detected. Falling back without noisy retries.`, error);
  return true;
}
