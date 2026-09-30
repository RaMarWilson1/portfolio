import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SITE } from "../content/site";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import { sectionLink } from "./nav";
import { fetchJson } from "../lib/fetchJson";
import { trackClick } from "../lib/analytics";
import BlobImage from "../lib/BlobImage";
import { episodeAria, episodeLabel, inSeries } from "../lib/ncv";
import "./portfolio.css";

// "" = same-origin (this deployment's own /api). Override with VITE_API_URL for local dev.
const API = import.meta.env.VITE_API_URL ?? "";

const ext = { target: "_blank", rel: "noopener noreferrer" };

const issueLabel = (n) => `Issue ${String(n).padStart(2, "0")}`;

function ExpCard({ r }) {
  return (
    <div className="xpcard">
      <div className="xpcard-top">
        <span className="xpcard-org">{r.org}</span>
        {r.period && <span className="xpcard-period">{r.period}</span>}
      </div>
      {r.role && <h3 className="xpcard-role">{r.role}</h3>}
      {r.loc && <div className="xpcard-loc">{r.loc}</div>}
      {r.points && r.points.length > 0 && (
        <ul className="xpcard-points">{r.points.map((p, j) => <li key={j}>{p}</li>)}</ul>
      )}
    </div>
  );
}

const project = (name, link) => trackClick("portfolio_project_opened", { project: name, link });

