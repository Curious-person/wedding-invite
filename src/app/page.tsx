import Image from "next/image";

/** Shared style for the small uppercase Arial Narrow labels (24px, #525252). */
const label =
  "absolute whitespace-nowrap font-narrow [font-stretch:condensed] uppercase leading-normal text-ink text-[calc(24*var(--px))]";

export default function Home() {
  return (
    <main className="relative flex h-dvh w-screen items-center justify-center overflow-hidden">
      {/* Letterbox fill so non-1440×1024 viewports blend with the wallpaper */}
      <Image
        src="/images/damask-wallpaper.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover"
      />

      {/* Figma frame "Desktop - 1" (1:2) — 1440 × 1024 */}
      <section
        aria-label="Wedding invitation"
        className="relative h-[calc(1024*var(--px))] w-[calc(1440*var(--px))] shrink-0 overflow-hidden bg-frame"
      >
        {/* 3:2 Elegant Ivory Floral Damask Wallpaper — 1819 × 1024, centered */}
        <div className="absolute top-0 left-[calc(50%-0.5*var(--px))] h-[calc(1024*var(--px))] w-[calc(1819*var(--px))] -translate-x-1/2">
          <Image
            src="/images/damask-wallpaper.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1440px) 1819px, 126vw"
            className="pointer-events-none object-cover"
          />
        </div>

        {/* 4:16 You are invited */}
        <p className={`${label} top-[calc(72*var(--px))] left-[calc(50%+0.5*var(--px))] -translate-x-1/2 text-center`}>
          You are invited
        </p>

        {/* 3:9 NoliEling */}
        <h1 className="absolute top-[calc(128*var(--px))] left-[calc(32*var(--px))] m-0 whitespace-nowrap font-script font-normal leading-normal text-gold text-[calc(354*var(--px))]">
          NoliEling
        </h1>

        {/* 3:8 Group 1 — portraits */}
        <div className="absolute top-[calc(489*var(--px))] left-[calc(506*var(--px))] h-[calc(292*var(--px))] w-[calc(201*var(--px))]">
          <Image
            src="/images/noli.png"
            alt="Portrait of Noli"
            fill
            sizes="402px"
            className="object-cover"
          />
        </div>
        <div className="absolute top-[calc(489*var(--px))] left-[calc(747*var(--px))] h-[calc(292*var(--px))] w-[calc(187*var(--px))]">
          <Image
            src="/images/eling.png"
            alt="Portrait of Eling"
            fill
            sizes="374px"
            className="object-cover"
          />
        </div>

        {/* 3:13 Date */}
        <p className={`${label} top-[calc(619*var(--px))] left-[calc(305*var(--px))]`}>
          <time dateTime="12-12">12/12</time>
        </p>

        {/* 3:14 Time */}
        <p className={`${label} top-[calc(619*var(--px))] left-[calc(1049*var(--px))]`}>
          <time dateTime="07:00">7:00 AM</time>
        </p>

        {/* 3:15 Venue */}
        <p className={`${label} top-[calc(829*var(--px))] left-[calc(721*var(--px))] -translate-x-1/2 text-center`}>
          Transfiguration of Christ Parish Church
        </p>
      </section>
    </main>
  );
}
