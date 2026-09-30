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

  // Canonical production origin (the apex domain 308-redirects here).
  url: "https://www.ramarwilson.com",

  // --- links ---
  resume: "/RaMarWilson-Resume.pdf",
  email: "ramarwilson1@gmail.com",
  github: "https://github.com/ramarwilson1",
  linkedin: "https://www.linkedin.com/in/ramarwilson1/",
  calendar: "https://calendar.app.google/LdijLj8JrYTdZvmt7",
  // Other public profiles (used for structured data, not shown in the UI).
  profiles: ["https://www.youtube.com/@ramarwilson1", "https://www.instagram.com/ramarwilson1"],

  // --- "Currently" — the small freshness signal on the homepage. Keep it short. ---
  currently: [
    "Building Bontro",
    "Writing No Clean Version",
    "Looking for the right engineering team in NYC / Northern NJ",
  ],

  // --- images ---
  headshot: "/IMG_0905.JPG",
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
    app: "https://bontro.co/app", // device-detects → App Store / Google Play
    shot: "/projects/bontro.jpg",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Stripe", "React Native"],
  },
  oneMoreDay: {
    web: "https://onemoredayapp.com",
    shot: "/projects/one-more-day.jpg",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Privacy & Safety", "Moderation Systems"],
  },

  // --- experience: roles + communities. Also add/edit these from /studio.
  //     `order` (higher = shown first) controls position. type: "role" | "community".
  experience: [
    {
      type: "role", order: 95,
      role: "Software Engineer Intern",
      org: "Medidata Solutions",
      loc: "New York, NY",
      period: "May – Aug 2025",
      points: [
        "Collaborated with 10+ engineers and led architecture decisions for an internal React web application built for C-suite executives.",
        "Designed and deployed 3 interactive dashboards in ReportPortal to visualize automated testing data (unit, acceptance, integration), improving QA decision-making efficiency by 25%.",
        "Integrated Immich’s facial-recognition system into a React web app, automating categorization and management of 10,000+ media assets.",
        "Authored internal API integration documentation for ReportPortal, improving developer productivity by 30% through standardized processes.",
        "Worked cross-functionally with QA, DevOps, and Platform Engineering to tailor tools for diverse testing and reporting needs.",
      ],
    },
    {
      type: "role", order: 85,
      role: "Software Engineer Fellow",
      org: "Headstarter AI",
      loc: "Remote",
      period: "Jul – Aug 2024",
      points: [
        "Built 5+ AI apps and APIs using Next.js, OpenAI, Pinecone, and the Stripe API.",
        "Took projects from design to deployment, collaborating with other engineering fellows using MVC design patterns.",
        "Coached by engineers from Amazon, Bloomberg, and Capital One on Agile, CI/CD, Git, and microservice patterns.",
      ],
    },
    {
      type: "role", order: 75,
      role: "IT Support Technician",
      org: "Saint Joseph’s University",
      loc: "Philadelphia, PA",
      period: "Jun 2024 – May 2026",
      points: [
        "Manage a Microsoft Azure database of 19,000+ student records, ensuring accurate data handling and security protocols.",
        "Conduct routine maintenance across university computer labs with 300+ workstations to keep them running.",
        "Troubleshoot and resolve 20+ hardware and software issues weekly for university- and student-owned systems.",
        "Maintain a 24-hour average ticket resolution time through efficient diagnostic and support workflows.",
      ],
    },
    {
      type: "role", order: 65,
      role: "STEM Instructor",
      org: "Lavner Education",
      loc: "Villanova, PA",
      period: "May 2024 – Mar 2025",
      points: [
        "Developed 20+ lesson plans and simplified programming curricula for 100+ students aged 8–14 across Python, C++, and Java.",
        "Led 40+ interactive STEM sessions for groups of 5–15 children, earning a 90% satisfaction rating from parent feedback.",
        "Integrated ChatGPT and machine-learning demos to introduce AI concepts, increasing engagement by 25% over traditional instruction.",
      ],
    },
    { type: "community", order: 30, org: "ColorStack" },
    { type: "community", order: 29, org: "ForbesBLK" },
    { type: "community", order: 28, org: "Blacks in Technology" },
  ],

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
      shot: "/projects/openruns.jpg",
      url: "https://openruns-snowy.vercel.app/",
      go: "Live ↗",
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
    // Static fallback if Beehiiv is unreachable — newest first.
    issues: [
      {
        title: "July was humbling. I'm still building.",
        date: "Aug 7, 2026",
        url: "https://betweencommits.beehiiv.com/p/july-was-humbling-i-m-still-building",
      },
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

  // --- No Clean Version: defaults for the poetry series. The live values are
  //     edited from /studio and served by /api/poems as `series`. ---
  noCleanVersion: {
    title: "No Clean Version",
    subtitle: "Poetry by Ra’Mar Wilson",
    description: "Written raw. Read the same way.",
    numberingEnabled: true,
    links: [],
  },

  poem: {
    lines: ["French Press mornings,", "steam curling through a cracked window,", "the skyline still half asleep."],
    title: "Coffee Coded Days",
  },
};
