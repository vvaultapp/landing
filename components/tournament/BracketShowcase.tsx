"use client";

import type { ParticipantWithVotes } from "@/lib/tournament/types";

/* Premium decorative 16 → 1 tournament bracket.

   Visual design:
   - Cards: rounded rectangles with a hairline gradient stroke
     (white/30 → white/8) and a soft inner glass tint. Filled R1
     slots get a slightly brighter accent.
   - Connectors: dashed hairlines that flow inward, all 90° polylines.
   - Trophy: gold gradient body sitting inside a soft radial glow.
   - Round labels are uppercase tracked small caps. */

const QUALIFIERS = 16;

const AVATAR_SIZE = 22;
const AVATAR_INSET = 3;
const CARD_H = AVATAR_SIZE + AVATAR_INSET * 2;
const CARD_W = 116;
const CARD_RX = 8;
const ROUND_LABEL_H = 32;
const COL_GAP = 60;
const SIDE_PADDING = 18;
const TROPHY_W = 140;
const TROPHY_R = 36;

const SLOT_GAP_R1 = 12;
const MATCH_H_R1 = CARD_H * 2 + SLOT_GAP_R1;
const MATCH_GAP_R1 = 22;
const R1_PITCH = MATCH_H_R1 + MATCH_GAP_R1;

const R1_PER_SIDE = 4;

const SIDE_W = 3 * CARD_W + 2 * COL_GAP;
const TOTAL_W = SIDE_W * 2 + TROPHY_W + SIDE_PADDING * 2 + COL_GAP * 2;

const TROPHY_CENTER_X = SIDE_PADDING + SIDE_W + COL_GAP + TROPHY_W / 2;

function colCardX(side: Side, round: number): number {
  if (side === "left") {
    return SIDE_PADDING + round * (CARD_W + COL_GAP);
  }
  return (
    SIDE_PADDING +
    SIDE_W +
    TROPHY_W +
    COL_GAP * 2 +
    (2 - round) * (CARD_W + COL_GAP)
  );
}
function colCardRightX(side: Side, round: number): number {
  return colCardX(side, round) + CARD_W;
}
function cardOuterX(side: Side, round: number): number {
  return side === "left" ? colCardX(side, round) : colCardRightX(side, round);
}
function cardInnerX(side: Side, round: number): number {
  return side === "left" ? colCardRightX(side, round) : colCardX(side, round);
}
function colCenterX(side: Side, round: number): number {
  return colCardX(side, round) + CARD_W / 2;
}
function trophyEntryX(side: Side): number {
  return side === "left" ? TROPHY_CENTER_X - TROPHY_R : TROPHY_CENTER_X + TROPHY_R;
}

function r1MatchTop(i: number) {
  return ROUND_LABEL_H + i * R1_PITCH;
}
function r1TopSlotCenter(i: number) {
  return r1MatchTop(i) + CARD_H / 2;
}
function r1BotSlotCenter(i: number) {
  return r1MatchTop(i) + CARD_H + SLOT_GAP_R1 + CARD_H / 2;
}
function r1MatchCenter(i: number) {
  return r1MatchTop(i) + MATCH_H_R1 / 2;
}
function r2TopSlotCenter(i: number) {
  return r1MatchCenter(i * 2);
}
function r2BotSlotCenter(i: number) {
  return r1MatchCenter(i * 2 + 1);
}
function r2MatchCenter(i: number) {
  return (r2TopSlotCenter(i) + r2BotSlotCenter(i)) / 2;
}
function r3TopSlotCenter() {
  return r2MatchCenter(0);
}
function r3BotSlotCenter() {
  return r2MatchCenter(1);
}
function r3MatchCenter() {
  return (r3TopSlotCenter() + r3BotSlotCenter()) / 2;
}

const R1_BOTTOM = r1MatchTop(R1_PER_SIDE - 1) + MATCH_H_R1;
const TOTAL_H = R1_BOTTOM + 36;

const ROUND_LABELS = ["Round of 16", "Quarterfinals", "Semifinals"];

