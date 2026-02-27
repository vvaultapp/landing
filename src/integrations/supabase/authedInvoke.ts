import { supabase } from './client';

type InvokeOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  method?: string;
};

type InvokeResult<T> = {
  data: T | null;
  error: any | null;
};

type EdgeInvokeErrorKind =
  | 'auth'
  | 'permission'
  | 'capability'
  | 'invalid_action'
  | 'network'
  | 'server'
  | 'unknown';

type ParsedEdgeInvokeError = {
  kind: EdgeInvokeErrorKind;
  status: number | null;
  message: string;
  rawMessage: string;
};

async function getLatestSessionToken(): Promise<string | null> {
  const maxAttempts = 12;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { data, error } = await supabase.auth.getSession();
    if (!error && data?.session?.access_token) {
      return String(data.session.access_token);
    }
    if (attempt < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, 50));
    }
  }
  return null;
}

function extractPayloadMessage(payload: any): string {
  if (!payload || typeof payload !== 'object') return '';
  const top = String((payload as any)?.error || (payload as any)?.message || '').trim();
  if (!top && !Array.isArray((payload as any)?.details)) return '';

  const details = Array.isArray((payload as any)?.details) ? (payload as any).details : [];
  if (details.length > 0) {
    const first = details[0] || {};
    const nested = String(
      first?.details?.error?.message ||
        first?.details?.message ||
        first?.details?.error?.error_message ||
        first?.details?.error?.error_user_msg ||
        ''
    ).trim();
    if (top && nested) return `${top}: ${nested}`;
    if (nested) return nested;
  }

  return top;
}

async function parseEdgeContext(context: Response | undefined): Promise<{ status: number | null; message: string }> {
  if (!context) return { status: null, message: '' };

  const status = Number(context.status || 0) || null;
  try {
    const payload = await context.clone().json();
    const message = extractPayloadMessage(payload);
    if (message) return { status, message };
  } catch {
    // ignore
  }

  try {
    const text = String(await context.clone().text()).trim();
    if (text) return { status, message: text };
  } catch {
    // ignore
  }

  return { status, message: '' };
}

export async function parseEdgeInvokeError(error: any): Promise<ParsedEdgeInvokeError> {
  const rawMessage = String(error?.message || error?.details || '').trim();
  const context = (error as any)?.context as Response | undefined;
  const parsedContext = await parseEdgeContext(context);
  const contextMessage = String(parsedContext.message || '').trim();
  const status = parsedContext.status;

  const haystack = `${rawMessage} ${contextMessage} ${String(error?.hint || '')}`.toLowerCase();
  const message = contextMessage || rawMessage || 'Request failed';

  if (
    haystack.includes('failed to send a request to the edge function') ||
    haystack.includes('networkerror') ||
    haystack.includes('typeerror: failed to fetch')
  ) {
    return { kind: 'network', status, message, rawMessage };
  }

  if (
    status === 401 ||
    haystack.includes('unauthorized') ||
    haystack.includes('invalid jwt') ||
    haystack.includes('jwt expired') ||
    haystack.includes('not authenticated') ||
    haystack.includes('no active session')
  ) {
    return { kind: 'auth', status, message, rawMessage };
  }

  if (
    status === 403 ||
    haystack.includes('forbidden') ||
    haystack.includes('permission denied') ||
    haystack.includes('not a workspace member')
  ) {
    return { kind: 'permission', status, message, rawMessage };
  }

  if (haystack.includes('invalid action')) {
    return { kind: 'invalid_action', status, message, rawMessage };
  }

  if (
    status === 404 ||
    haystack.includes('not found') ||
    haystack.includes('backend not updated') ||
    haystack.includes('missing action or workspaceid') ||
    haystack.includes('non-2xx')
  ) {
    return { kind: 'capability', status, message, rawMessage };
  }

  if (status != null && status >= 500) {
    return { kind: 'server', status, message, rawMessage };
  }

  return { kind: 'unknown', status, message, rawMessage };
}

export async function getEdgeInvokeErrorMessage(
  error: any,
  fallback: string,
  functionName: string,
): Promise<string> {
  const parsed = await parseEdgeInvokeError(error);
  if (parsed.kind === 'network') {
    return `Cannot reach Edge function \`${functionName}\`. Check deployment and network, then retry.`;
  }
  if (parsed.kind === 'auth') {
    return 'Authentication failed for this request. Refresh the page and retry. If it still fails, sign out and sign back in.';
  }
  if (parsed.kind === 'permission') {
    return 'You do not have permission for this workspace action. Ask an owner to grant access.';
  }
  if (parsed.kind === 'invalid_action') {
    return `This backend action is not available yet on \`${functionName}\`. Deploy the latest Edge functions.`;
  }
  if (parsed.kind === 'capability') {
    return `Backend capability mismatch for \`${functionName}\`. Deploy/update backend, then retry.`;
  }
  if (parsed.kind === 'server') {
    return `${fallback}: ${parsed.message}`;
  }
  return parsed.message || fallback;
}

export async function authedInvoke<T = any>(
  functionName: string,
  options: InvokeOptions,
): Promise<InvokeResult<T>> {
  const invokeOnce = async (headers?: Record<string, string>) => {
    return (await supabase.functions.invoke(functionName, {
      ...options,
      ...(headers ? { headers } : {}),
    })) as any;
  };

  const customHeaders =
    options.headers && Object.keys(options.headers).length > 0 ? options.headers : undefined;

  let res = await invokeOnce(customHeaders);
  if (!res?.error) return res;

  const parsed = await parseEdgeInvokeError(res.error);
  if (parsed.kind === 'auth') {
    await supabase.auth.refreshSession();

    // Retry once after session refresh with the same call shape.
    res = await invokeOnce(customHeaders);
    if (!res?.error) return res;

    // Final fallback: explicitly attach the latest session token.
    const token = await getLatestSessionToken();
    if (token) {
      const explicitHeaders: Record<string, string> = {
        ...(customHeaders || {}),
        Authorization: `Bearer ${token}`,
      };
      const apikey = (import.meta as any)?.env?.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
      if (apikey && !explicitHeaders.apikey) explicitHeaders.apikey = apikey;

      const explicitRes = await invokeOnce(explicitHeaders);
      if (!explicitRes?.error) return explicitRes;
      res = explicitRes;
    }

    // If custom headers were provided, retry once without them so supabase-js can attach defaults.
    if (customHeaders) {
      const fallback = await invokeOnce(undefined);
      if (!fallback?.error) return fallback;
      return fallback;
    }
  }

  return res;
}

export function invokeInboxAi<T = any>(
  body: unknown,
  options?: Omit<InvokeOptions, 'body'>,
): Promise<InvokeResult<T>> {
  return authedInvoke<T>('inbox-ai', { ...(options || {}), body });
}
