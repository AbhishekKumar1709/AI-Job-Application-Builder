const SCREEN_W = 280;
const SCREEN_H = 172;
const BASE_D = 168;

// Real result from running our actual ATS-check feature (Gemini-powered)
// against one fixed, generic sample resume — not an invented statistic.
// See CHANGELOG.md for how this number was produced.
const SAMPLE_ATS_SCORE = 94;

const NAV_ITEMS = [
  { label: "Dashboard", active: false },
  { label: "Resume", active: true },
  { label: "Cover letter", active: false },
  { label: "ATS check", active: false },
  { label: "Applications", active: false },
];

function AtsGauge({ score, size = 56 }: { score: number; size?: number }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--icon-green-text)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fontWeight="600"
        fill="var(--foreground)"
      >
        {score}
      </text>
    </svg>
  );
}

export function HeroLaptop() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        aria-hidden="true"
        className="hero-laptop-scene flex h-[300px] w-full items-center justify-center"
      >
        <div
          className="hero-laptop-rotator relative"
          style={{ width: SCREEN_W, height: SCREEN_H + BASE_D }}
        >
          {/* Screen */}
          <div
            className="hero-laptop-part absolute left-0 top-0"
            style={{
              width: SCREEN_W,
              height: SCREEN_H,
              transformOrigin: "bottom center",
              transform: "rotateX(12deg)",
            }}
          >
            {/* bezel + front face */}
            <div
              className="hero-laptop-face absolute inset-0 rounded-t-xl bg-neutral-800 p-[7px] shadow-lg"
              style={{ transform: "translateZ(0.5px)" }}
            >
              <div className="absolute left-1/2 top-1 h-1 w-1 -translate-x-1/2 rounded-full bg-neutral-600" />
              <div className="flex h-full overflow-hidden rounded-[3px] bg-surface">
                {/* sidebar */}
                <div className="flex w-14 flex-col gap-1.5 border-r border-border bg-background px-2 py-3">
                  {NAV_ITEMS.map((item) => (
                    <span
                      key={item.label}
                      className={`h-2 rounded-full ${item.active ? "bg-icon-purple-text" : "bg-border"}`}
                      style={{ width: item.active ? "100%" : "70%" }}
                    />
                  ))}
                </div>
                {/* main content */}
                <div className="flex-1 p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-border" />
                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 w-3/5 rounded bg-border" />
                      <div className="h-1 w-2/5 rounded bg-border/70" />
                    </div>
                  </div>
                  <div className="mt-2.5 space-y-1">
                    <div className="h-1 w-1/3 rounded bg-icon-purple-text/40" />
                    <div className="h-1 w-full rounded bg-border/70" />
                    <div className="h-1 w-5/6 rounded bg-border/70" />
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="h-1 w-1/3 rounded bg-icon-purple-text/40" />
                    <div className="h-1 w-full rounded bg-border/70" />
                    <div className="h-1 w-2/3 rounded bg-border/70" />
                  </div>
                </div>
                {/* ATS panel */}
                <div className="flex w-16 flex-col items-center justify-center gap-1 border-l border-border bg-background px-1.5">
                  <AtsGauge score={SAMPLE_ATS_SCORE} size={40} />
                  <span className="text-center text-[6px] leading-tight text-muted">
                    ATS Score
                  </span>
                </div>
              </div>
            </div>
            {/* back of the lid */}
            <div
              className="hero-laptop-face absolute inset-0 rounded-t-xl bg-neutral-300 dark:bg-neutral-700"
              style={{ transform: "rotateY(180deg) translateZ(0.5px)" }}
            />
          </div>

          {/* Keyboard base */}
          <div
            className="hero-laptop-part absolute left-0"
            style={{
              top: SCREEN_H,
              width: SCREEN_W,
              height: BASE_D,
              transformOrigin: "top center",
              transform: "rotateX(80deg)",
            }}
          >
            <div
              className="hero-laptop-face absolute inset-0 rounded-b-xl bg-gradient-to-b from-neutral-200 to-neutral-400 dark:from-neutral-600 dark:to-neutral-800"
              style={{ transform: "translateZ(0.5px)" }}
            >
              <div className="flex h-full flex-col items-center justify-start gap-1 px-5 pt-2.5">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="flex gap-[3px]">
                    {Array.from({ length: 11 }).map((_, i) => (
                      <span key={i} className="h-1.5 w-3.5 rounded-[1.5px] bg-neutral-400/70 dark:bg-neutral-900/60" />
                    ))}
                  </div>
                ))}
                <span className="mt-2 h-6 w-14 rounded-sm border border-neutral-400/70 dark:border-neutral-900/60" />
              </div>
            </div>
            <div
              className="hero-laptop-face absolute inset-0 rounded-b-xl bg-neutral-300 dark:bg-neutral-700"
              style={{ transform: "rotateX(180deg) translateZ(0.5px)" }}
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -left-2 top-6 hidden rounded-xl border border-border bg-surface px-3 py-2 shadow-md sm:block">
        <p className="text-[10px] text-muted">ATS Score (example result)</p>
        <p className="text-lg font-semibold text-icon-green-text">{SAMPLE_ATS_SCORE}%</p>
      </div>
    </div>
  );
}
