import { useEffect, useState } from 'react'
import { logout, request } from '../api'

function bookingUrl(type = 'desk') {
  const url = new URL('/availability-floor-map.html', window.location.origin)
  if (type !== 'desk') url.searchParams.set('bookingType', type)
  return url.pathname + url.search
}

function BookingLink({ type = 'desk', className, children }) {
  return <a className={className} href={bookingUrl(type)}>{children}</a>
}

function Brand() {
  return (
    <a className="landing-brand" href="/" aria-label="FLEXDESK home">
      <span className="brand-mark">F</span>
      <span>FLEXDESK<small>SMART WORKSPACE SYSTEM</small></span>
    </a>
  )
}

export default function LandingPage() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const callback = new URLSearchParams(window.location.hash.slice(1))
    const accessToken = callback.get('access_token')
    const ssoError = callback.get('sso_error')
    if (accessToken) sessionStorage.setItem('flexdesk_token', accessToken)
    if (accessToken || ssoError) window.history.replaceState(null, '', window.location.pathname + window.location.search)
    if (ssoError) {
      window.location.replace(`/login.html?sso_error=${encodeURIComponent(ssoError)}`)
      return
    }
    if (!sessionStorage.getItem('flexdesk_token')) {
      setReady(true)
      return
    }
    request('/auth/me').then((user) => {
      sessionStorage.setItem('flexdesk_user', JSON.stringify(user))
      if (user.role === 'admin') {
        window.location.replace('/admin.html')
        return
      }
      setReady(true)
    }).catch(() => {
      sessionStorage.removeItem('flexdesk_token')
      sessionStorage.removeItem('flexdesk_user')
      window.location.replace(`/login.html?error=session&next=${encodeURIComponent(window.location.pathname + window.location.search)}`)
    })
  }, [])

  if (!ready) return <main className="app-loading" aria-live="polite">Loading FLEXDESK…</main>

  return (
    <div className="landing">
      <header className="landing-header">
        <Brand />
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="/">Home</a>
          <BookingLink>Find a Desk</BookingLink>
          <BookingLink type="meeting room">Meeting Rooms</BookingLink>
          <a href="#office-spaces">Amenities</a>
          <a href="#intelligence">About</a>
          <a href="/my-bookings.html">My Bookings</a>
        </nav>
        {sessionStorage.getItem('flexdesk_token')
          ? <><button className="landing-header-cta" onClick={() => window.location.assign(bookingUrl())}>Book Your Workspace <span>↗</span></button><button className="landing-logout" onClick={() => logout().catch((error) => window.alert(error.message))}>Logout</button></>
          : <a className="landing-header-cta" href="/login.html">Login / Get Started <span>↗</span></a>}
      </header>
      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="landing-eyebrow"><i /> THE FUTURE OF WORK, IN ONE PLACE</span>
            <h1>FLEXDESK</h1>
            <h2>Smart Workspace.<br /><em>Smarter Workdays.</em></h2>
            <p>Find, book and manage your ideal workspace with an intelligent workplace experience designed for modern teams.</p>
            <div className="hero-actions">
              <BookingLink className="landing-button button-dark">Book a Desk <span>→</span></BookingLink>
              <a className="landing-button button-light" href="#workspace-types">Explore Workspace <span>↘</span></a>
            </div>
            <div className="hero-proof"><div className="proof-avatars"><b>J</b><b>M</b><b>A</b><b>+</b></div><span><strong>Built around your workday</strong><br />Flexible spaces for modern teams</span></div>
          </div>
          <div className="hero-visual" role="img" aria-label="Bright modern office with flexible desks and shared workspace">
            <div className="hero-image" /><div className="visual-shade" />
            <div className="visual-top"><span><i /> WORKSPACE OVERVIEW</span><span className="live-pill">LIVE</span></div>
            <div className="floor-card">
              <div className="floor-card-head"><span><small>YOUR OFFICE</small><strong>Northstar · Floor 04</strong></span><span className="floor-count"><b>82%</b><small>available</small></span></div>
              <div className="mini-floor"><div className="floor-room room-open"><span>OPEN WORKSPACE</span><div className="desk-grid">{Array.from({ length: 8 }, (_, i) => <i key={i} />)}</div></div><div className="floor-room room-meet"><span>MEETING</span><b>↗</b></div><div className="floor-room room-focus"><span>FOCUS</span><b>↗</b></div><div className="floor-room room-lounge"><span>LOUNGE</span><b>↗</b></div></div>
              <div className="floor-legend"><span><i /> Available</span><span><i /> Your space</span><span>12 desks nearby</span></div>
            </div>
            <div className="availability-float"><span className="availability-icon">✓</span><span><strong>Desk D-24 is ready</strong><small>2 mins walk · Floor 04</small></span><b>↗</b></div>
          </div>
        </section>
        <div className="trust-strip"><span>MADE FOR TEAMS THAT MOVE FORWARD</span><div><b>northstar</b><b>vertex<span>+</span></b><b>◎ orbit</b><b>UPFIELD</b><b>cirrus</b></div></div>
        <section className="landing-section features-section" id="features">
          <div className="section-heading"><span className="landing-eyebrow">ONE PLATFORM, MORE POSSIBILITIES</span><h2>Everything You Need for a<br /><em>Smarter Workspace</em></h2><p>Bring every part of your workplace experience together, from the first search to the start of your day.</p></div>
          <div className="feature-grid">
            <article className="feature-card"><span className="feature-icon icon-green">⌖</span><h3>Smart Desk Booking</h3><p>Find and reserve available desks quickly, wherever your work takes you.</p><BookingLink>Find your desk <b>↗</b></BookingLink></article>
            <article className="feature-card"><span className="feature-icon icon-lilac">▦</span><h3>Meeting Room Booking</h3><p>Book meeting and conference rooms by availability and capacity.</p><BookingLink type="meeting room">Find a room <b>↗</b></BookingLink></article>
            <article className="feature-card"><span className="feature-icon icon-yellow">✳</span><h3>AI Recommendations</h3><p>Get workspace recommendations shaped around your preferences and usage.</p><a href="#intelligence">Explore intelligence <b>↗</b></a></article>
            <article className="feature-card"><span className="feature-icon icon-blue">⌁</span><h3>Demand Prediction</h3><p>Understand workspace demand and occupancy patterns across your office.</p><a href="#intelligence">See how it works <b>↗</b></a></article>
            <article className="feature-card"><span className="feature-icon icon-peach">◈</span><h3>Smart Optimization</h3><p>Make the most of every square foot with intelligent space insights.</p><a href="#intelligence">Discover more <b>↗</b></a></article>
            <article className="feature-card"><span className="feature-icon icon-mint">☏</span><h3>Conversational Assistant</h3><p>Get help finding your next workspace through a simple conversation.</p><a href="#intelligence">Meet your assistant <b>↗</b></a></article>
          </div>
        </section>
        <section className="landing-section workspace-section" id="workspace-types">
          <div className="section-heading section-heading-row"><div><span className="landing-eyebrow">A PLACE FOR EVERY KIND OF WORK</span><h2>Choose Your Perfect<br /><em>Workspace</em></h2></div><BookingLink className="text-link">Explore all spaces <span>→</span></BookingLink></div>
          <div className="workspace-grid">
            <BookingLink className="space-card space-hot"><span>01 / FOCUS &amp; FLOW</span><strong>Hot Desk</strong><b>↗</b></BookingLink>
            <BookingLink type="focus room" className="space-card space-focus"><span>02 / FIND YOUR FOCUS</span><strong>Focus Room</strong><b>↗</b></BookingLink>
            <BookingLink type="meeting room" className="space-card space-meeting"><span>03 / BRING IDEAS TOGETHER</span><strong>Meeting Room</strong><b>↗</b></BookingLink>
            <BookingLink className="space-card space-collab"><span>04 / MAKE IT HAPPEN</span><strong>Collaboration Space</strong><b>↗</b></BookingLink>
            <BookingLink className="space-card space-private"><span>05 / YOUR OWN CORNER</span><strong>Private Workspace</strong><b>↗</b></BookingLink>
            <BookingLink type="meeting room" className="space-card space-training"><span>06 / LEARN &amp; GROW</span><strong>Training Room</strong><b>↗</b></BookingLink>
          </div>
        </section>
        <section className="how-section"><div className="landing-section how-inner"><div className="section-heading"><span className="landing-eyebrow">A BETTER WORKDAY STARTS HERE</span><h2>From search to seat<br />in <em>three simple steps.</em></h2></div><div className="steps"><article><span className="step-number">01</span><span className="step-icon">⌕</span><h3>Search</h3><p>Find a location, floor and workspace that fits your day.</p></article><i className="step-connector" /><article><span className="step-number">02</span><span className="step-icon">▤</span><h3>Select</h3><p>Choose an available desk or room in just a few clicks.</p></article><i className="step-connector" /><article><span className="step-number">03</span><span className="step-icon">✓</span><h3>Book</h3><p>Confirm your booking and get ready for a great workday.</p></article></div></div></section>
        <section className="intelligence-section" id="intelligence">
          <div className="intelligence-visual"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="intelligence-core"><span>F</span><small>FLEXDESK INTELLIGENCE</small></div><div className="insight-chip insight-a">✳ &nbsp;Personalized for you</div><div className="insight-chip insight-b">⌁ &nbsp;Demand forecast</div><div className="insight-chip insight-c">◈ &nbsp;Space optimized</div><div className="insight-chip insight-d">◎ &nbsp;Occupancy insights</div></div>
          <div className="intelligence-copy"><span className="landing-eyebrow">WORKPLACE, WITH A LITTLE MORE WISDOM</span><h2>Powered by<br /><em>Intelligence</em></h2><p>Make better workplace decisions with smart insights that keep people and spaces working in sync.</p><ul><li>Personalized recommendations for every workday</li><li>Workspace demand prediction and occupancy insights</li><li>Intelligent space optimization</li><li>Conversational assistance, whenever you need it</li></ul><BookingLink className="landing-button button-dark">Find your workspace <span>→</span></BookingLink></div>
        </section>
        <section className="landing-section environment-section" id="office-spaces"><div className="section-heading section-heading-row"><div><span className="landing-eyebrow">MORE THAN A PLACE TO SIT</span><h2>Spaces that make<br /><em>work feel better.</em></h2></div><p>From focused moments to big ideas, find the right setting for everything your team does.</p></div><div className="environment-grid"><div className="environment-photo env-open"><span>OPEN WORKSPACE</span></div><div className="environment-photo env-cafe"><span>CAFETERIA</span></div><div className="environment-photo env-meet"><span>MEETING ROOMS</span></div><div className="environment-photo env-play"><span>RECREATION</span></div><div className="environment-photo env-focus"><span>FOCUS ROOMS</span></div><div className="environment-photo env-collab"><span>COLLABORATION</span></div><div className="environment-photo env-wellness"><span>WELLNESS</span></div></div></section>
        <section className="stats-band"><div><strong>500<span>+</span></strong><small>Workspaces</small></div><div><strong>50<span>+</span></strong><small>Meeting Rooms</small></div><div><strong>10<span>+</span></strong><small>Workspace Zones</small></div><div><strong>24/7</strong><small>Smart Availability</small></div></section>
        <section className="landing-cta" id="about"><div className="cta-orb" /><span className="landing-eyebrow">YOUR NEXT GREAT WORKDAY STARTS HERE</span><h2>Ready to find your<br /><em>perfect workspace?</em></h2><p>Make every workday more flexible, productive and connected with FLEXDESK.</p><BookingLink className="landing-button button-lime">Book Your Workspace <span>→</span></BookingLink><div className="cta-note">Find your space. Find your flow.</div></section>
      </main>
      <footer className="landing-footer"><div className="footer-main"><div className="footer-brand"><Brand footer /><p>Thoughtful spaces. Smarter workdays.</p></div><div className="footer-links"><strong>QUICK LINKS</strong><BookingLink>Find a Desk</BookingLink><BookingLink type="meeting room">Meeting Rooms</BookingLink><a href="#office-spaces">Amenities</a><a href="#intelligence">About</a></div><div className="footer-links"><strong>INFORMATION</strong><a href="#contact">Contact</a><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div><div className="footer-contact"><span>WORK BETTER, TOGETHER.</span><BookingLink>Discover your workspace ↗</BookingLink></div></div><div className="footer-bottom"><span>© 2026 FLEXDESK. Smart work starts here.</span><span>Designed for the way you work.</span></div></footer>
    </div>
  )
}
