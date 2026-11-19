import Image from "next/image";
import EnvelopeIntro from "./envelope-intro";

/** Shared style for the small uppercase Arial Narrow labels (24px, #525252). */
const label =
  "whitespace-nowrap font-narrow [font-stretch:condensed] uppercase leading-normal text-ink text-[calc(24*var(--px))] max-md:text-[calc(20*var(--px))]";

/** Shared style for the Parisienne script names (#d4af37). */
const script =
  "absolute m-0 whitespace-nowrap font-script font-normal leading-normal text-gold max-md:static max-md:leading-[1.05]";

/** Section title — Parisienne, gold, centered (in-flow counterpart of `script`). */
const heading =
  "m-0 text-center font-script font-normal leading-[1.1] text-gold text-[calc(112*var(--px))] max-md:text-[calc(76*var(--px))]";

/** Sub-section script title (e.g. "Direction", "Entourage"). */
const subheading =
  "m-0 text-center font-script font-normal leading-[1.1] text-gold text-[calc(72*var(--px))]";

/** Bold uppercase Arial Narrow — same style as the hero venue line. */
const title = `${label} m-0 font-bold`;

/** Wrapping Arial Narrow body copy (20px, #525252). */
const body =
  "m-0 font-narrow [font-stretch:condensed] leading-[1.4] text-ink text-[calc(20*var(--px))] max-md:text-[calc(22*var(--px))]";

/** Uppercase variant of `body` for short informational copy. */
const bodyCaps = `${body} uppercase`;

/** Primary button — ink fill, ivory text, gold on hover. */
const button =
  "inline-flex items-center justify-center rounded-[calc(8*var(--px))] bg-ink px-[calc(40*var(--px))] py-[calc(16*var(--px))] font-narrow [font-stretch:condensed] font-bold uppercase tracking-[0.08em] text-[#f3eee2] text-[calc(20*var(--px))] transition-colors hover:bg-gold hover:text-ink focus-visible:outline-[calc(2*var(--px))] focus-visible:outline-offset-[calc(4*var(--px))] focus-visible:outline-gold";

const VENUE = "Transfiguration of Christ Parish Church";

const timeline = [
  {
    time: "4.00 PM",
    title: "Ceremony Begins",
    text: "Join us as we begin our forever with a heartfelt wedding ceremony surrounded by love and family.",
  },
  {
    time: "5.00 PM",
    title: "Cocktail Hour",
    text: "Enjoy a delightful cocktail hour filled with signature drinks, light bites, and warm conversations.",
  },
  {
    time: "6.30 PM",
    title: "Dinner Service",
    text: "A carefully curated dinner experience awaits as we celebrate this special evening together.",
  },
  {
    time: "7.30 PM",
    title: "Celebration & Dance",
    text: "Let the music play and the celebration begin — dance the night away with us under the stars.",
  },
];

/** Dress-code tones, shown as two overlapping pairs. */
const dressTones = [
  [
    { name: "Deep red", hex: "#a8141e" },
    { name: "Blush pink", hex: "#f08a8f" },
  ],
  [
    { name: "Black", hex: "#111111" },
    { name: "Marigold", hex: "#f0c061" },
  ],
];

const entourage = [
  { role: "Best Man", names: "Michael Smith, John Storm, Andreas Lucky" },
  { role: "Bridesmaids", names: "Emily Brown, Luce Anderson, Zara Witney" },
  { role: "Groomsmen", names: "Christian Jake, Atony" },
  { role: "Flower Girl", names: "Lily Taylor" },
];

