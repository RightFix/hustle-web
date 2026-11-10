import { Link } from 'react-router-dom'

const collars = [
  {
    name: 'Pink collar',
    emoji: '🩷',
    color: 'border-pink-500/30',
    chip: 'bg-pink-500/15 text-pink-300',
    desc: 'Care, hospitality, retail, beauty — the people who look after people.',
    roles: ['Caregiver', 'Cook', 'Cleaner', 'Hair stylist', 'Shop attendant'],
  },
  {
    name: 'Gray collar',
    emoji: '⚙️',
    color: 'border-slate-500/30',
    chip: 'bg-slate-500/15 text-slate-300',
    desc: 'Skilled technicians who keep systems running.',
    roles: ['Electrician', 'Security guard', 'Mechanic', 'Driver', 'IT support'],
  },
  {
    name: 'Blue collar',
    emoji: '🔧',
    color: 'border-sky-500/30',
    chip: 'bg-sky-500/15 text-sky-300',
    desc: 'Builders and movers — hands-on work that powers cities.',
    roles: ['Plumber', 'Mason', 'Welder', 'Delivery rider', 'Warehouse hand'],
  },
  {
    name: 'Green collar',
    emoji: '🌱',
    color: 'border-emerald-500/30',
    chip: 'bg-emerald-500/15 text-emerald-300',
    desc: 'Work that keeps the planet running.',
    roles: ['Solar installer', 'Farm hand', 'Recycler', 'Gardener', 'Water tech'],
  },
]

const demoGigs = [
  {
    title: 'Weekend cook for 40-cover café',
    collar: 'Pink',
    where: 'Lekki, Lagos · Sat–Sun',
    pay: '₦15,000/day',
    chip: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    apps: 6,
  },
  {
    title: 'Rewire 3-bedroom flat',
    collar: 'Blue',
    where: 'Yaba, Lagos · 2 days',
    pay: '₦85,000 total',
    chip: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    apps: 11,
  },
  {
    title: 'Solar panel install crew (2 helpers)',
    collar: 'Green',
    where: 'Ibadan · This week',
    pay: '₦12,000/day',
    chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    apps: 4,
  },
]

const steps = [
  ['Make a profile in 60 seconds', 'No CV, no forms to grind — your phone camera is your résumé.'],
  ['Get seen by real hirers', 'Your work, ratings and location do the talking.'],
  ['Agree terms directly', 'You settle pay and timing yourself. No agency taking a cut.'],
]

