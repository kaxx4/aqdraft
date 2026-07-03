// AQ Labs '26 — the exhibit's raw material.
//
// Two kinds of copy live here: the team's own words (tagline, quote,
// storyBeats, links — pulled from their Instagram carousels and CSV
// submission), and curatorial narrative (spark / tension / craft / meaning)
// written for this page, the way a gallery placard talks about a piece —
// not a spec sheet. The goal isn't to describe what each thing does; it's
// to say why someone spent six weeks of their life making it.

export type AQLabsTeam = {
  slug: string
  chapter: string
  teamName: string
  projectName: string
  category: string
  tagline: string
  oneLiner: string
  description: string
  storyBeats: string[]
  quote: string
  links: { website?: string; instagram?: string; youtube?: string }
  mood: string
  slides: number
  /** what the team actually shipped — shown as a small badge next to the category */
  medium: string
  /** which slide (1-indexed) is the cleanest hero visual — a real photo/screenshot, not a title card */
  heroSlide: number

  // ── Curatorial narrative ──────────────────────────────────────────────
  /** the moment/observation that started it — why THIS, why THEM */
  spark: string
  /** the gap or wrong in the world that made the idea necessary */
  tension: string
  /** how it actually got made — grounded in the real, unglamorous process photos */
  craft: string
  /** the closing line — what the finished thing is really saying */
  meaning: string
}