export default function Home() {
  return (
    <main className="relative w-full">
      {/* Full-screen envelope intro — overlays the already-rendered page, plays once per load. */}
      <EnvelopeIntro />

      {/* ───────────────────────── Hero ───────────────────────── */}
      <header className="relative flex h-dvh w-full items-center justify-center overflow-hidden max-md:h-auto max-md:min-h-dvh">
        {/* Letterbox fill so non-1440×1024 viewports blend with the wallpaper */}
        <Image
          src="/images/damask-wallpaper.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover mask-b-from-70% mask-b-to-transparent"
        />

        {/* Figma frame "Desktop - 1" (1:2) — 1440 × 1024. On mobile it reflows into a centered column. */}
        <section
          aria-label="Wedding invitation"
          className="relative h-[calc(1024*var(--px))] w-[calc(1440*var(--px))] shrink-0 overflow-hidden max-md:flex max-md:h-auto max-md:min-h-dvh max-md:w-full max-md:flex-col max-md:items-center max-md:justify-center max-md:gap-[calc(28*var(--px))] max-md:px-[calc(32*var(--px))] max-md:py-[calc(72*var(--px))]"
        >
          {/* 3:2 Elegant Ivory Floral Damask Wallpaper — 1819 × 1024, centered */}
          <div className="absolute top-0 left-[calc(50%-0.5*var(--px))] h-[calc(1024*var(--px))] w-[calc(1819*var(--px))] -translate-x-1/2 max-md:hidden">
            <Image
              src="/images/damask-wallpaper.png"
              alt=""
              fill
              priority
              sizes="(min-width: 1440px) 1819px, 126vw"
              className="pointer-events-none object-cover mask-b-from-70% mask-b-to-transparent"
            />
          </div>

          {/* 4:16 You are invited */}
          <p data-gsap="hero" className={`${label} absolute top-[calc(72*var(--px))] left-[calc(50%+0.5*var(--px))] -translate-x-1/2 text-center max-md:static max-md:translate-x-0`}>
            You are cordially invited
          </p>

          {/* 3:9 Noli · 10:36 & · 10:35 Eling — stacked monogram-style on mobile */}
          <h1 aria-label="Noli & Eling" className="m-0 max-md:flex max-md:w-full max-md:max-w-[calc(400*var(--px))] max-md:flex-col max-md:items-center">
            <span data-gsap="hero" aria-hidden className={`${script} top-[calc(114*var(--px))] left-[calc(146*var(--px))] text-[calc(257*var(--px))] max-md:self-start max-md:text-[calc(170*var(--px))]`}>
              Noli
            </span>
            <span data-gsap="hero" aria-hidden className={`${script} top-[calc(225*var(--px))] left-[calc(658*var(--px))] text-[calc(128*var(--px))] max-md:-my-[calc(28*var(--px))] max-md:text-[calc(90*var(--px))]`}>
              &amp;
            </span>
            <span data-gsap="hero" aria-hidden className={`${script} top-[calc(114*var(--px))] left-[calc(796*var(--px))] text-[calc(257*var(--px))] max-md:self-end max-md:text-[calc(170*var(--px))]`}>
              Eling
            </span>
          </h1>

          {/* Portraits — absolutely positioned on desktop (wrapper is `display: contents`), side by side on mobile */}
          <div className="contents max-md:flex max-md:items-center max-md:justify-center max-md:gap-[calc(18*var(--px))]">
            {/* 10:37 Vintage Framed Graduation Portrait — 262 × 381 */}
            <div data-gsap="hero" className="absolute top-[calc(445*var(--px))] left-[calc(459*var(--px))] h-[calc(381*var(--px))] w-[calc(262*var(--px))] shadow-[0_calc(4*var(--px))_calc(4*var(--px))_0_rgba(0,0,0,0.25)] max-md:relative max-md:top-auto max-md:left-auto max-md:h-[calc(313*var(--px))] max-md:w-[calc(215*var(--px))]">
              <Image
                src="/images/noli-framed.png"
                alt="Framed graduation portrait of Noli"
                fill
                sizes="(max-width: 767px) 40vw, 524px"
                className="object-cover"
              />
            </div>

            {/* 10:38 Vintage Framed Portrait of a Young Woman — 240 × 373, r30 */}
            <div data-gsap="hero" className="absolute top-[calc(449*var(--px))] left-[calc(741*var(--px))] h-[calc(373*var(--px))] w-[calc(240*var(--px))] rounded-[calc(30*var(--px))] shadow-[0_calc(4*var(--px))_calc(4*var(--px))_0_rgba(0,0,0,0.25)] max-md:relative max-md:top-auto max-md:left-auto max-md:h-[calc(306*var(--px))] max-md:w-[calc(197*var(--px))]">
              <div className="absolute inset-0 overflow-hidden rounded-[calc(30*var(--px))]">
                <div className="absolute top-[-1.17%] left-[-1.67%] h-[102.33%] w-[101.67%]">
                  <Image
                    src="/images/eling-framed.png"
                    alt="Framed portrait of Eling"
                    fill
                    sizes="(max-width: 767px) 40vw, 488px"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3:15 Venue (Arial Narrow Bold) */}
          <p data-gsap="hero" className={`${label} absolute top-[calc(872*var(--px))] left-[calc(50%+2*var(--px))] -translate-x-1/2 text-center font-bold max-md:static max-md:translate-x-0 max-md:whitespace-normal`}>
            {VENUE}
          </p>

          {/* 10:40 Date • Time */}
          <div data-gsap="hero" className="absolute top-[calc(912*var(--px))] left-[calc(50%+2*var(--px))] flex -translate-x-1/2 items-center justify-center gap-[calc(16*var(--px))] max-md:static max-md:-mt-[calc(16*var(--px))] max-md:translate-x-0 max-md:flex-wrap max-md:gap-x-[calc(12*var(--px))] max-md:gap-y-[calc(4*var(--px))]">
            <p className={`${label} m-0 shrink-0`}>
              <time dateTime="12-12">12/12</time>
            </p>
            <div className="relative size-[calc(9*var(--px))] shrink-0">
              <Image src="/images/dot.svg" alt="" width={9} height={9} className="block size-full max-w-none" />
            </div>
            <p className={`${label} m-0 shrink-0`}>
              <time dateTime="07:00">7:00 AM</time>
            </p>
            <div className="relative size-[calc(9*var(--px))] shrink-0">
              <Image src="/images/dot.svg" alt="" width={9} height={9} className="block size-full max-w-none" />
            </div>
            <p className={`${label} m-0 shrink-0`}>
              <time dateTime="September">Saturday</time>
            </p>
            <div className="relative size-[calc(9*var(--px))] shrink-0">
              <Image src="/images/dot.svg" alt="" width={9} height={9} className="block size-full max-w-none" />
            </div>
            <p className={`${label} m-0 shrink-0`}>
              <time dateTime="September">Antipolo</time>
            </p>

          </div>
        </section>
      </header>

      {/* ───────────────────────── Details ───────────────────────── */}
      <div className="mx-auto w-[calc(1440*var(--px))] px-[calc(160*var(--px))] pb-[calc(160*var(--px))] max-md:w-full max-md:px-[calc(36*var(--px))] max-md:pb-[calc(140*var(--px))]">
        {/* Wedding Timeline */}
        <section data-gsap="section" aria-labelledby="timeline-title" className="pt-[calc(96*var(--px))] max-md:pt-[calc(72*var(--px))]">
          <h2 data-gsap="item" id="timeline-title" className={heading}>
            Wedding Timeline
          </h2>
          <ol className="m-0 mt-[calc(48*var(--px))] grid list-none grid-cols-2 gap-x-[calc(120*var(--px))] gap-y-[calc(64*var(--px))] p-0 max-md:grid-cols-1 max-md:gap-y-[calc(52*var(--px))]">
            {timeline.map((item) => (
              <li data-gsap="item" key={item.time} className="flex flex-col items-center gap-[calc(8*var(--px))] text-center">
                <p className="m-0 font-narrow [font-stretch:condensed] leading-normal text-ink text-[calc(44*var(--px))]">
                  {item.time}
                </p>
                <h3 className={title}>{item.title}</h3>
                <p className={`${body} max-w-[calc(460*var(--px))]`}>{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Dresscode */}
        <section data-gsap="section" aria-labelledby="dresscode-title" className="flex flex-col items-center pt-[calc(140*var(--px))] max-md:pt-[calc(110*var(--px))]">
          <h2 data-gsap="item" id="dresscode-title" className={heading}>
            Dresscode
          </h2>
          <p data-gsap="item" className={`${bodyCaps} mt-[calc(24*var(--px))] max-w-[calc(420*var(--px))] text-center`}>
            Formal attire is requested.
            <br />
            Feel free to draw inspirations from these tones.
          </p>
          <ul aria-label="Suggested tones" className="m-0 mt-[calc(40*var(--px))] flex list-none gap-[calc(56*var(--px))] p-0">
            {dressTones.map((pair, i) => (
              <li data-gsap="item" key={i} className="flex">
                {pair.map((tone, j) => (
                  <span
                    key={tone.hex}
                    role="img"
                    aria-label={tone.name}
                    title={tone.name}
                    style={{ backgroundColor: tone.hex }}
                    className={`block size-[calc(88*var(--px))] rounded-full shadow-[0_calc(4*var(--px))_calc(4*var(--px))_0_rgba(0,0,0,0.25)] ${j > 0 ? "-ml-[calc(16*var(--px))]" : ""}`}
                  />
                ))}
              </li>
            ))}
          </ul>
        </section>

        {/* Venue & Direction */}
        <section data-gsap="section" aria-labelledby="direction-title" className="grid grid-cols-2 items-center gap-x-[calc(120*var(--px))] pt-[calc(160*var(--px))] max-md:grid-cols-1 max-md:gap-y-[calc(48*var(--px))] max-md:pt-[calc(110*var(--px))]">
          {/* Venue card — double gold frame (below the Direction copy on mobile) */}
          <div data-gsap="item" className="rounded-[calc(30*var(--px))] border-[calc(2*var(--px))] border-gold p-[calc(10*var(--px))] shadow-[0_calc(4*var(--px))_calc(4*var(--px))_0_rgba(0,0,0,0.25)] max-md:order-last">
            <div className="flex flex-col items-center gap-[calc(24*var(--px))] rounded-[calc(22*var(--px))] border-[calc(1*var(--px))] border-gold/60 px-[calc(32*var(--px))] py-[calc(36*var(--px))]">
              <p className={`${bodyCaps} max-w-[calc(380*var(--px))] text-center`}>
                Our celebration will take place in the heart of Napa Valley, surrounded by beautiful vineyards and
                scenic views.
              </p>
              <iframe
                title={`Map to ${VENUE}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(VENUE)}&z=15&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-[calc(260*var(--px))] w-full rounded-[calc(8*var(--px))] border-0 max-md:h-[calc(340*var(--px))]"
              />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(VENUE)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${button} w-full`}
              >
                Venue Direction
              </a>
            </div>
          </div>

          {/* Direction copy */}
          <div data-gsap="item" className="flex flex-col items-center gap-[calc(16*var(--px))] text-center">
            <h2 id="direction-title" className={subheading}>
              Direction
            </h2>
            <h3 className={`${title} mt-[calc(8*var(--px))]`}>By Car</h3>
            <p className={`${bodyCaps} max-w-[calc(400*var(--px))]`}>
              On-site parking will be available for all guests.
              <br />
              We recommend arriving a little earlier to ensure a smooth and relaxed journey to the venue.
            </p>
            <hr aria-hidden className="my-[calc(24*var(--px))] h-[calc(1*var(--px))] w-[calc(320*var(--px))] border-0 bg-gold" />
            <h3 className={title}>By Public Transportation</h3>
            <p className={`${bodyCaps} max-w-[calc(400*var(--px))]`}>
              Public transportation access to the venue may be limited.
              <br />
              Guests traveling without a car may consider using local transit services followed by a short taxi or
              rideshare trip to the location.
            </p>
          </div>
        </section>

        {/* Entourage & Gift Registry */}
        <div className="grid grid-cols-1 items-center gap-x-[calc(120*var(--px))] pt-[calc(160*var(--px))] max-md:pt-[calc(110*var(--px))]">
          <section data-gsap="section" aria-labelledby="entourage-title" className="flex flex-col items-center text-center">
            <h2 data-gsap="item" id="entourage-title" className={subheading}>
              Entourage
            </h2>
            <p data-gsap="item" className={`${bodyCaps} mt-[calc(16*var(--px))]`}>
              With the love and support
              <br />
              of those closest to us
            </p>
            <dl className="m-0 mt-[calc(40*var(--px))] flex flex-col gap-[calc(32*var(--px))]">
              {entourage.map((group) => (
                <div data-gsap="item" key={group.role} className="flex flex-col items-center gap-[calc(6*var(--px))]">
                  <dt className={title}>{group.role}</dt>
                  <dd className={`${bodyCaps} m-0`}>{group.names}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </main>
  );
}