export default function Landing() {
  return (
    <div className="bg-slate-950 text-slate-200">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.12),transparent_55%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 pt-14 pb-10 md:pt-24 md:pb-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
              LinkedIn's forgotten workforce
            </p>
            <h1 className="mt-5 text-4xl md:text-6xl font-extrabold text-white leading-[1.05]">
              Find hands.
              <br />
              Hire <span className="text-amber-300">fast.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-400 max-w-lg">
              Hustle is where cooks, electricians, riders, masons and farm hands
              get seen and hired — by people nearby, today. Your work is your CV.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register?type=worker"
                className="rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-7 py-3 text-sm"
              >
                Find work
              </Link>
              <Link
                to="/register?type=hirer"
                className="rounded-full border border-slate-600 hover:border-amber-400 hover:text-amber-300 text-white font-semibold px-7 py-3 text-sm"
              >
                Hire someone
              </Link>
            </div>
            <div className="mt-7 flex gap-6 text-sm">
              {[
                ['Free', 'to join'],
                ['60s', 'to sign up'],
                ['0%', 'agency fees'],
              ].map(([big, small]) => (
                <div key={small}>
                  <p className="text-2xl font-extrabold text-white">{big}</p>
                  <p className="text-slate-500 text-xs">{small}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live gigs mock */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Fresh gigs near you
              </p>
              <span className="text-xs text-emerald-400">● live</span>
            </div>
            {demoGigs.map((g) => (
              <div
                key={g.title}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-white leading-snug">{g.title}</p>
                  <span
                    className={`shrink-0 text-xs font-semibold rounded-full border px-2 py-0.5 ${g.chip}`}
                  >
                    {g.collar}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-slate-400">{g.where}</span>
                  <span className="text-amber-300 font-bold">{g.pay}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{g.apps} applicants · agree pay directly</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-y border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto whitespace-nowrap text-xs text-slate-400">
          {['Plumber', 'Caregiver', 'Solar installer', 'Cook', 'Rider', 'Mason', 'Cleaner', 'Security guard', 'Hair stylist', 'Welder', 'Farm hand', 'Painter', 'Mechanic', 'Nanny'].map(
            (r) => (
              <span key={r} className="rounded-full border border-slate-800 px-3 py-1 shrink-0">
                {r}
              </span>
            ),
          )}
        </div>
      </div>

      {/* Collars */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Every collar welcome</p>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-white">
          The work LinkedIn forgot.
        </h2>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Four kinds of collar, one profile: what you've actually done, rated by
          people who actually hired you.
        </p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {collars.map((c) => (
            <div key={c.name} className={`rounded-2xl border p-5 bg-slate-900 ${c.color}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{c.emoji}</span>
                <h3 className="font-bold text-white">{c.name}</h3>
              </div>
              <p className="text-sm text-slate-400 mt-2">{c.desc}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {c.roles.map((r) => (
                  <li key={r} className={`text-xs rounded-full px-2 py-1 ${c.chip}`}>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">How it works</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-white">
            From phone to paycheck in three moves.
          </h2>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {steps.map(([title, desc], i) => (
              <div key={title} className="rounded-2xl bg-slate-950 border border-slate-800 p-5">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-extrabold">
                  {i + 1}
                </span>
                <p className="font-bold text-white mt-3">{title}</p>
                <p className="text-sm text-slate-400 mt-1">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
              <h3 className="font-bold text-white text-lg">Workers</h3>
              <p className="text-sm text-slate-400 mt-1">
                Show your work, get matched to gigs nearby, agree terms yourself.
              </p>
              <Link
                to="/register?type=worker"
                className="inline-block mt-4 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-5 py-2.5 text-sm"
              >
                Create worker profile
              </Link>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
              <h3 className="font-bold text-white text-lg">Hirers</h3>
              <p className="text-sm text-slate-400 mt-1">
                Post what you need in 60 seconds. Pick from rated, nearby people.
              </p>
              <Link
                to="/register?type=hirer"
                className="inline-block mt-4 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-2.5 text-sm"
              >
                Post your first gig
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Hustle */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Why Hustle</p>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-white max-w-2xl">
          Built for people who work with their hands.
        </h2>
        <div className="mt-8 grid sm:grid-cols-3 gap-4 text-sm">
          {[
            ['📹 Skills, not paperwork', 'Photos and videos of real work beat certificates. Repeat-hire badges beat buzzwords.'],
            ['📍 Local and fast', "Today's shift, this weekend, or full-time — matched with people nearby."],
            ['🤝 You deal direct', 'Every gig shows pay and details up front. Hustle connects you — you agree, no middleman cut.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
              <p className="font-bold text-white">{t}</p>
              <p className="text-slate-400 mt-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-4 text-sm">
          {[
            ['“No one asked for my certificate. They watched my tiling video and hired me same day.”', 'Daniel · Tiler, Accra'],
            ['“I feed 3 kids from weekend cooking gigs. My stars are my CV now.”', 'Fatima · Cook, Jakarta'],
            ['“Our shop restocks every week with the same rider. Reliable is everything.”', 'Sofia · Shop owner, Lima'],
          ].map(([q, who]) => (
            <figure key={who} className="rounded-2xl bg-slate-950 border border-slate-800 p-5">
              <blockquote className="text-slate-200">{q}</blockquote>
              <figcaption className="text-slate-500 mt-3">{who}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 p-8 md:p-14 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Your hustle deserves to be seen.
          </h2>
          <p className="mt-3 font-medium text-slate-900/80">
            Join free. One minute. Phone-friendly and low-data.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/register?type=worker"
              className="rounded-full bg-slate-950 text-white font-bold px-7 py-3 text-sm"
            >
              Find work
            </Link>
            <Link
              to="/register?type=hirer"
              className="rounded-full bg-white/90 font-bold px-7 py-3 text-sm"
            >
              Hire now
            </Link>
          </div>
        </div>
        <footer className="mt-10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p className="font-bold text-slate-400">Hustle</p>
          <p>Pink · Gray · Blue · Green collar — the work LinkedIn forgot.</p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-slate-300">Log in</Link>
            <Link to="/register" className="hover:text-slate-300">Join</Link>
          </div>
        </footer>
      </section>
    </div>
  )
}
