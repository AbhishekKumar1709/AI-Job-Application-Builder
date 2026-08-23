const SCREEN_W = 240;
const SCREEN_H = 150;
const BASE_D = 150;

export function HeroLaptop() {
  return (
    <div
      aria-hidden="true"
      className="hero-laptop-scene mx-auto flex h-[260px] w-full max-w-md items-center justify-center"
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
          {/* front face */}
          <div
            className="hero-laptop-face absolute inset-0 rounded-t-md border border-border bg-surface p-3 shadow-sm"
            style={{ transform: "translateZ(0.5px)" }}
          >
            <div className="flex items-center gap-1.5 border-b border-border pb-2">
              <span className="h-2 w-2 rounded-full bg-border" />
              <span className="h-2 w-2 rounded-full bg-border" />
              <span className="h-2 w-2 rounded-full bg-border" />
              <span className="ml-2 text-[10px] text-muted">Resume builder</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-border" />
              <div className="flex-1 space-y-1">
                <div className="h-2 w-2/5 rounded bg-border" />
                <div className="h-1.5 w-1/3 rounded bg-border/70" />
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 w-1/4 rounded bg-accent/40" />
              <div className="h-1.5 w-full rounded bg-border/70" />
              <div className="h-1.5 w-5/6 rounded bg-border/70" />
            </div>
            <div className="mt-2.5 flex gap-1.5">
              <span className="h-3.5 w-10 rounded-full bg-accent/15" />
              <span className="h-3.5 w-12 rounded-full bg-accent/15" />
            </div>
          </div>
          {/* back of the lid */}
          <div
            className="hero-laptop-face absolute inset-0 rounded-t-md border border-border bg-surface"
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
            className="hero-laptop-face absolute inset-0 rounded-b-md border border-t-0 border-border bg-surface"
            style={{ transform: "translateZ(0.5px)" }}
          >
            <div className="flex h-full flex-col items-center justify-start gap-1.5 px-4 pt-3">
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className="h-2 w-4 rounded-[2px] bg-border" />
                  ))}
                </div>
              ))}
              <span className="mt-2 h-8 w-16 rounded-sm border border-border" />
            </div>
          </div>
          <div
            className="hero-laptop-face absolute inset-0 rounded-b-md border border-border bg-border/60"
            style={{ transform: "rotateX(180deg) translateZ(0.5px)" }}
          />
        </div>
      </div>
    </div>
  );
}
