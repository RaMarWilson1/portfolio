// ============================================================
// SITE CONTENT CONFIG
// Edit everything in one place: links, images, metrics,
// newsletter issues, project descriptions, photos.
// ============================================================

export const SITE = {
  name: "Ra’Mar Wilson",
  role: "Builder · Software Engineer · Founder of Bontro",
  availability:
    "Computer Science graduate seeking software engineering opportunities in New York City and Northern New Jersey.",

  // --- links ---
  resume: "/RaMarWilson-Resume.pdf",
  email: "ramarwilson1@gmail.com",
  github: "https://github.com/ramarwilson1",
  linkedin: "https://www.linkedin.com/in/ramarwilson1/",
  calendar: "https://calendar.app.google/LdijLj8JrYTdZvmt7",

  // --- images ---
  headshot: "/03B77C77-08B5-4849-9587-75632D12316B_1_105_c.jpeg",
  journey: {
    mays: "/journey/mays.jpg",
    philly: "/journey/philly.jpg",
    nyc: "/journey/nyc.jpg",
  },

  // --- metrics ---
  metrics: [
    { n: "2", l: "Products designed and shipped independently" },
    { n: "1,500+", l: "Automated tests across critical product flows" },
    { n: "95+", l: "Registered One More Day users" },
    { n: "3", l: "Platforms: web, iOS, and Android" },
  ],

  // --- flagship products ---
  bontro: {
    web: "https://bontro.co",
    app: "https://apps.apple.com/app/id6773386649", // TODO: confirm real App Store id
    shot: "/projects/bontro.jpg",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Stripe", "React Native"],
  },
  oneMoreDay: {
    web: "https://onemoredayapp.com",
    shot: "/projects/one-more-day.jpg",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Privacy & Safety", "Moderation Systems"],
  },

  // --- client work ---
  clientWork: [
    {
      title: "Goodeal Transmissions",
      badge: "Paid",
      desc:
        "Designed and developed a responsive website for a South Jersey transmission shop, with service pages, local-search structure, and lead-generation calls to action.",
      tt: "Next.js · Hammonton, NJ",
      shot: "/projects/goodeal.jpg",
      url: "https://goodeal-transmissions.vercel.app",
    },
    {
      title: "Luxury Tattoo",
      badge: "Client",
      desc:
        "Built a booking-focused site for a tattoo studio, with a dedicated page and portfolio for each artist and a clean path from browsing to booking.",
      tt: "Next.js · Booking",
      shot: "/projects/luxury-tattoo.jpg",
      url: "https://luxury-tattoo.vercel.app",
    },
  ],

  // --- tools & experiments (mini = no screenshot) ---
  tools: [
    {
      title: "Internship Tracker",
      desc:
        "Tracks my job applications and pulls updates from Gmail. I built it because I got tired of spreadsheets.",
      tt: "JavaScript · Gmail API",
      shot: "/projects/internship-tracker.jpg",
      url: "https://internship-tracker-two.vercel.app",
      go: "Live ↗",
    },
    {
      title: "OpenRuns",
      desc:
        "A shot clock and scoreboard for pickup basketball. I ran open runs at school for two years, so I built the tool we needed.",
      tt: "Web app",
      mini: "Basketball · Web",
      url: "https://github.com/RaMarWilson1/Openruns",
      go: "GitHub ↗",
    },
    {
      title: "Bach Music Generator",
      desc:
        "Trained a neural net on 300+ Bach MIDI files to write its own baroque music, then checked the chords by hand to see if it held up.",
      tt: "Machine learning",
      mini: "Python · TensorFlow",
      url: "https://github.com/ramarwilson1/GenAI",
      go: "GitHub ↗",
    },
  ],

  // --- newsletter ---
  newsletter: {
    home: "https://betweencommits.beehiiv.com",
    subscribe: "https://betweencommits.beehiiv.com/subscribe",
    issues: [
      {
        title: "Still in the basement. Still building.",
        date: "Jul 6, 2026",
        url: "https://betweencommits.beehiiv.com/p/still-in-the-basement-still-building",
      },
      {
        title: "Degrees, deeds, and a rebuilt transmission.",
        date: "May 29, 2026",
        url: "https://betweencommits.beehiiv.com/p/degrees-deeds-and-a-rebuilt-transmission",
      },
      {
        title:
          "Why I Built Two Layers of Moderation (And Why One Was Never Going to Be Enough)",
        date: "Apr 24, 2026",
        url: "https://betweencommits.beehiiv.com/p/why-i-built-two-layers-of-moderation-and-why-one-was-never-going-to-be-enough",
      },
    ],
  },

  // --- photography preview (pulls from the live gallery) ---
  photos: [
    "https://fbmdkppzlt8wjpjn.public.blob.vercel-storage.com/photography/nature_%20-%2060.jpeg",
    "https://fbmdkppzlt8wjpjn.public.blob.vercel-storage.com/photography/nature_%20-%2061.jpeg",
    "https://fbmdkppzlt8wjpjn.public.blob.vercel-storage.com/photography/nature_%20-%2010.jpeg",
    "https://fbmdkppzlt8wjpjn.public.blob.vercel-storage.com/photography/nature_%20-%2030.jpeg",
  ],

  poem: {
    lines: ["French Press mornings,", "steam curling through a cracked window,", "the skyline still half asleep."],
    title: "Coffee Coded Days",
  },
};
