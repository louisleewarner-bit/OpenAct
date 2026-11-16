import type { ReactNode } from 'react';

/**
 * Line drawings for the start page (D-047). One style throughout: round caps and joins, an ink line in three weights
 * (contour 2.4, structure 1.5, detail 1), and the blue accent on the one part that is the subject. Light is from the
 * top left, so shadows fall to the lower right and highlights sit on the upper left.
 */
const W1 = 2.4;
const W2 = 1.5;
const W3 = 1;

const Frame = ({ children, size = 56 }: { children: ReactNode; size?: number }) => (
  <svg className="art" viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

const A = 'var(--accent)';
const TINT = 'var(--tint-blue)';

/** A small drawing for each group of formats. */
export function GroupArt({ group, size }: { group: string; size?: number }) {
  switch (group) {
    case 'Film':
      return (
        <Frame size={size}>
          <rect x="9" y="27" width="46" height="27" rx="3" strokeWidth={W1} fill="var(--paper)" />
          <path d="M9 27 L13 14 L55 20 L55 27" strokeWidth={W1} fill={TINT} />
          <path d="M20 16 L16 27 M31 17.2 L27 27 M42 18.4 L38 27" strokeWidth={W2} />
          <path d="M16 36 H48 M16 43 H38" strokeWidth={W3} />
          <circle cx="14" cy="14" r="1.6" fill="currentColor" stroke="none" />
        </Frame>
      );
    case 'Television':
      return (
        <Frame size={size}>
          <path d="M26 21 L18 10 M38 21 L46 10" strokeWidth={W2} />
          <rect x="8" y="21" width="48" height="31" rx="5" strokeWidth={W1} fill="var(--paper)" />
          <rect x="13" y="26" width="30" height="21" rx="2.5" strokeWidth={W2} fill={TINT} />
          <circle cx="50" cy="31" r="1.8" strokeWidth={W2} />
          <circle cx="50" cy="39" r="1.8" strokeWidth={W2} />
          <path d="M18 52 V56 M46 52 V56" strokeWidth={W2} />
          <path d="M17 32 L22 29" strokeWidth={W3} />
        </Frame>
      );
    case 'Theatre':
      return (
        <Frame size={size}>
          <path d="M8 10 H56" strokeWidth={W1} />
          <path d="M10 10 C10 28 21 36 20 54 L9 54 Z" strokeWidth={W1} fill={TINT} />
          <path d="M54 10 C54 28 43 36 44 54 L55 54 Z" strokeWidth={W1} fill={TINT} />
          <path d="M14 14 C14 26 18 34 17 48 M50 14 C50 26 46 34 47 48" strokeWidth={W3} />
          <path d="M24 54 H40" strokeWidth={W2} />
          <path d="M32 24 L34 29 L39.5 29.6 L35.4 33.2 L36.6 38.6 L32 35.8 L27.4 38.6 L28.6 33.2 L24.5 29.6 L30 29 Z" strokeWidth={W2} fill={A} stroke={A} />
        </Frame>
      );
    case 'Audio':
      return (
        <Frame size={size}>
          <rect x="24" y="7" width="16" height="28" rx="8" strokeWidth={W1} fill={TINT} />
          <path d="M24 17 H40 M24 22 H40 M24 27 H40" strokeWidth={W3} />
          <path d="M16 29 C16 41 23 46 32 46 C41 46 48 41 48 29" strokeWidth={W1} />
          <path d="M32 46 V56 M23 56 H41" strokeWidth={W1} />
        </Frame>
      );
    case 'Games':
      return (
        <Frame size={size}>
          <path d="M15 22 H49 C57 22 60 33 58 43 C56 51 50 51 46 45 L43 40 H21 L18 45 C14 51 8 51 6 43 C4 33 7 22 15 22 Z" strokeWidth={W1} fill="var(--paper)" />
          <path d="M18 27 V37 M13 32 H23" strokeWidth={W1} />
          <circle cx="45" cy="29" r="2.4" strokeWidth={W2} fill={A} stroke={A} />
          <circle cx="51" cy="34" r="2.4" strokeWidth={W2} />
          <path d="M28 31 H29 M35 31 H36" strokeWidth={W1} />
        </Frame>
      );
    case 'Comics':
      return (
        <Frame size={size}>
          <path d="M13 12 H51 A5 5 0 0 1 56 17 V36 A5 5 0 0 1 51 41 H36 L23 53 V41 H13 A5 5 0 0 1 8 36 V17 A5 5 0 0 1 13 12 Z" strokeWidth={W1} fill="var(--paper)" />
          <path d="M31 17 L33.4 23.2 L40 23.8 L35 28.2 L36.6 34.6 L31 31.2 L25.4 34.6 L27 28.2 L22 23.8 L28.6 23.2 Z" strokeWidth={W2} fill={TINT} />
          <path d="M14 20 H18 M46 31 H50" strokeWidth={W3} />
        </Frame>
      );
    case 'Documents':
      return (
        <Frame size={size}>
          <path d="M20 12 H44 V50" strokeWidth={W2} />
          <path d="M14 18 H38 L47 27 V56 H14 Z" strokeWidth={W1} fill="var(--paper)" />
          <path d="M38 18 V27 H47" strokeWidth={W2} fill={TINT} />
          <path d="M20 35 H41 M20 41 H41 M20 47 H33" strokeWidth={W3} />
        </Frame>
      );
    case 'Blank':
      return (
        <Frame size={size}>
          <path d="M12 8 H36 L46 18 V54 H12 Z" strokeWidth={W1} fill="var(--paper)" />
          <path d="M36 8 V18 H46" strokeWidth={W2} fill={TINT} />
          <path d="M44 44 L56 24 L61 27 L49 47 L42 50 Z" strokeWidth={W2} fill={A} stroke="currentColor" />
          <path d="M18 28 H32 M18 34 H28" strokeWidth={W3} />
        </Frame>
      );
    default:
      // Samples
      return (
        <Frame size={size}>
          <path d="M32 8 L37 24 L54 26 L41 37 L45 54 L32 45 L19 54 L23 37 L10 26 L27 24 Z" strokeWidth={W1} fill={TINT} />
          <path d="M26 20 L30 14" strokeWidth={W3} />
        </Frame>
      );
  }
}

/** The big drawing beside the headline: a script page under a soft light, a pencil, and a strip of stage tape. */
export function HeroArt() {
  const line = (y: number, w: number, x = 0) => <path d={`M${60 + x} ${y} H${60 + x + w}`} strokeWidth={W3} />;
  return (
    <svg className="hero-art" viewBox="0 0 420 320" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="A script page with a pencil beside it and a strip of stage tape on the floor">
      <defs>
        <radialGradient id="ha-light" cx="0.08" cy="0.02" r="0.9">
          <stop offset="0" style={{ stopColor: '#fff', stopOpacity: 'var(--hero-light, 0.55)' }} />
          <stop offset="1" style={{ stopColor: '#fff', stopOpacity: 0 }} />
        </radialGradient>
        <filter id="ha-soft" x="-20%" y="-20%" width="140%" height="150%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="ha-contact" x="-20%" y="-20%" width="140%" height="150%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>
      {/* the floor line, and the tape: an L of two strips, the lower deeper (the OpenAct mark) */}
      <path d="M18 286 H402" strokeWidth={W3} opacity="0.5" />
      <g stroke="none">
        <polygon points="40,206 56,202 56,262 40,262" fill="#223C86" opacity="0.92" />
        <polygon points="40,266 120,266 116,282 40,282" fill="#2D4DA6" />
      </g>
      {/* the page: shadow first (down and to the right), then the sheet */}
      <g transform="rotate(-3 215 150)">
        <rect x="108" y="40" width="222" height="262" rx="4" fill="#1B2B5E" opacity="0.28" filter="url(#ha-soft)" transform="translate(14 20)" stroke="none" />
        <rect x="108" y="40" width="222" height="262" rx="4" fill="#1B2B5E" opacity="0.35" filter="url(#ha-contact)" transform="translate(4 6)" stroke="none" />
        <rect x="108" y="40" width="222" height="262" rx="4" strokeWidth={W1} fill="var(--paper)" />
        <rect x="108" y="40" width="222" height="262" rx="4" fill="url(#ha-light)" stroke="none" />
        <g transform="translate(48 0)">
          <path d="M146 74 H236" strokeWidth={W2} />
          {line(100, 60, 86)}
          {line(120, 118, 26)}
          {line(130, 96, 26)}
          {line(158, 52, 92)}
          <path d="M112 176 H198" strokeWidth={W3} />
          <path d="M112 188 H176" strokeWidth={W3} />
          {line(214, 64, 82)}
          <path d="M112 232 H206" strokeWidth={W3} />
          <path d="M112 244 H190" strokeWidth={W3} />
        </g>
        {/* the one bright thing: a character name and a line being written, with a caret */}
        <rect x="180" y="205" width="120" height="14" rx="3" fill="var(--tint-blue)" stroke="none" />
        <path d="M188 212 H252" stroke="var(--accent)" strokeWidth={W1} />
        <path d="M257 206 V218" stroke="var(--accent)" strokeWidth={W1} />
        <path d="M134 62 H176" strokeWidth={W1} />
      </g>
      {/* the pencil, across the lower right */}
      <g transform="rotate(-24 330 262)">
        <rect x="244" y="252" width="150" height="17" rx="2" fill="#000" opacity="0.2" filter="url(#ha-contact)" transform="translate(6 10)" stroke="none" />
        <path d="M244 252 H378 V269 H244 Z" strokeWidth={W1} fill="var(--tint-gold)" />
        <path d="M244 258.5 H378 M244 263 H378" strokeWidth={W3} opacity="0.55" />
        <path d="M244 252 L214 260.5 L244 269" strokeWidth={W1} fill="var(--paper)" />
        <path d="M228 256.4 L214 260.5 L228 264.6" strokeWidth={W1} fill="currentColor" />
        <path d="M378 252 H398 A3 3 0 0 1 401 255 V266 A3 3 0 0 1 398 269 H378" strokeWidth={W1} fill="var(--accent)" stroke="currentColor" />
        <path d="M378 252 V269" strokeWidth={W2} />
      </g>
    </svg>
  );
}
