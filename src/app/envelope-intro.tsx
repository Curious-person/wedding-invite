"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { preload } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

/** Background music — YouTube video embedded invisibly, started after the envelope sequence ends. */
const YT_VIDEO_ID = "08A31NkT-Og";
const YT_EMBED_SRC = `https://www.youtube.com/embed/${YT_VIDEO_ID}?si=Kq0CeSZU4xLGANfC&enablejsapi=1&controls=0&disablekb=1&fs=0&loop=1&playlist=${YT_VIDEO_ID}&playsinline=1&rel=0`;
const MUSIC_TITLE = "Dahil Sa Iyo — Piano Cover";
const MUSIC_FADE_MS = 3_000;
const MUSIC_TARGET_VOLUME = 70;

type Phase = "initial" | "hint" | "playing";

/**
 * Full-screen envelope intro. Plays once per page load; once finished it unmounts the player so
 * nothing invisible is left blocking the page, fades in the looping background music, and reveals
 * a sticky spinning album disc in the bottom-right corner.
 */
export default function EnvelopeIntro() {
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);
  const ytRef = useRef<HTMLIFrameElement>(null);
  const discRef = useRef<SVGSVGElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const spinTweenRef = useRef<gsap.core.Tween | null>(null);
  const fadeTimerRef = useRef<number | null>(null);

  const ytCommand = useCallback((func: string, args: unknown[] = []) => {
    ytRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "https://www.youtube.com",
    );
  }, []);

  /** Prime the iframe during the user's click gesture so mobile browsers allow playback once the intro ends. */
  const primeAudio = useCallback(() => {
    ytCommand("mute");
    ytCommand("setVolume", [0]);
    ytCommand("playVideo");
    ytCommand("pauseVideo");
  }, [ytCommand]);

  const handleDone = useCallback(() => setDone(true), []);

  // Once the envelope sequence finishes, start the track at volume 0 and smoothly fade it in.
  useEffect(() => {
    if (!done) return;
    ytCommand("unMute");
    ytCommand("setVolume", [0]);
    ytCommand("seekTo", [0, true]);
    ytCommand("playVideo");

    const start = performance.now();
    const timer = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - start) / MUSIC_FADE_MS);
      ytCommand("setVolume", [Math.round(progress * MUSIC_TARGET_VOLUME)]);
      if (progress >= 1) {
        window.clearInterval(timer);
        fadeTimerRef.current = null;
      }
    }, 60);
    fadeTimerRef.current = timer;

    return () => {
      window.clearInterval(timer);
      fadeTimerRef.current = null;
    };
  }, [done, ytCommand]);

  // GSAP entrance + scroll-triggered fade-in animations for homepage elements once the intro finishes.
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const heroItems = gsap.utils.toArray<HTMLElement>('[data-gsap="hero"]');
      const sections = gsap.utils.toArray<HTMLElement>('[data-gsap="section"]');

      if (!done) {
        // Keep hero & sections poised in their initial hidden state while the envelope overlay is active.
        gsap.set(heroItems, { autoAlpha: 0, y: 24 });
        sections.forEach((section) => {
          const items = section.querySelectorAll<HTMLElement>('[data-gsap="item"]');
          gsap.set(items.length ? items : section, { autoAlpha: 0, y: 36 });
        });
        return;
      }

      // 1. Staggered reveal of the Hero elements right as the envelope finishes fading out.
      if (heroItems.length) {
        gsap.fromTo(
          heroItems,
          { autoAlpha: 0, y: 24, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.05,
            stagger: 0.12,
            ease: "power3.out",
            clearProps: "transform",
          },
        );
      }

      // 2. Scroll-triggered smooth fade-up for each details section as the viewer arrives at it.
      sections.forEach((section) => {
        const items = section.querySelectorAll<HTMLElement>('[data-gsap="item"]');
        const targets = items.length ? items : [section];

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.95,
            stagger: 0.14,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              end: "bottom 18%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [done]);
  // GSAP infinite spinning animation on the album disc once the intro finishes.
  useEffect(() => {
    if (!done || !discRef.current) return;
    const tween = gsap.to(discRef.current, {
      rotation: 360,
      duration: 6,
      ease: "none",
      repeat: -1,
    });
    spinTweenRef.current = tween;
    return () => {
      tween.kill();
      spinTweenRef.current = null;
    };
  }, [done]);

  // Pause or resume both the YouTube playback and the GSAP disc spin when toggled.
  const toggleMusic = useCallback(() => {
    setPaused((prev) => {
      const nextPaused = !prev;
      if (nextPaused) {
        if (fadeTimerRef.current !== null) {
          window.clearInterval(fadeTimerRef.current);
          fadeTimerRef.current = null;
        }
        ytCommand("pauseVideo");
        spinTweenRef.current?.pause();
      } else {
        ytCommand("setVolume", [MUSIC_TARGET_VOLUME]);
        ytCommand("playVideo");
        spinTweenRef.current?.play();
      }
      return nextPaused;
    });
  }, [ytCommand]);

  const showLabel = useCallback(() => {
    if (!labelRef.current) return;
    gsap.to(labelRef.current, {
      autoAlpha: 1,
      x: 0,
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  }, []);

  const hideLabel = useCallback(() => {
    if (!labelRef.current) return;
    gsap.to(labelRef.current, {
      autoAlpha: 0,
      x: 8,
      duration: 0.2,
      ease: "power2.in",
      overwrite: "auto",
    });
  }, []);

  return (
    <>
      <iframe
        ref={ytRef}
        width="560"
        height="315"
        src={YT_EMBED_SRC}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-0 -z-10 size-px border-0 opacity-0"
      />
      {done ? (
        <div className="fixed right-[calc(28*var(--px))] bottom-[calc(28*var(--px))] z-50 flex items-center gap-[calc(12*var(--px))]">
          <span
            ref={labelRef}
            role="tooltip"
            style={{ opacity: 0, visibility: "hidden", transform: "translateX(8px)" }}
            className="pointer-events-none whitespace-nowrap rounded-full border border-gold/60 bg-[#f3eee2]/95 px-[calc(16*var(--px))] py-[calc(8*var(--px))] font-narrow [font-stretch:condensed] uppercase tracking-[0.1em] text-ink text-[length:max(12px,calc(16*var(--px)))] shadow-[0_calc(4*var(--px))_calc(12*var(--px))_rgba(0,0,0,0.18)] backdrop-blur-sm"
          >
            {MUSIC_TITLE}
            {paused ? " (Paused)" : ""}
          </span>

          <button
            type="button"
            onClick={toggleMusic}
            onMouseEnter={showLabel}
            onMouseLeave={hideLabel}
            onFocus={showLabel}
            onBlur={hideLabel}
            aria-label={paused ? `Play ${MUSIC_TITLE}` : `Pause ${MUSIC_TITLE}`}
            aria-pressed={!paused}
            className="group relative flex size-[length:max(48px,calc(64*var(--px)))] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 transition-transform hover:scale-105 focus-visible:outline-[calc(2*var(--px))] focus-visible:outline-offset-[calc(4*var(--px))] focus-visible:outline-gold"
          >
            <svg
              ref={discRef}
              viewBox="0 0 100 100"
              aria-hidden
              className="size-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
            >
              <defs>
                <radialGradient id="vinyl-sheen" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#3a3530" />
                  <stop offset="45%" stopColor="#1d1a17" />
                  <stop offset="100%" stopColor="#0f0d0c" />
                </radialGradient>
              </defs>
              {/* Outer gold rim + vinyl body */}
              <circle cx="50" cy="50" r="48" fill="url(#vinyl-sheen)" stroke="#d4af37" strokeWidth="2" />
              {/* Vinyl grooves */}
              <circle cx="50" cy="50" r="41" fill="none" stroke="#d4af37" strokeOpacity="0.22" strokeWidth="0.8" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="0.7" />
              <circle cx="50" cy="50" r="29" fill="none" stroke="#d4af37" strokeOpacity="0.25" strokeWidth="0.8" />
              {/* Diagonal highlight arcs so rotation is clearly visible */}
              <path
                d="M 50 10 A 40 40 0 0 1 86 32"
                fill="none"
                stroke="#f3eee2"
                strokeOpacity="0.35"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M 50 90 A 40 40 0 0 1 14 68"
                fill="none"
                stroke="#f3eee2"
                strokeOpacity="0.35"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Center gold/ivory album label with N&E */}
              <circle cx="50" cy="50" r="19" fill="#f3eee2" stroke="#d4af37" strokeWidth="2" />
              <text
                x="50"
                y="47"
                textAnchor="middle"
                fill="#d4af37"
                fontSize="11"
                fontFamily="var(--font-parisienne), serif"
              >
                N &amp; E
              </text>
              {/* Center spindle hole */}
              <circle cx="50" cy="56" r="3" fill="#1d1a17" stroke="#d4af37" strokeWidth="1" />
            </svg>
          </button>
        </div>
      ) : (
        <IntroPlayer onInteract={primeAudio} onDone={handleDone} />
      )}
    </>
  );
}

function IntroPlayer({ onInteract, onDone }: { onInteract: () => void; onDone: () => void }) {
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
    onInteract();
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
