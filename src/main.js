import './style.css'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8002/api/v1'
const app = document.querySelector('#app')
function request(path, options = {}) { const token = sessionStorage.getItem('flexdesk_token'); return fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } }).then(async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.detail || data?.message || 'Request failed');
  return data
}) }
function landingPage() {
  app.innerHTML = `<div class="landing">
    <header class="landing-header"><a class="landing-brand" href="/" aria-label="FLEXDESK home"><span class="brand-mark">F</span><span>FLEXDESK<small>SMART WORKSPACE SYSTEM</small></span></a><nav class="landing-nav" aria-label="Main navigation"><a href="/">Home</a><a href="#" data-booking="desk">Find a Desk</a><a href="#" data-booking="meeting room">Meeting Rooms</a><a href="#office-spaces">Amenities</a><a href="#intelligence">About</a><a href="/my-bookings.html">My Bookings</a></nav><a class="landing-header-cta" href="#" data-booking="desk">Book Your Workspace <span>↗</span></a></header>
    <main>
      <section class="landing-hero">
        <div class="hero-copy"><span class="landing-eyebrow"><i></i> THE FUTURE OF WORK, IN ONE PLACE</span><h1>FLEXDESK</h1><h2>Smart Workspace.<br><em>Smarter Workdays.</em></h2><p>Find, book and manage your ideal workspace with an intelligent workplace experience designed for modern teams.</p><div class="hero-actions"><a class="landing-button button-dark" href="#" data-booking="desk">Book a Desk <span>→</span></a><a class="landing-button button-light" href="#workspace-types">Explore Workspace <span>↘</span></a></div><div class="hero-proof"><div class="proof-avatars"><b>J</b><b>M</b><b>A</b><b>+</b></div><span><strong>Built around your workday</strong><br>Flexible spaces for modern teams</span></div></div>
        <div class="hero-visual" role="img" aria-label="Bright, modern office with flexible desks and shared workspace"><div class="hero-image"></div><div class="visual-shade"></div><div class="visual-top"><span><i></i> WORKSPACE OVERVIEW</span><span class="live-pill">LIVE</span></div><div class="floor-card"><div class="floor-card-head"><span><small>YOUR OFFICE</small><strong>Northstar · Floor 04</strong></span><span class="floor-count"><b>82%</b><small>available</small></span></div><div class="mini-floor"><div class="floor-room room-open"><span>OPEN WORKSPACE</span><div class="desk-grid"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="floor-room room-meet"><span>MEETING</span><b>↗</b></div><div class="floor-room room-focus"><span>FOCUS</span><b>↗</b></div><div class="floor-room room-lounge"><span>LOUNGE</span><b>↗</b></div></div><div class="floor-legend"><span><i></i> Available</span><span><i></i> Your space</span><span>12 desks nearby</span></div></div><div class="availability-float"><span class="availability-icon">✓</span><span><strong>Desk D-24 is ready</strong><small>2 mins walk · Floor 04</small></span><b>↗</b></div></div>
      </section>
      <div class="trust-strip"><span>MADE FOR TEAMS THAT MOVE FORWARD</span><div><b>northstar</b><b>vertex<span>+</span></b><b>◎ orbit</b><b>UPFIELD</b><b>cirrus</b></div></div>
      <section class="landing-section features-section" id="features"><div class="section-heading"><span class="landing-eyebrow">ONE PLATFORM, MORE POSSIBILITIES</span><h2>Everything You Need for a<br><em>Smarter Workspace</em></h2><p>Bring every part of your workplace experience together, from the first search to the start of your day.</p></div><div class="feature-grid">
        <article class="feature-card"><span class="feature-icon icon-green">⌖</span><h3>Smart Desk Booking</h3><p>Find and reserve available desks quickly, wherever your work takes you.</p><a href="#" data-booking="desk">Find your desk <b>↗</b></a></article>
        <article class="feature-card"><span class="feature-icon icon-lilac">▦</span><h3>Meeting Room Booking</h3><p>Book meeting and conference rooms by availability and capacity.</p><a href="#" data-booking="meeting room">Find a room <b>↗</b></a></article>
        <article class="feature-card"><span class="feature-icon icon-yellow">✳</span><h3>AI Recommendations</h3><p>Get workspace recommendations shaped around your preferences and usage.</p><a href="#intelligence">Explore intelligence <b>↗</b></a></article>
        <article class="feature-card"><span class="feature-icon icon-blue">⌁</span><h3>Demand Prediction</h3><p>Understand workspace demand and occupancy patterns across your office.</p><a href="#intelligence">See how it works <b>↗</b></a></article>
        <article class="feature-card"><span class="feature-icon icon-peach">◈</span><h3>Smart Optimization</h3><p>Make the most of every square foot with intelligent space insights.</p><a href="#intelligence">Discover more <b>↗</b></a></article>
        <article class="feature-card"><span class="feature-icon icon-mint">☏</span><h3>Conversational Assistant</h3><p>Get help finding your next workspace through a simple conversation.</p><a href="#intelligence">Meet your assistant <b>↗</b></a></article>
      </div></section>
      <section class="landing-section workspace-section" id="workspace-types"><div class="section-heading section-heading-row"><div><span class="landing-eyebrow">A PLACE FOR EVERY KIND OF WORK</span><h2>Choose Your Perfect<br><em>Workspace</em></h2></div><a class="text-link" href="#" data-booking="desk">Explore all spaces <span>→</span></a></div><div class="workspace-grid">
        <a href="#" data-booking="desk" class="space-card space-hot"><span>01 / FOCUS & FLOW</span><strong>Hot Desk</strong><b>↗</b></a><a href="#" data-booking="focus room" class="space-card space-focus"><span>02 / FIND YOUR FOCUS</span><strong>Focus Room</strong><b>↗</b></a><a href="#" data-booking="meeting room" class="space-card space-meeting"><span>03 / BRING IDEAS TOGETHER</span><strong>Meeting Room</strong><b>↗</b></a><a href="#" data-booking="desk" class="space-card space-collab"><span>04 / MAKE IT HAPPEN</span><strong>Collaboration Space</strong><b>↗</b></a><a href="#" data-booking="desk" class="space-card space-private"><span>05 / YOUR OWN CORNER</span><strong>Private Workspace</strong><b>↗</b></a><a href="#" data-booking="meeting room" class="space-card space-training"><span>06 / LEARN & GROW</span><strong>Training Room</strong><b>↗</b></a>
      </div></section>
      <section class="how-section"><div class="landing-section how-inner"><div class="section-heading"><span class="landing-eyebrow">A BETTER WORKDAY STARTS HERE</span><h2>From search to seat<br>in <em>three simple steps.</em></h2></div><div class="steps"><article><span class="step-number">01</span><span class="step-icon">⌕</span><h3>Search</h3><p>Find a location, floor and workspace that fits your day.</p></article><i class="step-connector"></i><article><span class="step-number">02</span><span class="step-icon">▤</span><h3>Select</h3><p>Choose an available desk or room in just a few clicks.</p></article><i class="step-connector"></i><article><span class="step-number">03</span><span class="step-icon">✓</span><h3>Book</h3><p>Confirm your booking and get ready for a great workday.</p></article></div></div></section>
      <section class="intelligence-section" id="intelligence"><div class="intelligence-visual"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="intelligence-core"><span>F</span><small>FLEXDESK INTELLIGENCE</small></div><div class="insight-chip insight-a">✳ &nbsp;Personalized for you</div><div class="insight-chip insight-b">⌁ &nbsp;Demand forecast</div><div class="insight-chip insight-c">◈ &nbsp;Space optimized</div><div class="insight-chip insight-d">◎ &nbsp;Occupancy insights</div></div><div class="intelligence-copy"><span class="landing-eyebrow">WORKPLACE, WITH A LITTLE MORE WISDOM</span><h2>Powered by<br><em>Intelligence</em></h2><p>Make better workplace decisions with smart insights that keep people and spaces working in sync.</p><ul><li>Personalized recommendations for every workday</li><li>Workspace demand prediction and occupancy insights</li><li>Intelligent space optimization</li><li>Conversational assistance, whenever you need it</li></ul><a class="landing-button button-dark" href="#" data-booking="desk">Find your workspace <span>→</span></a></div></section>
      <section class="landing-section environment-section" id="office-spaces"><div class="section-heading section-heading-row"><div><span class="landing-eyebrow">MORE THAN A PLACE TO SIT</span><h2>Spaces that make<br><em>work feel better.</em></h2></div><p>From focused moments to big ideas, find the right setting for everything your team does.</p></div><div class="environment-grid"><div class="environment-photo env-open"><span>OPEN WORKSPACE</span></div><div class="environment-photo env-cafe"><span>CAFETERIA</span></div><div class="environment-photo env-meet"><span>MEETING ROOMS</span></div><div class="environment-photo env-play"><span>RECREATION</span></div><div class="environment-photo env-focus"><span>FOCUS ROOMS</span></div><div class="environment-photo env-collab"><span>COLLABORATION</span></div><div class="environment-photo env-wellness"><span>WELLNESS</span></div></div></section>
      <section class="stats-band"><div><strong>500<span>+</span></strong><small>Workspaces</small></div><div><strong>50<span>+</span></strong><small>Meeting Rooms</small></div><div><strong>10<span>+</span></strong><small>Workspace Zones</small></div><div><strong>24/7</strong><small>Smart Availability</small></div></section>
      <section class="landing-cta" id="about"><div class="cta-orb"></div><span class="landing-eyebrow">YOUR NEXT GREAT WORKDAY STARTS HERE</span><h2>Ready to find your<br><em>perfect workspace?</em></h2><p>Make every workday more flexible, productive and connected with FLEXDESK.</p><a class="landing-button button-lime" href="#" data-booking="desk">Book Your Workspace <span>→</span></a><div class="cta-note">Find your space. Find your flow.</div></section>
    </main>
    <footer class="landing-footer"><div class="footer-main"><div class="footer-brand"><a class="landing-brand" href="/"><span class="brand-mark">F</span><span>FLEXDESK<small>SMART WORKSPACE SYSTEM</small></span></a><p>Thoughtful spaces. Smarter workdays.</p></div><div class="footer-links"><strong>QUICK LINKS</strong><a href="#" data-booking="desk">Find a Desk</a><a href="#" data-booking="meeting room">Meeting Rooms</a><a href="#office-spaces">Amenities</a><a href="#intelligence">About</a></div><div class="footer-links"><strong>GET IN TOUCH</strong><a href="mailto:hello@flexdesk.example">Contact</a><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div><div class="footer-contact"><span>WORK BETTER, TOGETHER.</span><a href="#" data-booking="desk">Discover your workspace ↗</a></div></div><div class="footer-bottom"><span>© 2026 FLEXDESK. Smart work starts here.</span><span>Designed for the way you work.</span></div></footer>
  </div>`;
  document.querySelectorAll('[data-booking]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    const url = new URL('/availability-floor-map.html', window.location.origin);
    if (link.dataset.booking !== 'desk') url.searchParams.set('bookingType', link.dataset.booking);
    window.location.assign(url);
  }))
}
async function logout() {
  try {
    await request('/auth/logout', { method: 'POST' });
  } catch (error) {
    window.alert(`The server could not record logout: ${error.message}`);
  } finally {
    sessionStorage.removeItem('flexdesk_token');
    sessionStorage.removeItem('flexdesk_user');
    window.location.replace('/login.html');
  }
}