export const AQ_LABS_TEAMS: AQLabsTeam[] = [
  {
    slug: 'karyaarth',
    chapter: '01',
    teamName: 'Karyaarth',
    projectName: 'Karyaarth',
    category: 'Documentary',
    tagline: 'local log. legendary hustle.',
    oneLiner: 'A documentary series about the people who keep the city running — real vendors, real stories, no staging.',
    description: 'Karyaarth documents the lives, struggles, passion and resilience of local sellers and vendors who shape our everyday lives in ways we often overlook — from ice cream carts and tea stalls to roadside craftsmen and street performers. Every story is shot on location, with the real person in their real spot. No actors, no stock footage.',
    storyBeats: [
      'From ice cream carts to tea stalls, roadside craftsmen to street performers',
      'Not stock. Real Kolkata — shot on location, with the real person in their real spot',
      'A cart puller mid-run: the people who move a city and never get thanked',
      'Every cart has a story — the reason they show up, every single day',
    ],
    quote: 'We are about people. We are Karyaarth.',
    links: { instagram: 'https://www.instagram.com/karyaarth', youtube: 'https://youtube.com/@karyaarth' },
    mood: '#A6321F',
    slides: 5,
    medium: 'Documentary series',
    heroSlide: 1,
    spark: 'It started with a question none of them could answer: how many times had they walked past the same tea stall, the same ice-cream cart, without once learning the name of the person running it?',
    tension: 'Kolkata\'s streets run on thousands of small, relentless acts of labour — carts pulled before sunrise, the same corner held for twenty years — and almost none of it is ever filmed on its own terms. It shows up as background noise in somebody else\'s video, or it doesn\'t show up at all.',
    craft: 'So they went out after dark with a camera and no script. No actors, no studio light — just the vendor, their spot, and whatever bulb was already hanging there. The team\'s own footage shows exactly that: two of them standing in a market lane lit by a single string of bulbs, holding up a phone, waiting for someone to finish serving a customer before they\'d even ask for the interview.',
    meaning: 'A camera doesn\'t usually turn this way. Karyaarth just decided it should.',
  },
  {
    slug: 'merge-conflicts',
    chapter: '02',
    teamName: 'Merge Conflicts',
    projectName: 'CareerCompass',
    category: 'Career Data Platform',
    tagline: "navigate India's skill economy, wisely.",
    oneLiner: 'A data tool that tells you which careers India actually needs — before you pick one.',
    description: "CareerCompass reads real industry demand against what Indian colleges actually produce, exposing the mismatch sector by sector. It tracks national requirements against the current talent pool to give students transparent, actionable career guidance — aiming to curb brain drain and align a generation's skills with where the economy is actually short-handed.",
    storyBeats: [
      'Jobs empty. Grads jobless. — demand read against what colleges produce',
      '1.5 crore higher-ed grads a year. Only 42.6% are considered employable.',
      'A 25% digital talent gap. 25 lakh skilled people emigrate, every year.',
      'Explore sectors, see where the demand actually is, decide on real data — not vibes',
    ],
    quote: 'Jobs empty. Grads jobless.',
    links: { website: 'https://careerrcompassindia.netlify.app/' },
    mood: '#3B6EE0',
    slides: 5,
    medium: 'Live web product',
    heroSlide: 4,
    spark: 'They kept hearing the same paradox at every family dinner and career fair, from two different directions at once: "companies can\'t find skilled people" sitting right next to "graduates can\'t find jobs." Same country. Same year. Both true.',
    tension: 'A seventeen-year-old picks a stream, a twenty-year-old picks a major, and both decisions get made mostly on vibes, hearsay and a career pamphlet that hasn\'t been updated since before they were born — while the labour market has already quietly moved somewhere else.',
    craft: 'So they went and found the real numbers — AISHE enrolment data, Mercer|Mettl employability studies, NASSCOM\'s skill-gap reports — and built a dashboard that reads all of it against itself, sector by sector. The proof that it\'s real and not a mockup is almost embarrassingly plain: a phone screenshot of their own live site, checked on someone\'s own browser at eleven at night, the night it finally worked.',
    meaning: 'A compass doesn\'t choose your direction for you. It just refuses to let you walk confidently the wrong way.',
  },
  {
    slug: 'execution-pending',
    chapter: '03',
    teamName: 'Execution Pending',
    projectName: 'QUIRK',
    category: 'Hardware',
    tagline: 'press it. earn a score.',
    oneLiner: 'A pressure-sensing desktop game console for ADHD brains and anyone who is just bored.',
    description: 'QUIRK sits in a gap nothing else fills — more rewarding than a fidget toy, less demanding than a phone. The hardware is a 200×200mm board built around an ESP32, an FSR pressure pad and an OLED display. Five games are live and downloadable today. The enclosure is still being built by hand, on a breadboard, by teenagers who got bored and decided to build something unique.',
    storyBeats: [
      'More fun than a fidget toy. Less needy than your phone.',
      'ESP32 (the brain) · FSR (the pressure pad) · OLED (the screen) — one 200×200mm board',
      'Built by hand, by bored teenagers — enclosure still a breadboard, shipped anyway',
      'Five games, live today: Hoops Blitz, Flappy Press, Stack, Rhythm Tap, Reaction Rush',
    ],
    quote: 'You press a pad. You earn a score. You put it down. That’s it.',
    links: { website: 'https://quirkbyaq.vercel.app' },
    mood: '#FF4F26',
    slides: 5,
    medium: 'Hardware prototype',
    heroSlide: 1,
    spark: 'Their own deck says it plainer than we could: "we built this at 3am." Four of them — all diagnosed or self-identified ADHD — tired of being sold fidget toys and app-store subscriptions designed by people who\'d never actually needed either.',
    tension: 'Three hundred and sixty-six million adults live with ADHD — more common than bipolar, OCD and PTSD combined — and fewer than one in five is ever diagnosed or treated. Daily phone pickups are up 42% year over year and it still isn\'t working. Your brain isn\'t broken. Your tools are.',
    craft: 'They didn\'t just build a board — they checked the science first: a UC Davis 2024 study found ADHD adults score higher on cognitive tasks while fidgeting, and the effect grows the longer the task runs. Movement releases the exact dopamine and norepinephrine an ADHD brain runs short on. So the hardware exists to give a hand something honest to do: one ESP32, one OLED display, one pressure sensor, wired by hand on a breadboard, open-sourced under MIT the moment it worked.',
    meaning: 'Fidgeting isn\'t the problem. It\'s the fix — and QUIRK is just that idea, soldered.',
  },
  {
    slug: 'alter-ego',
    chapter: '04',
    teamName: 'Alter Ego',
    projectName: 'Wisdom Woods',
    category: 'EdTech',
    tagline: 'a video game that tricks you into studying.',
    oneLiner: 'An educational game for classes 3–7 that turns vocabulary, logic and GK into an explorable forest.',
    description: 'Kids pick a character, walk into a forest, and play short level-based rounds across three tracks — Words, Logic and The World. Age sets the challenge, so a class 3 kid and a class 7 kid get the same forest tuned to their own level, unlocking harder woods and customizable avatars as they go.',
    storyBeats: [
      'Pick a character, walk into a forest, play short rounds, earn points, unlock more woods',
      'Three tracks: Words (vocab in disguise), Logic (little puzzles, big brain), The World (GK that sticks)',
      'Your age sets the challenge — a class 3 kid and a class 7 kid get their own forest',
      'Read the question, tap an answer, score a point, clear a level — quietly teaching, the whole way',
    ],
    quote: 'A video game that tricks you into studying.',
    links: { website: 'https://dipdagod.github.io/Wisdom-Woods/main.html', instagram: 'https://www.instagram.com/wisdomwoods26' },
    mood: '#1E8449',
    slides: 5,
    medium: 'Live web game',
    heroSlide: 1,
    spark: 'They kept coming back to their own homework — not the subjects, but the feeling of it. Vocabulary and GK weren\'t things you got to explore, they were things done to you, on a worksheet, with a due date.',
    tension: 'Nothing about the shape of homework has changed since they were eight years old. It\'s still a sheet of questions, not a place. A class 3 kid and a class 7 kid are handed the exact same flat page and expected to feel the same about it.',
    craft: 'So they built a forest instead of a form — a small illustrated world, drawn with the same warmth as their own logo (a tree, its birds, its flowers, hand-lettered), where age quietly sets the difficulty and the "lesson" is disguised as a level. They filmed the build working, start to finish, before they ever wrote a line of marketing copy.',
    meaning: 'A video game that tricks you into studying isn\'t a trick on the kid. It\'s a trick on the worksheet.',
  },
  {
    slug: 'idea-architects',
    chapter: '05',
    teamName: 'Idea Architects',
    projectName: 'Cirqle Rentals',
    category: 'Community Marketplace',
    tagline: 'rent it. lend it. repeat.',
    oneLiner: 'A community rental network on location-based WhatsApp groups — borrow what you need, lend what you don’t.',
    description: 'Cirqle is a community-driven rental network. Users can rent items they need or lend out items already sitting unused, earning extra money from resources that would otherwise go to waste — books, lab coats, calculators, sports gear, project material. Built on trust between neighbours, not transactions between strangers across the city.',
    storyBeats: [
      'Why buy a lab coat you’ll wear twice? Your neighbourhood already owns everything you need.',
      'Books to lab coats to cricket bats — anything unused can move to someone who needs it for a week',
      'Your area, your circle — built on trust, not transactions',
      'Borrow more, buy less — a neighbourhood turned into a zero-waste sharing network',
    ],
    quote: 'Borrow more, buy less.',
    links: { instagram: 'https://www.instagram.com/p/DZLEszYk031/' },
    mood: '#6B8E4E',
    slides: 5,
    medium: 'Community platform concept',
    heroSlide: 4,
    spark: 'Someone did the mental math on a lab coat worn twice a year, a calculator borrowed from three different friends over three different terms, and a badminton racket that\'s been in a cupboard since April — and realised the absurdity repeats itself on every street, in every house, at the same time.',
    tension: 'The default is always to buy — new, boxed, yours alone — even for things used twice and then forgotten, while somebody two lanes over is buying the exact same thing this week.',
    craft: 'Instead of a slide, they made a real explainer — a careful, hand-illustrated one-pager, icon by icon: books, calculators, lab coats, art supplies, sports gear, project material, all drawn in the same soft green as the rest of their brand, because the idea itself is meant to feel like something grown, not manufactured. The network runs on location-based WhatsApp groups — infrastructure that already exists in every neighbourhood, repurposed instead of rebuilt.',
    meaning: 'Borrow more, buy less isn\'t a slogan about frugality. It\'s a redesign of what "owning" a thing is even for.',
  },
  {
    slug: 'zero-to-deploy',
    chapter: '06',
    teamName: 'Zero to Deploy',
    projectName: 'Hunar',
    category: 'Vocational Placement',
    tagline: 'skill, made legible.',
    oneLiner: 'A verified placement network connecting India’s certified vocational graduates to employers who can’t find them.',
    description: 'India doesn’t have a vocational training problem — it has a placement problem. The gap sits downstream of training, where a generation of certified graduates fall back into a marketplace that can’t find them and can’t verify them. Hunar is a placement network, not another job board: skill-first profiles verified by institutes, endorsed by employers, one-tap quick apply.',
    storyBeats: [
      'Trained. Certified. Still invisible. — the gap isn’t at the top of the funnel, it’s downstream of training',
      'A placement network, not another job board — verified by institutes, endorsed by employers',
      'Verified once, trusted everywhere — proof, not paper',
      'Launching 2026 · single city · worker fees: none, ever · built on DPDP-compliant infrastructure',
    ],
    quote: 'Trained. Certified. Still invisible.',
    links: { website: 'https://hunar-one.vercel.app' },
    mood: '#B8862E',
    slides: 5,
    medium: 'Live web platform',
    heroSlide: 1,
    spark: 'Somebody on the team knew an electrician, a tailor, a mechanic — trained properly, certified on paper — who still couldn\'t get hired, because no employer two neighbourhoods away had any reason to trust a stranger\'s certificate.',
    tension: 'India\'s vocational-training system graduates people by the millions and then hands them almost nothing that helps a stranger believe they\'re good at the job. The gap was never at the top of the funnel. It\'s the silence right after.',
    craft: 'The name itself is the first decision worth noticing — हुनर, Devanagari for "skill," chosen over an English placeholder. Then the harder decision: a trust model that ranks proof by how hard it is to fake. Institutional verification weighs highest because it can\'t be self-granted; a self-declared claim of skill weighs nothing, because anyone can type anything. That\'s not a UI choice. That\'s an argument about what trust is actually made of.',
    meaning: 'Trained. Certified. Still invisible. Hunar\'s whole purpose is making something already real finally show up on someone else\'s screen.',
  },
  {
    slug: 'idea-not-found',
    chapter: '07',
    teamName: '404-Idea Not Found',
    projectName: 'Photon',
    category: 'Wearable Tech',
    tagline: 'no screen. no noise.',
    oneLiner: 'A screen-free smart bracelet that reads your health through light — engineered like an instrument, not a gadget.',
    description: 'PHOTON blends fashion, comfort and health tech into a single wearable. Instead of a glowing display and constant pings, it uses light-based sensors and motion tracking to quietly monitor heart rate, SpO2, sleep, activity and stress — in a sleek, modular band designed to actually be worn, not just charged.',
    storyBeats: [
      'All the data. None of the noise.',
      'Most fitness wearables look like gadgets. This one is designed to look like jewellery.',
      'A modular sensor module + interchangeable engraved links, made to be 3D-printed and customised',
      'Heart rate · SpO2 · sleep · activity · stress — IP67 water resistant, 7–10 day battery',
    ],
    quote: 'All the data. None of the noise.',
    links: {},
    mood: '#8FA0B3',
    slides: 5,
    medium: 'Hardware prototype (concept)',
    heroSlide: 3,
    spark: 'Every fitness wearable on the market has converged on the same black rectangle. Somebody on the team, with what looks like a musician\'s eye, asked why a health sensor had to look like a gadget at all.',
    tension: 'A tool designed to be worn every hour of every day should be something you actually want on your wrist — not a screen you\'re quietly tired of glancing at, buzzing with notifications nobody asked for.',
    craft: 'Their design sheet reads like a jeweller\'s blueprint, not a slide: a 42mm sensor module, 20mm links, a snap-lock toleranced to the millimetre — each link engraved with musical notation and 3D-printable in your own symbol. Built the way sheet music is built: interchangeable, re-orderable measures.',
    meaning: 'All the data, none of the noise — but the deeper claim is treating a health tool as an instrument worth noticing, not a monitor worth hiding.',
  },
]