export default function Home() {
  const S = SITE;

  // Live content — falls back to config, then updates from the same APIs the
  // /photography, /poetry and /newsletter pages use. Add a photo/poem/issue and
  // it shows up here too, no code change.
  const [photos, setPhotos] = useState(S.photos);
  const [poem, setPoem] = useState(S.poem);
  const [series, setSeries] = useState(S.noCleanVersion);
  const [issues, setIssues] = useState(S.newsletter.issues.slice(0, 3));
  const [issueTotal, setIssueTotal] = useState(S.newsletter.issues.length);
  const [experience, setExperience] = useState(S.experience);

  // Each request is independent and falls back silently to the config values.
  useEffect(() => {
    fetchJson(`${API}/api/photos`)
      .then((d) => {
        if (Array.isArray(d.photos) && d.photos.length) setPhotos(d.photos.slice(0, 4).map((p) => p.thumb));
      })
      .catch(() => {});
    fetchJson(`${API}/api/poems`)
      .then((d) => {
        const list = Array.isArray(d.poems) ? d.poems : [];
        if (d.series) setSeries(d.series);
        const f = list.find((p) => p.featured) || list[0];
        if (f && f.body) {
          setPoem({
            lines: f.body.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 3),
            title: f.title,
            seriesNumber: inSeries(f) ? f.seriesNumber : null,
          });
        }
      })
      .catch(() => {});
    fetchJson(`${API}/api/posts`)
      .then((d) => {
        // /api/posts returns newest → oldest with issue numbers already derived.
        const posts = Array.isArray(d.posts) ? d.posts.filter((p) => p && p.url && p.title) : [];
        if (posts.length) {
          setIssues(posts.slice(0, 3).map((p) => ({ title: p.title, date: p.date, url: p.url, issueNumber: p.issueNumber })));
          setIssueTotal(d.total || posts.length);
        }
      })
      .catch(() => {});
    fetchJson(`${API}/api/experience`)
      .then((d) => {
        if (Array.isArray(d.experience) && d.experience.length) {
          // merge studio-added entries over the config seed, keyed by org+role
          const key = (e) => `${(e.org || "").toLowerCase()}|${(e.role || "").toLowerCase()}`;
          const map = new Map();
          [...SITE.experience, ...d.experience].forEach((e) => map.set(key(e), e));
          setExperience(Array.from(map.values()));
        }
      })
      .catch(() => {});
  }, []);

  const roles = experience.filter((e) => e.type !== "community").sort((a, b) => (b.order || 0) - (a.order || 0));
  const communities = experience.filter((e) => e.type === "community").sort((a, b) => (b.order || 0) - (a.order || 0));

  const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const $ = (id) => document.getElementById(id);
    const journey = $("top"),
      sMays = $("s-mays"),
      sPhl = $("s-phl"),
      sNyc = $("s-nyc"),
      starsC = $("stars"),
      intro = $("intro"),
      cue = $("cue"),
      pbar = $("pbar"),
      lbMays = $("lb-mays"),
      lbPhl = $("lb-phl"),
      lbNyc = $("lb-nyc");
    if (!journey || !starsC) return;

    const band = (p, a, b) => (p <= a ? 0 : p >= b ? 1 : (p - a) / (b - a));
    const sm = (x) => x * x * (3 - 2 * x);
    const ctx = starsC.getContext("2d");
    let stars = [];
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    function sizeStars() {
      starsC.width = window.innerWidth * DPR;
      starsC.height = window.innerHeight * DPR;
      stars = [];
      for (let i = 0; i < 150; i++)
        stars.push({
          x: Math.random() * starsC.width,
          y: Math.random() * starsC.height * 0.62,
          r: (Math.random() * 1.2 + 0.3) * DPR,
          tw: Math.random() * 6.28,
        });
      drawStars();
    }
    function drawStars() {
      ctx.clearRect(0, 0, starsC.width, starsC.height);
      ctx.fillStyle = "#fff";
      for (const s of stars) {
        ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(s.tw));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.28);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    sizeStars();

    let progress = 0;
    function apply(p) {
      const mays = 1 - band(p, 0.16, 0.32),
        phl = sm(band(p, 0.26, 0.42)) * (1 - band(p, 0.56, 0.7)),
        nyc = sm(band(p, 0.62, 0.8));
      sMays.style.opacity = mays;
      sPhl.style.opacity = phl;
      sNyc.style.opacity = nyc;
      sMays.style.transform = "scale(" + (1.06 - sm(band(p, 0, 0.32)) * 0.06) + ")";
      sPhl.style.transform = "scale(" + (1.06 - sm(band(p, 0.26, 0.6)) * 0.06) + ")";
      sNyc.style.transform = "scale(" + (1.06 - sm(band(p, 0.62, 1)) * 0.06) + ")";
      starsC.style.opacity = sm(band(p, 0.66, 0.98));
      const lab = (el, a, pk, b) => {
        const up = sm(band(p, a, pk));
        const dn = band(p, pk + (b - pk) * 0.55, b);
        el.style.opacity = Math.max(up * (1 - dn), 0);
        el.style.transform = "translateY(" + ((1 - up) * 26 - band(p, pk, b) * 18) + "px)";
      };
      lab(lbMays, 0.02, 0.1, 0.26);
      lab(lbPhl, 0.3, 0.44, 0.6);
      lab(lbNyc, 0.66, 0.82, 1.05);
      intro.style.opacity = 1 - band(p, 0.03, 0.14);
      intro.style.pointerEvents = p > 0.14 ? "none" : "auto";
      cue.style.opacity = (1 - band(p, 0.02, 0.1)) * 0.85;
      pbar.style.width = p * 100 + "%";
    }
    function onScroll() {
      const top = journey.offsetTop,
        h = journey.offsetHeight - window.innerHeight;
      progress = Math.max(0, Math.min(1, (window.scrollY - top) / (h || 1)));
      apply(progress);
    }
    let ticking = false;
    function req() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
      }
    }
    let rafId;
    if (reduce) {
      journey.style.height = "100vh";
      apply(0.92);
    } else {
      window.addEventListener("scroll", req, { passive: true });
      const tw = () => {
        if (progress > 0.6) drawStars();
        rafId = requestAnimationFrame(tw);
      };
      tw();
      onScroll();
    }
    const onResize = () => {
      sizeStars();
      onScroll();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", req);
      window.removeEventListener("resize", onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="pf">
      <SiteNav />

      {/* JOURNEY */}
      <div className="journey" id="top">
        <div className="stage">
          <div className="scene" id="s-mays" style={{ backgroundImage: `url(${S.journey.mays})` }} />
          <div className="scene" id="s-phl" style={{ backgroundImage: `url(${S.journey.philly})` }} />
          <div className="scene" id="s-nyc" style={{ backgroundImage: `url(${S.journey.nyc})` }} />
          <canvas className="stars" id="stars" />
          <div className="floor" />
          <div className="vign" />

          <div className="intro" id="intro">
            <h1 className="nm">RA’MAR WILSON</h1>
            <div className="rl">{S.role}</div>
            <div className="cta">
              <Link className="btn solid" to={sectionLink("work")}>View my work</Link>
              <Link className="btn ghost" to={sectionLink("contact")}>Contact me</Link>
            </div>
            <p className="avail">{S.availability}</p>
          </div>

          <div className="labels" aria-hidden="true">
            <div className="label" id="lb-mays"><div className="city">Mays Landing</div><div className="sub">South Jersey · Home</div></div>
            <div className="label" id="lb-phl"><div className="city">Philadelphia</div><div className="sub">Saint Joseph’s University · Class of 2026</div></div>
            <div className="label" id="lb-nyc"><div className="city">New York</div><div className="sub">Where I’m headed</div></div>
          </div>

          <div className="cue" id="cue"><span className="dot" />Scroll</div>
          <div className="pbar" id="pbar" />
        </div>
      </div>

      <main id="main">
        {/* ABOUT + METRICS */}
        <section className="blk" id="about"><div className="wrap">
          <ul className="modes" aria-label="What I make">
            <li className="mode">
              <span className="k">Build<i>.</i></span>
              <span className="d">Software &amp; products</span>
              <span className="go"><Link to={sectionLink("work")}>See the work →</Link></span>
            </li>
            <li className="mode">
              <span className="k">Write<i>.</i></span>
              <span className="d">
                <Link to="/poetry" onClick={trackClick("no_clean_version_opened", { location: "write_row" })}>No Clean Version</Link>
                {" · "}
                <Link to="/newsletter">Between Commits</Link>
              </span>
            </li>
            <li className="mode">
              <span className="k">Shoot<i>.</i></span>
              <span className="d">Photography</span>
              <span className="go"><Link to="/photography">Gallery →</Link></span>
            </li>
          </ul>

          <div className="story">
            <div className="portrait">
              <img src={S.headshot} alt="Ra’Mar Wilson" />
              <div className="tag"><span className="mono">Mays Landing → NYC</span></div>
            </div>
            <div>
              <p className="eyebrow">About</p>
              <h2 className="head">I like building things.</h2>
              <p>I’ve wanted to build things for as long as I can remember. Back then, the word was
              “inventor.” Now it’s software, but it comes from the same place. I’m from Mays Landing in
              South Jersey, and I earned my Computer Science degree from Saint Joseph’s University in
              Philadelphia in 2026. I’m also a <b>first-generation college graduate</b>.</p>
              <p>I balanced school, work, and building a business at the same time. I learned by
              shipping, finding what didn’t work, fixing it, and continuing to improve.</p>
              <p>I’ve cut hair for about six years. I never planned on it. I was good at it, the clients
              kept coming, and it helped pay my bills. That experience became the foundation for
              <b> Bontro</b>. I lived through the mess of managing appointments, payments, and clients
              through my phone, so I built the product I wished I had.</p>
              <div className="route">
                <span className="stop"><b>Mays Landing</b> · home</span>
                <span className="stop"><b>Philadelphia</b> · SJU ’26</span>
                <span className="stop now"><b>New York</b> · next ↗</span>
              </div>
              {S.currently?.length > 0 && (
                <div className="currently">
                  <span className="ck"><span className="pulse" aria-hidden="true" />Currently</span>
                  <ul>{S.currently.map((c) => <li key={c}>{c}</li>)}</ul>
                </div>
              )}
            </div>
          </div>
          <div className="stats">
            {S.metrics.map((m, i) => (
              <div className="stat" key={i}><div className="n">{m.n}</div><div className="l">{m.l}</div></div>
            ))}
          </div>
        </div></section>

        <div className="seam" />

        {/* WORK */}
        <section className="blk" id="work"><div className="wrap">
          <div className="sec-top"><h2 className="lbl">Work</h2><span className="rule" /><span className="r">Products I designed and shipped</span></div>

          <div className="feat"><div className="in">
            <a className="shot" href={S.bontro.web} {...ext} onClick={project("Bontro", "screenshot")}><span className="badge">bontro.co</span><img src={S.bontro.shot} alt="Bontro booking and payments platform" loading="lazy" /></a>
            <div className="txt">
              <h3>Bon<em>tro</em></h3>
              <p className="sub">Booking &amp; payments for independent pros</p>
              <p>Bontro is booking and payments software for barbers, stylists, nail techs, tattoo
              artists, bakers, and other independent service professionals. I took it from an idea
              based on my own experience as a barber to a <b>live product across web, iOS, and
              Android</b>.</p>
              <p>I designed and built the booking experience, business dashboard, client management
              tools, website builder, payments infrastructure, mobile apps, and the systems supporting
              the platform. Bontro lets professionals run their business without giving up a percentage
              of every booking.</p>
              <div className="stack">{S.bontro.tags.map((t) => <span className="chip" key={t}>{t}</span>)}</div>
              <div className="acts">
                <a className="visit" href={S.bontro.web} {...ext} onClick={project("Bontro", "site")}>Open bontro.co →</a>
                <a className="visit alt" href={S.bontro.app} {...ext} onClick={project("Bontro", "app")}>View app ↗</a>
              </div>
            </div>
          </div></div>

          <div className="feat rev"><div className="in">
            <a className="shot" href={S.oneMoreDay.web} {...ext} onClick={project("One More Day", "screenshot")}><span className="badge">one-more-day</span><img src={S.oneMoreDay.shot} alt="One More Day mental-health platform" loading="lazy" /></a>
            <div className="txt">
              <h3>One More <em>Day</em></h3>
              <p className="sub">A free mental-health platform</p>
              <p>One More Day is a free mental-health platform built around one idea: help someone make
              it through one more day. I built mood tracking, private journaling, anonymous community
              features, moderation tools, crisis detection, resource routing, themes, progress tracking,
              and safety-focused account flows.</p>
              <p>The moderation and crisis-detection systems are designed to make the community safer
              and put appropriate resources in front of users when concerning language appears. The
              platform has grown to <b>more than 95 registered users, with roughly half returning</b>.</p>
              <div className="stack">{S.oneMoreDay.tags.map((t) => <span className="chip" key={t}>{t}</span>)}</div>
              <div className="acts"><a className="visit" href={S.oneMoreDay.web} {...ext} onClick={project("One More Day", "site")}>See One More Day →</a></div>
            </div>
          </div></div>
        </div></section>

        {/* EXPERIENCE */}
        <section className="blk" id="experience"><div className="wrap">
          <div className="sec-top"><h2 className="lbl">Experience</h2><span className="rule" /><span className="r">Roles &amp; communities</span></div>
          {reduceMotion ? (
            <div className="xpgrid">
              {roles.map((r, i) => <ExpCard r={r} key={i} />)}
            </div>
          ) : (
            <div className="xpmarquee">
              <div className="xptrack">
                {[...roles, ...roles].map((r, i) => <ExpCard r={r} key={i} />)}
              </div>
            </div>
          )}
          {communities.length > 0 && (
            <div className="communities">
              <span className="clabel">Communities</span>
              <div className="cbadges">
                {communities.map((c, i) => <span className="cbadge" key={i}>{c.org}</span>)}
              </div>
            </div>
          )}
        </div></section>

        {/* CLIENT WORK */}
        <section className="blk"><div className="wrap">
          <div className="sec-top"><h2 className="lbl">Client work</h2><span className="rule" /><span className="r">Real sites, real clients</span></div>
          <div className="grid">
            {S.clientWork.map((p) => (
              <a className="pcard" href={p.url} {...ext} key={p.title} onClick={project(p.title, "client")}>
                <div className="thumb"><img src={p.shot} alt={p.title + " website"} loading="lazy" /></div>
                <div className="pc">
                  <div className="top"><h3>{p.title}</h3><span className="paid">{p.badge}</span></div>
                  <p>{p.desc}</p>
                  <div className="row"><span className="tt">{p.tt}</span><span className="go">Live ↗</span></div>
                </div>
              </a>
            ))}
          </div>
        </div></section>

        {/* TOOLS */}
        <section className="blk"><div className="wrap">
          <div className="sec-top"><h2 className="lbl">Tools &amp; experiments</h2><span className="rule" /><span className="r">Things I built for myself</span></div>
          <div className="grid three">
            {S.tools.map((p) => (
              <a className={"pcard" + (p.mini ? " mini" : "")} href={p.url} {...ext} key={p.title} onClick={project(p.title, "tool")}>
                <div className="thumb">{p.mini ? <span>{p.mini}</span> : <img src={p.shot} alt={p.title} loading="lazy" />}</div>
                <div className="pc">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <div className="row"><span className="tt">{p.tt}</span><span className="go">{p.go}</span></div>
                </div>
              </a>
            ))}
          </div>
          <a className="ghlink" href={S.github} {...ext} onClick={trackClick("github_opened", { location: "tools" })}>Explore more on GitHub ↗</a>
        </div></section>

        {/* NEWSLETTER */}
        <section className="blk" id="between"><div className="wrap">
          <div className="sec-top"><h2 className="lbl">Newsletter</h2><span className="rule" /><span className="r">Writing · photography · poetry</span></div>
          <div className="news">
            <div className="nhead">
              <div>
                <span className="live">Published · {issueTotal} {issueTotal === 1 ? "issue" : "issues"}</span>
                <h3>Between <span>Commits</span></h3>
                <p className="desc">I write about building Bontro, becoming a better engineer, cars,
                creativity, and whatever I’m working through between commits.</p>
                <div className="acts">
                  <a
                    className="visit"
                    href={issues[0]?.url || S.newsletter.home}
                    {...ext}
                    onClick={trackClick("newsletter_issue_opened", { issue: issues[0]?.title, issueNumber: issues[0]?.issueNumber ?? issueTotal, location: "home_latest" })}
                  >
                    Read the latest issue →
                  </a>
                  <a className="visit alt" href={S.newsletter.home} {...ext} onClick={trackClick("newsletter_opened", { source: "home_archive" })}>View all issues</a>
                  <a className="visit alt" href={S.newsletter.subscribe} {...ext} onClick={trackClick("newsletter_subscribe_clicked", { location: "home" })}>Subscribe</a>
                </div>
              </div>
              <div className="mono" style={{ color: "var(--pf-muted)", lineHeight: 1.8 }}>
                Life. Code.<br />Everything between.<br /><br />New issues on cadence,<br />straight to your inbox.
              </div>
            </div>
            <div className="issues">
              {issues.map((it, i) => (
                <a
                  className="issue"
                  href={it.url}
                  {...ext}
                  key={it.url}
                  onClick={trackClick("newsletter_issue_opened", { issue: it.title, issueNumber: it.issueNumber ?? issueTotal - i, location: "home_list" })}
                >
                  <span className="no">{issueLabel(it.issueNumber ?? issueTotal - i)}</span>
                  <span className="t">{it.title}{i === 0 && <span className="latest">Latest</span>}</span>
                  <span className="d">{it.date}</span>
                  <span className="a">Read ↗</span>
                </a>
              ))}
            </div>
          </div>
        </div></section>

        {/* PHOTOGRAPHY + POETRY */}
        <section className="blk" aria-labelledby="creative-h"><div className="wrap">
          <h2 className="sr-only" id="creative-h">Photography and poetry</h2>
          <div className="creative">
            <div className="photostrip">
              <div className="ps-head">
                <div><h3 className="t">Photography</h3><div className="d">Landscapes and light, mostly. What I shoot to get out of my head.</div></div>
                <Link className="ps-go" to="/photography">View gallery ↗</Link>
              </div>
              <Link className="ps-imgs" to="/photography" aria-label="Open the photography gallery">
                {photos.map((src, i) => (
                  <BlobImage
                    key={src + i}
                    src={src}
                    alt=""
                    widths={[384, 640]}
                    sizes="(min-width: 760px) 25vw, 50vw"
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </Link>
            </div>
            <div className="cbottom">
              <div className="poem">
                <div className="ncv-head">
                  <span className="lbl ncv-name">{series.title}</span>
                  <span className="lbl">{series.subtitle}</span>
                </div>
                <blockquote>
                  “{poem.lines.map((l, i) => (<React.Fragment key={i}>{l}{i < poem.lines.length - 1 && <br />}</React.Fragment>))}”
                </blockquote>
                <div className="cite">
                  from “{poem.title}”
                  {series.numberingEnabled !== false && poem.seriesNumber ? (
                    <span> · <span aria-hidden="true">{episodeLabel(poem.seriesNumber, "NCV")}</span><span className="sr-only">{episodeAria(poem.seriesNumber, series.title)}</span></span>
                  ) : null}
                </div>
                <Link className="go" to="/poetry" onClick={trackClick("no_clean_version_opened", { location: "home_poem" })}>
                  Read {series.title} →
                </Link>
              </div>
              <div className="poem">
                <div className="lbl">Off the clock</div>
                <blockquote className="plain">Cars, basketball, and a camera. The stuff that keeps me steady while I build. It all feeds the work more than it competes with it.</blockquote>
                <a className="go" href={S.newsletter.home} {...ext} onClick={trackClick("newsletter_opened", { source: "home_off_clock" })}>More in the newsletter ↗</a>
              </div>
            </div>
          </div>
        </div></section>

        {/* CONTACT */}
        <section className="blk" id="contact"><div className="wrap">
          <div className="contact">
            <h2>Looking for the right engineering team.</h2>
            <p>I’m looking for the right engineering team in New York City or Northern New Jersey. I
            want to work with strong engineers, contribute to products people actually use, and keep
            growing by shipping real work.</p>
            <div className="acts">
              <a className="visit" href={S.calendar} {...ext} onClick={trackClick("contact_clicked", { method: "calendar", location: "contact" })}>Book a call →</a>
              <a className="visit alt" href={"mailto:" + S.email} onClick={trackClick("contact_clicked", { method: "email", location: "contact" })}>Email me</a>
              <a className="visit alt" href={S.linkedin} {...ext} onClick={trackClick("linkedin_opened", { location: "contact" })}>LinkedIn ↗</a>
              <a className="visit alt" href={S.github} {...ext} onClick={trackClick("github_opened", { location: "contact" })}>GitHub ↗</a>
              <a className="visit alt" href={S.resume} {...ext} onClick={trackClick("resume_opened", { location: "contact" })}>Résumé ↗</a>
            </div>
          </div>
          <div className="signoff">Life. Code. <span>Everything between.</span></div>
        </div></section>

      </main>
      <SiteFooter />
    </div>
  );
}