async function startApp() {
  localStorage.removeItem('flexdesk_token');
  localStorage.removeItem('flexdesk_user');
  const callback = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = callback.get('access_token');
  const ssoError = callback.get('sso_error');
  if (accessToken) sessionStorage.setItem('flexdesk_token', accessToken);
  if (accessToken || ssoError) window.history.replaceState(null, '', window.location.pathname + window.location.search);

  if (ssoError) {
    window.location.replace(`/login.html?sso_error=${encodeURIComponent(ssoError)}`);
    return;
  }
  if (!sessionStorage.getItem('flexdesk_token')) {
    window.location.replace('/login.html');
    return;
  }

  try {
    const user = await request('/auth/me');
    sessionStorage.setItem('flexdesk_user', JSON.stringify(user));
    if (user.role === 'admin') {
      window.location.replace('/admin.html');
      return;
    }
    landingPage();
    const button = document.createElement('button');
    button.className = 'landing-header-cta';
    button.type = 'button';
    button.textContent = 'Logout';
    button.addEventListener('click', logout);
    document.querySelector('.landing-header').append(button);
  } catch (error) {
    sessionStorage.removeItem('flexdesk_token');
    sessionStorage.removeItem('flexdesk_user');
    window.location.replace(`/login.html?error=session&next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  }
}

startApp()
