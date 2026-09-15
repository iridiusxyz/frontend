/**
 * A deterministic starfield for dark hero areas. It is seeded, so the server and the client draw
 * the same sky, and a share of the stars twinkle slightly out of step with one another.
 */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const W = 1600;
const H = 900;

export function Firmament({ seed = 7, density = 90, className = "" }: { seed?: number; density?: number; className?: string }) {
  const rnd = seeded(seed);
  const stars = Array.from({ length: density }, (_, i) => ({
    x: Math.round(rnd() * W),
    y: Math.round(rnd() * H),
    r: 0.4 + rnd() * 1.1,
    o: 0.2 + rnd() * 0.6,
    k: i % 3,
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={s.k === 0 ? "#d3e6fc" : "#f3f7fb"}
          opacity={s.o}
          className={s.k === 0 ? "star" : s.k === 1 ? "star-2" : undefined}
        />
      ))}
    </svg>
  );
}
