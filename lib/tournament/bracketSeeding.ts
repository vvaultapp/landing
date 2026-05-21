/* Standard tournament seeding: 1 vs N, 2 vs N-1, 3 vs N-2, ...

   Given participant ids ranked best-to-worst, returns an array of
   match descriptors in slot order. Used when the SQL helper isn't
   available (e.g. when an admin seeds a 16-participant bracket
   manually after skipping qualification). */

export type SeededMatch = {
  slot: number;
  participantA: string;
  participantB: string;
};

export function seedBracket(rankedParticipantIds: string[]): SeededMatch[] {
  const n = rankedParticipantIds.length;
  if (n < 2) return [];
  if (n % 2 !== 0) {
    // Drop the lowest seed if odd (admin probably wants to fix this).
    rankedParticipantIds = rankedParticipantIds.slice(0, n - 1);
  }
  const len = rankedParticipantIds.length;
  const out: SeededMatch[] = [];
  for (let i = 0; i < len / 2; i++) {
    out.push({
      slot: i + 1,
      participantA: rankedParticipantIds[i],
      participantB: rankedParticipantIds[len - 1 - i],
    });
  }
  return out;
}

/* Given a target round size (e.g. 16, 8, 4, 2), returns the matching
   round_number assuming the standard 16 → final progression. */
export function roundForSize(roundSize: number): number {
  switch (roundSize) {
    case 16:
      return 1;
    case 8:
      return 2;
    case 4:
      return 3;
    case 2:
      return 4;
    default:
      return 1;
  }
}
