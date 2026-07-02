// AQ Labs '26 — the exhibit's raw material.
// Sourced from each team's official submission + their own Instagram
// carousels. Copy is theirs wherever possible; only lightly cleaned up.

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
    mood: '#E8542E',
    slides: 5,
    medium: 'Documentary series',
    heroSlide: 1,
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
  },
  {
    slug: 'alter-ego',
    chapter: '04',
    teamName: 'Alter Ego',
    projectName: 'Wisdom Woods',
    category: 'EdTech',
    tagline: 'a video game that tricks you into studying.',
    oneLiner: 'An educational game for classes 3–7 that turns vocabulary, logic and GK into an explorable forest.',
    description: 'Kids pick a character, walk into a forest, and play short level-based rounds across three tracks — Words, Logic and The World. Age sets the challenge, so a class 3 kid and a class 7 kid get the same forest, tuned to their own level, unlocking harder woods and customizable avatars as they go.',
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
    mood: '#8B5CF6',
    slides: 5,
    medium: 'Community platform concept',
    heroSlide: 4,
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
    mood: '#1D8348',
    slides: 5,
    medium: 'Live web platform',
    heroSlide: 1,
  },
  {
    slug: 'idea-not-found',
    chapter: '07',
    teamName: '404-Idea Not Found',
    projectName: 'Photon',
    category: 'Wearable Tech',
    tagline: 'no screen. no noise.',
    oneLiner: 'A screen-free smart bracelet that reads your health through light — built to look like jewellery, not a gadget.',
    description: 'PHOTON blends fashion, comfort and health tech into a single wearable. Instead of a glowing display and constant pings, it uses light-based sensors and motion tracking to quietly monitor heart rate, SpO2, sleep, activity and stress — in a sleek, modular band designed to actually be worn, not just charged.',
    storyBeats: [
      'All the data. None of the noise.',
      'Most fitness wearables look like gadgets. This one is designed to look like jewellery.',
      'Two concept builds — a metal link bracelet and a filigree bracelet — sensor, band and connectors made to come apart',
      'Heart rate · SpO2 · sleep · activity · stress — IP67 water resistant, 7–10 day battery',
    ],
    quote: 'All the data. None of the noise.',
    links: {},
    mood: '#D4AF37',
    slides: 5,
    medium: 'Hardware prototype (concept)',
    heroSlide: 3,
  },
]
