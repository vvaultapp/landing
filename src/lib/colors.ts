export function colorWithAlpha(color: string | null | undefined, alpha = 0.22): string {
  const value = String(color || '').trim();
  if (!value) return `rgba(255, 255, 255, ${alpha})`;

  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const hex = value
      .slice(1)
      .split('')
      .map((ch) => ch + ch)
      .join('');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (/^#[0-9a-f]{6}$/i.test(value)) {
    const hex = value.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // If the caller passes an rgba/hsl/etc string, we can't reliably apply alpha here.
  return value;
}

export function orbCssVars(accentColor?: string | null): Record<string, string> {
  if (!accentColor) {
    return {
      '--orb-tint': 'rgba(255,255,255,0.06)',
      '--orb-glow': 'rgba(255,255,255,0.18)',
    };
  }

  return {
    '--orb-tint': colorWithAlpha(accentColor, 0.16),
    '--orb-glow': colorWithAlpha(accentColor, 0.42),
  };
}

