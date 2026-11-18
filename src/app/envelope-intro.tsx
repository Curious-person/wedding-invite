"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { preload } from "react-dom";

/** Frame sequence in `public/images/envelope_opening/` (ezgif-frame-001.jpg … ezgif-frame-300.jpg). */
const FRAME_COUNT = 300;
const FPS = 30;
const FRAME_MS = 1000 / FPS;
/** Fade starts at this frame (1-based) and fades to full transparency over 1.5s (45 frames at 30 FPS). */
const FADE_START_FRAME = 80;
const FADE_FRAMES = Math.round(1.5 * FPS);
const END_FRAME = Math.min(FRAME_COUNT, FADE_START_FRAME + FADE_FRAMES);
const IDLE_HINT_MS = 15_000;
/** Native frame size — used for the hint's positioning box (the canvas reads naturalWidth/Height). */
const FRAME_W = 1920;
const FRAME_H = 1080;
/** Cap per-tick time so a backgrounded tab resumes where it paused instead of jumping ahead. */
const MAX_STEP_MS = 100;
/** Decode this many frames ahead of the playhead so drawImage never blocks on JPEG decoding. */
const DECODE_AHEAD = 4;

/** Letterbox fill sampled from the frames' top / middle / bottom edges, so bands blend with the shot. */
const BAND_STOPS = ["#3a2e1e", "#534327", "#33251a"] as const;

/** Numeric, zero-padded path — never relies on lexicographic sorting. */
const frameSrc = (n: number) => `/images/envelope_opening/ezgif-frame-${String(n).padStart(3, "0")}.jpg`;

type Phase = "initial" | "hint" | "playing";

/**
 * Full-screen envelope intro. Plays once per page load; once finished it unmounts the player so
 * nothing invisible is left blocking the page. No persistent storage, so a refresh shows it again.
 */
export default function EnvelopeIntro() {
  const [done, setDone] = useState(false);
  const handleDone = useCallback(() => setDone(true), []);
  return done ? null : <IntroPlayer onDone={handleDone} />;
}