type Slot = {
  name: string | null;
  picture: string | null;
  isPlaceholder: boolean;
};
type MatchPair = { a: Slot; b: Slot };
type Side = "left" | "right";

const emptySlot: Slot = { name: null, picture: null, isPlaceholder: true };

function makeSlots(ranked: ParticipantWithVotes[]): Slot[] {
  const slots: Slot[] = [];
  for (let i = 0; i < QUALIFIERS; i++) {
    const p = ranked[i];
    if (!p) {
      slots.push({ name: null, picture: null, isPlaceholder: true });
    } else {
      const name = p.vvault_username
        ? `@${p.vvault_username}`
        : p.profile_name || p.track_title || null;
      slots.push({
        name,
        picture: p.profile_picture,
        isPlaceholder: false,
      });
    }
  }
  return slots;
}

function makePairs(slots: Slot[]): MatchPair[] {
  const pairs: MatchPair[] = [];
  for (let i = 0; i < QUALIFIERS / 2; i++) {
    pairs.push({ a: slots[i], b: slots[QUALIFIERS - 1 - i] });
  }
  return pairs;
}

export function BracketShowcase({
  ranked,
}: {
  ranked: ParticipantWithVotes[];
}) {
  const slots = makeSlots(ranked);
  const pairs = makePairs(slots);
  const leftPairs = pairs.slice(0, R1_PER_SIDE);
  const rightPairs = pairs.slice(R1_PER_SIDE, R1_PER_SIDE * 2);

  return (
    <div className="relative w-full">
      {/* Ambient gold glow behind trophy */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mx-auto"
        style={{
          background:
            "radial-gradient(28% 36% at 50% 52%, rgba(250,204,21,0.16) 0%, rgba(250,204,21,0.04) 45%, transparent 75%)",
        }}
      />
      <svg
        width="100%"
        viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Tournament bracket"
        className="block h-auto max-h-[82vh]"
      >
        <defs>
          <clipPath id="avatarClip">
            <circle cx={AVATAR_SIZE / 2} cy={AVATAR_SIZE / 2} r={AVATAR_SIZE / 2} />
          </clipPath>
          <linearGradient id="cardStroke" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.32)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>
          <linearGradient id="cardStrokeFilled" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.16)" />
          </linearGradient>
          <linearGradient id="cardFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.012)" />
          </linearGradient>
          <linearGradient id="cardFillFilled" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(56,189,248,0.16)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0.04)" />
          </linearGradient>
          <linearGradient id="goldGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="55%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <radialGradient id="trophyHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(250,204,21,0.55)" />
            <stop offset="55%" stopColor="rgba(250,204,21,0.18)" />
            <stop offset="100%" stopColor="rgba(250,204,21,0)" />
          </radialGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Round labels */}
        {ROUND_LABELS.map((label, i) => (
          <text
            key={`ll-${i}`}
            x={colCenterX("left", i)}
            y={18}
            textAnchor="middle"
            fontSize={9}
            fontFamily="inherit"
            fill="rgba(255,255,255,0.55)"
            fontWeight={600}
            letterSpacing="0.16em"
          >
            {label.toUpperCase()}
          </text>
        ))}
        {ROUND_LABELS.map((label, i) => (
          <text
            key={`rl-${i}`}
            x={colCenterX("right", i)}
            y={18}
            textAnchor="middle"
            fontSize={9}
            fontFamily="inherit"
            fill="rgba(255,255,255,0.55)"
            fontWeight={600}
            letterSpacing="0.16em"
          >
            {label.toUpperCase()}
          </text>
        ))}

        {/* Connectors (under cards) */}
        {renderConnectors("left")}
        {renderConnectors("right")}

        {/* R2 / R3 placeholder cards — both sides */}
        {(["left", "right"] as Side[]).map((side) => (
          <g key={`${side}-r2r3`}>
            {[0, 1].flatMap((i) =>
              [r2TopSlotCenter(i), r2BotSlotCenter(i)].map((cy, j) => (
                <g
                  key={`${side}-r2-${i}-${j}`}
                  transform={`translate(${colCardX(side, 1)}, ${cy - CARD_H / 2})`}
                >
                  <Card y={0} slot={emptySlot} side={side} />
                </g>
              )),
            )}
            {[r3TopSlotCenter(), r3BotSlotCenter()].map((cy, j) => (
              <g
                key={`${side}-r3-${j}`}
                transform={`translate(${colCardX(side, 2)}, ${cy - CARD_H / 2})`}
              >
                <Card y={0} slot={emptySlot} side={side} />
              </g>
            ))}
          </g>
        ))}

        {/* R1 cards */}
        {leftPairs.map((pair, i) => (
          <R1Match key={`l1-${i}`} i={i} pair={pair} side="left" />
        ))}
        {rightPairs.map((pair, i) => (
          <R1Match key={`r1-${i}`} i={i} pair={pair} side="right" />
        ))}

        {/* Trophy */}
        {(() => {
          const tx = TROPHY_CENTER_X;
          const ty = r3MatchCenter();
          return (
            <g key="trophy">
              <circle
                cx={tx}
                cy={ty}
                r={TROPHY_R + 12}
                fill="url(#trophyHalo)"
              />
              <circle
                cx={tx}
                cy={ty}
                r={TROPHY_R}
                fill="rgba(0,0,0,0.35)"
                stroke="rgba(250,204,21,0.45)"
                strokeWidth={1}
              />
              <g transform={`translate(${tx - 22}, ${ty - 24})`} filter="url(#softGlow)">
                <TrophyIcon />
              </g>
              <text
                x={tx}
                y={ty + TROPHY_R + 18}
                textAnchor="middle"
                fontSize={9}
                fontFamily="inherit"
                fill="rgba(253,224,71,0.95)"
                fontWeight={600}
                letterSpacing="0.22em"
              >
                CHAMPION
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

function R1Match({
  i,
  pair,
  side,
}: {
  i: number;
  pair: MatchPair;
  side: Side;
}) {
  const x = colCardX(side, 0);
  const y = r1MatchTop(i);
  return (
    <g transform={`translate(${x}, ${y})`}>
      <Card y={0} slot={pair.a} side={side} />
      <Card y={CARD_H + SLOT_GAP_R1} slot={pair.b} side={side} />
    </g>
  );
}

function Card({
  y,
  slot,
  side,
}: {
  y: number;
  slot: Slot;
  side: Side;
}) {
  const avatarOnRight = side === "left";
  const avatarX = avatarOnRight
    ? CARD_W - AVATAR_INSET - AVATAR_SIZE
    : AVATAR_INSET;
  const avatarY = AVATAR_INSET;
  const textRenderX = CARD_W / 2;
  const textW = CARD_W - 12;

  const fontSize = fontSizeForName(slot.name ?? "");
  const filled = !slot.isPlaceholder;

  return (
    <g transform={`translate(0, ${y})`}>
      <rect
        x={0}
        y={0}
        width={CARD_W}
        height={CARD_H}
        rx={CARD_RX}
        fill={filled ? "url(#cardFillFilled)" : "url(#cardFill)"}
        stroke={filled ? "url(#cardStrokeFilled)" : "url(#cardStroke)"}
        strokeWidth={1}
      />

      {slot.picture ? (
        <g transform={`translate(${avatarX}, ${avatarY})`}>
          <circle
            cx={AVATAR_SIZE / 2}
            cy={AVATAR_SIZE / 2}
            r={AVATAR_SIZE / 2}
            fill="rgba(255,255,255,0.08)"
          />
          <image
            href={slot.picture}
            x={0}
            y={0}
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            clipPath="url(#avatarClip)"
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      ) : (
        <circle
          cx={avatarX + AVATAR_SIZE / 2}
          cy={avatarY + AVATAR_SIZE / 2}
          r={AVATAR_SIZE / 2}
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={0.75}
          strokeDasharray="1.6 2.2"
        />
      )}

      {slot.name ? (
        <text
          x={textRenderX}
          y={CARD_H / 2 + 0.5}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fontFamily="inherit"
          fill="rgba(255,255,255,0.95)"
          fontWeight={500}
          textLength={textW > 0 ? Math.min(textW, estimateTextWidth(slot.name, fontSize)) : undefined}
          lengthAdjust="spacingAndGlyphs"
        >
          {slot.name}
        </text>
      ) : null}
    </g>
  );
}

function estimateTextWidth(s: string, fontSize: number): number {
  return s.length * fontSize * 0.58;
}

function fontSizeForName(name: string): number {
  const len = name.length;
  if (len <= 9) return 10;
  if (len <= 12) return 9;
  if (len <= 16) return 8;
  if (len <= 20) return 7;
  return 6;
}

function renderConnectors(side: Side) {
  const stroke = "rgba(255,255,255,0.18)";
  const sw = 1;
  const dash = "2.2 3";
  const elbowOffset = 16;
  const dir = side === "left" ? 1 : -1;

  const lines: React.ReactNode[] = [];
  function add(key: string, x1: number, y1: number, x2: number, y2: number) {
    lines.push(
      <line
        key={key}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={dash}
      />,
    );
  }

  for (let i = 0; i < R1_PER_SIDE; i++) {
    const fromX = cardInnerX(side, 0);
    const elbowX = fromX + dir * elbowOffset;
    const topY = r1TopSlotCenter(i);
    const botY = r1BotSlotCenter(i);
    const centerY = r1MatchCenter(i);

    add(`${side}-r1-top-${i}`, fromX, topY, elbowX, topY);
    add(`${side}-r1-bot-${i}`, fromX, botY, elbowX, botY);
    add(`${side}-r1-vert-${i}`, elbowX, topY, elbowX, botY);
    add(`${side}-r1-out-${i}`, elbowX, centerY, cardOuterX(side, 1), centerY);
  }

  for (let i = 0; i < 2; i++) {
    const fromX = cardInnerX(side, 1);
    const elbowX = fromX + dir * elbowOffset;
    const topY = r2TopSlotCenter(i);
    const botY = r2BotSlotCenter(i);
    const centerY = r2MatchCenter(i);

    add(`${side}-r2-top-${i}`, fromX, topY, elbowX, topY);
    add(`${side}-r2-bot-${i}`, fromX, botY, elbowX, botY);
    add(`${side}-r2-vert-${i}`, elbowX, topY, elbowX, botY);
    add(`${side}-r2-out-${i}`, elbowX, centerY, cardOuterX(side, 2), centerY);
  }

  {
    const fromX = cardInnerX(side, 2);
    const elbowX = fromX + dir * elbowOffset;
    const topY = r3TopSlotCenter();
    const botY = r3BotSlotCenter();
    const centerY = r3MatchCenter();

    add(`${side}-r3-top`, fromX, topY, elbowX, topY);
    add(`${side}-r3-bot`, fromX, botY, elbowX, botY);
    add(`${side}-r3-vert`, elbowX, topY, elbowX, botY);
    add(`${side}-r3-out`, elbowX, centerY, trophyEntryX(side), centerY);
  }

  return <g key={`${side}-conn`}>{lines}</g>;
}

function TrophyIcon() {
  return (
    <g aria-hidden fill="url(#goldGradient)">
      <path d="M10 6 C2 6, 2 18, 12 18 L12 14 C7 14, 7 10, 10 10 Z" />
      <path d="M34 6 C42 6, 42 18, 32 18 L32 14 C37 14, 37 10, 34 10 Z" />
      <path d="M10 4 H34 V14 C34 22, 28 28, 22 28 C16 28, 10 22, 10 14 Z" />
      <rect x={19.5} y={28} width={5} height={6} />
      <rect x={14} y={34} width={16} height={4} rx={1} />
      <rect x={11} y={40} width={22} height={5} rx={1.5} />
    </g>
  );
}
