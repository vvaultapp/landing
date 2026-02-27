const SETTER_ROLE_HINT_PREFIX = 'acq_setter_role_hint:';

const getSetterRoleHintKey = (userId: string) => `${SETTER_ROLE_HINT_PREFIX}${userId}`;

export const hasSetterRoleHint = (userId: string | null | undefined): boolean => {
  if (typeof window === 'undefined' || !userId) return false;
  try {
    return window.localStorage.getItem(getSetterRoleHintKey(userId)) === 'setter';
  } catch {
    return false;
  }
};

export const setSetterRoleHint = (userId: string | null | undefined): void => {
  if (typeof window === 'undefined' || !userId) return;
  try {
    window.localStorage.setItem(getSetterRoleHintKey(userId), 'setter');
  } catch {
    // ignore storage failures
  }
};

export const hasSetterMetadataHint = (userMetadata: unknown): boolean => {
  const raw = (userMetadata as Record<string, unknown> | null | undefined)?.acq_role_hint;
  return String(raw || '').trim().toLowerCase() === 'setter';
};