function IntroPlayer({ onDone }: { onDone: () => void }) {
  // Start fetching frame 1 during SSR so the first paint of the canvas is as early as possible.
  preload(frameSrc(1), { as: "image", fetchPriority: "high" });

  const [phase, setPhase] = useState<Phase>("initial");
  const [ready, setReady] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  /** One-shot playback guard: survives re-renders, flips exactly once. */
  const startedRef = useRef(false);
  /** Bridge from the click handler into the imperative player created in the effect. */
  const playRef = useRef<() => void>(() => { });
  const pendingStartRef = useRef(false);

  // ── Imperative canvas player: preload, draw, play. Runs once per mount. ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !overlay || !ctx) {
      onDone(); // Can't render the intro — just reveal the site.
      return;
    }

    const frames: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    let disposed = false;
    let rafId = 0;
    let current: HTMLImageElement | null = null; // last successfully loaded frame on screen
    let alpha = 1;
    let bands: CanvasGradient | null = null;

    const paint = () => {
      const { width: cw, height: ch } = canvas;
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, cw, ch);
      if (alpha <= 0) return;
      // Bands + frame share one globalAlpha, so the whole layer fades as a single image.
      ctx.globalAlpha = alpha;
      if (bands) {
        ctx.fillStyle = bands;
        ctx.fillRect(0, 0, cw, ch);
      }
      if (current) {
        // "cover": preserve aspect ratio, fill the viewport, crop the overflow evenly around the center.
        const iw = current.naturalWidth;
        const ih = current.naturalHeight;
        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        ctx.drawImage(current, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      bands = ctx.createLinearGradient(0, 0, 0, h);
      BAND_STOPS.forEach((c, i) => bands!.addColorStop(i / (BAND_STOPS.length - 1), c));
      ctx.imageSmoothingQuality = "high";
      paint();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    // The canvas now owns the backdrop; drop the SSR fallback so the fade can reach full transparency.
    overlay.style.background = "transparent";

    const decode = (i: number) => {
      frames[i]?.decode().catch(() => { });
    };

    const finish = () => {
      cancelAnimationFrame(rafId);
      alpha = 0;
      paint();
      onDone();
    };

    const play = () => {
      if (disposed) return;
      let elapsed = 0;
      let last = 0;
      let shown = -1;
      const tick = (now: number) => {
        elapsed += Math.min(now - last, MAX_STEP_MS);
        last = now;
        const index = Math.floor(elapsed / FRAME_MS);
        if (index >= END_FRAME) {
          finish();
          return;
        }
        if (index !== shown) {
          shown = index;
          // A missing/failed frame simply holds the previous one.
          current = frames[index] ?? current;
          const fromEnd = END_FRAME - 1 - index;
          alpha = fromEnd < FADE_FRAMES ? fromEnd / FADE_FRAMES : 1; // reaches 0 when fade completes
          paint();
          decode(index + DECODE_AHEAD);
        }
        rafId = requestAnimationFrame(tick);
      };
      current = frames[0] ?? current;
      rafId = requestAnimationFrame((now) => {
        last = now;
        tick(now);
      });
    };
    playRef.current = play;

    // ── Preload: frame 1 first (shown immediately), then the rest in parallel. ──
    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (!disposed) frames[i] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = frameSrc(i + 1);
      });

    load(0)
      .then(() => {
        if (disposed) return;
        if (frames[0]) {
          current = frames[0];
          paint();
        }
        return Promise.all(Array.from({ length: FRAME_COUNT - 1 }, (_, k) => load(k + 1)));
      })
      .then(() => {
        if (disposed) return;
        const missing = frames.reduce((n, f) => n + (f ? 0 : 1), 0);
        if (missing === FRAME_COUNT) {
          console.warn("[EnvelopeIntro] No animation frames could be loaded; skipping intro.");
          onDone();
          return;
        }
        if (missing) console.warn(`[EnvelopeIntro] ${missing} frame(s) failed to load; holding previous frame.`);
        if (!current) {
          current = frames.find(Boolean) ?? null;
          paint();
        }
        for (let i = 0; i < DECODE_AHEAD; i++) decode(i);
        setReady(true);
        if (pendingStartRef.current) play();
      });

    // Keep the page behind from scrolling while the intro is up (no overflow toggling → no layout shift).
    const block = (e: Event) => e.preventDefault();
    overlay.addEventListener("wheel", block, { passive: false });
    overlay.addEventListener("touchmove", block, { passive: false });

    buttonRef.current?.focus({ preventScroll: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      overlay.removeEventListener("wheel", block);
      overlay.removeEventListener("touchmove", block);
      playRef.current = () => { };
      frames.length = 0;
      current = null;
    };
  }, [onDone]);

  // ── Idle hint: after 15 s in INITIAL, show "Click here". Irrelevant once playback starts. ──
  useEffect(() => {
    if (phase !== "initial") return;
    const timer = setTimeout(() => setPhase((p) => (p === "initial" ? "hint" : p)), IDLE_HINT_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const start = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setPhase("playing");
    if (ready) playRef.current();
    else pendingStartRef.current = true; // play as soon as preloading finishes
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    // Enter/Space activate the button natively. Trap Tab and keyboard scrolling while the intro covers the page.
    if (["Tab", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.key)) e.preventDefault();
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Wedding invitation intro"
      className="fixed inset-0 z-[1000] select-none overflow-hidden overscroll-none"
      // SSR/pre-hydration backdrop so page content never flashes before the canvas paints.
      style={{ background: `linear-gradient(${BAND_STOPS.join(", ")})` }}
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block size-full" />

      <button
        ref={buttonRef}
        type="button"
        onClick={start}
        onKeyDown={onKeyDown}
        aria-label="Open the invitation envelope"
        aria-disabled={phase === "playing"}
        aria-busy={phase === "playing" && !ready}
        className={`absolute inset-0 size-full appearance-none border-0 bg-transparent p-0 outline-none focus-visible:outline-[calc(3*var(--px))] focus-visible:-outline-offset-[calc(8*var(--px))] focus-visible:outline-gold ${phase === "playing" ? "cursor-default" : "cursor-pointer"}`}
      />

      {/* Box matching the contained frame, so overlays sit on the envelope at any viewport size. */}
      {(phase === "hint" || (phase === "playing" && !ready)) && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="relative"
            style={{ aspectRatio: `${FRAME_W} / ${FRAME_H}`, width: `max(100vw, calc(100dvh * ${FRAME_W / FRAME_H}))` }}
          >
            <p
              role="status"
              className="absolute top-[72%] left-1/2 m-0 -translate-x-1/2 animate-intro-hint whitespace-nowrap rounded-full bg-ink/75 px-[1.4em] py-[0.6em] font-narrow [font-stretch:condensed] uppercase tracking-[0.18em] text-[#f3eee2] text-[length:max(14px,calc(20*var(--px)))] shadow-[0_0.2em_0.8em_rgba(0,0,0,0.25)] backdrop-blur-sm motion-reduce:animate-intro-hint-reduced"
            >
              {phase === "hint" ? "Click here" : "Loading…"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
