import './style.css'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8002/api/v1'
const app = document.querySelector('#app')
const state = { user: JSON.parse(localStorage.getItem('flexdesk_user') || 'null'), offices: [], date: nextDay(), month: new Date(), floor: null, bay: null, type: 'desk', workspace: null }

function dateKey(value) { return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 10) }
function nextDay() { const value = new Date(); value.setDate(value.getDate() + 1); return dateKey(value) }
function request(path, options = {}) { const token = localStorage.getItem('flexdesk_token'); return fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } }).then(async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.detail || data?.message || 'Request failed');
  return data
}) }
function dateText(value) { return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) }
function toast(message) { const node = document.querySelector('#toast'); if (!node) return; node.textContent = message; node.classList.add('visible'); setTimeout(() => node.classList.remove('visible'), 2500) }
function shell(content) { app.innerHTML = `<div class="app"><header class="top"><div class="wordmark"><strong>FLEXDESK</strong></div><span class="company">Workspace booking</span><button class="dots">•••</button></header><nav class="bar"><strong>FLEXDESK</strong><button data-screen="home">Home</button><button data-screen="history">My bookings</button><span class="person"><span id="user-name"></span><em>●</em></span></nav>${content}</div><div id="toast" class="toast"></div>`; document.querySelector('#user-name').textContent = state.user?.name || 'Signed in'; document.querySelector('[data-screen="home"]').onclick = home; document.querySelector('[data-screen="history"]').onclick = history }
function home() { shell(`<main class="home"><div class="welcome"><span>WORKSPACE MANAGEMENT</span><h1>Find a better place to work.</h1><p>Choose a location, find an available workspace, and book it in a few steps.</p></div><div class="home-actions"><button class="action-card" id="start"><span>NEW BOOKING</span><h2>Reserve a workspace</h2><p>Browse offices, floors, bays, and available desks.</p><b>Start booking →</b></button><button class="action-card second" id="open-history"><span>BOOKING HISTORY</span><h2>Review your bookings</h2><p>View your upcoming and past workspace reservations.</p><b>Open history →</b></button></div></main>`); document.querySelector('#start').onclick = booking; document.querySelector('#open-history').onclick = history }
function booking() { shell(`<main class="booking"><div class="page-heading"><button id="back">←</button><div><span>NEW RESERVATION</span><h1>Select your workspace</h1></div></div><div class="booking-grid"><section class="form-panel"><label>Location<select id="office"></select></label><label>Floor<select id="floor"></select></label><label>Bay<select id="bay"></select></label><label>Workspace type<select id="type"><option value="desk">Desk</option><option value="focus room">Focus room</option><option value="meeting room">Meeting room</option></select></label><div class="time-row"><label>From<input id="from" type="time" value="09:00"></label><label>To<input id="to" type="time" value="17:00"></label></div><button class="primary book" id="book">Book selected workspace</button></section><section class="calendar-panel"><div class="calendar-head"><button id="prev">‹</button><h2 id="month"></h2><button id="next">›</button></div><div class="days-label"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div><div id="calendar" class="calendar"></div><p class="selected-date">Selected: <strong id="selected-date"></strong></p></section></div><section class="map-panel"><div class="map-head"><div><span>FLOOR MAP</span><h2 id="map-title">Available workspaces</h2></div><small id="map-count"></small></div><div id="map" class="map"></div></section></main>`); document.querySelector('#back').onclick = home; loadBooking() }
async function loadBooking() { try { state.offices = await request('/locations/hierarchy'); fillOffices(); renderCalendar(); bindBookingEvents() } catch (error) { toast(error.message) } }
function fill(select, items, label) { select.innerHTML = items.length ? items.map((item) => `<option value="${item.id}">${item.name}</option>`).join('') : `<option value="">${label}</option>` }
function fillOffices() { const office = document.querySelector('#office'); fill(office, state.offices, 'No locations'); office.onchange = updateFloors; updateFloors() }
function updateFloors() { const office = state.offices.find((item) => item.id === Number(document.querySelector('#office').value)); fill(document.querySelector('#floor'), office?.floors || [], 'No floors'); document.querySelector('#floor').onchange = updateBays; updateBays() }
function updateBays() { const office = state.offices.find((item) => item.id === Number(document.querySelector('#office').value)); state.floor = office?.floors.find((item) => item.id === Number(document.querySelector('#floor').value)); fill(document.querySelector('#bay'), state.floor?.bays || [], 'No bays'); document.querySelector('#bay').onchange = updateMap; updateMap() }
function updateMap() { const bay = state.floor?.bays.find((item) => item.id === Number(document.querySelector('#bay').value)); const type = document.querySelector('#type').value; const items = (bay?.workspaces || []).filter((item) => item.type === type); state.bay = bay; state.workspace = null; document.querySelector('#map-title').textContent = `${bay?.name || 'Workspace'} · ${type}`; document.querySelector('#map-count').textContent = `${items.length} available`; document.querySelector('#map').innerHTML = items.length ? items.map((item) => `<button class="node" data-id="${item.id}"><strong>${item.name}</strong><small>capacity ${item.capacity}</small></button>`).join('') : '<p class="empty">No workspaces of this type in this bay.</p>'; document.querySelectorAll('.node').forEach((node) => { node.onclick = () => { state.workspace = items.find((item) => item.id === Number(node.dataset.id)); document.querySelectorAll('.node').forEach((item) => item.classList.remove('selected')); node.classList.add('selected') } }) }
function renderCalendar() {
  const year = state.month.getFullYear(); const month = state.month.getMonth(); const first = new Date(year, month, 1).getDay(); const total = new Date(year, month + 1, 0).getDate();
  document.querySelector('#month').textContent = state.month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); document.querySelector('#selected-date').textContent = dateText(state.date);
  document.querySelector('#calendar').innerHTML = `${'<span></span>'.repeat(first)}${Array.from({ length: total }, (_, index) => { const date = new Date(year, month, index + 1); const value = dateKey(date); return `<button class="date ${value === state.date ? 'chosen' : ''}" data-date="${value}">${index + 1}</button>` }).join('')}`;
  document.querySelectorAll('.date').forEach((day) => day.onclick = () => { state.date = day.dataset.date; renderCalendar() })
}
function bindBookingEvents() { document.querySelector('#type').onchange = updateMap; document.querySelector('#prev').onclick = () => { state.month.setMonth(state.month.getMonth() - 1); renderCalendar() }; document.querySelector('#next').onclick = () => { state.month.setMonth(state.month.getMonth() + 1); renderCalendar() }; document.querySelector('#book').onclick = () => { if (!state.workspace) return toast('Select a workspace from the map first'); request('/bookings', { method: 'POST', body: JSON.stringify({ workspace_id: state.workspace.id, booking_date: state.date, start_time: document.querySelector('#from').value, end_time: document.querySelector('#to').value }) }).then(() => { toast('Workspace booked'); setTimeout(history, 600) }).catch((error) => toast(error.message)) } }
function history() { shell(`<main class="history"><div class="page-heading"><button id="back">←</button><div><span>MY BOOKINGS</span><h1>Booking history</h1></div></div><div id="history-list" class="history-list">Loading...</div></main>`); document.querySelector('#back').onclick = home; request('/bookings').then((bookings) => { document.querySelector('#history-list').innerHTML = bookings.length ? bookings.map((item) => `<article><strong>Workspace #${item.workspace_id}</strong><span>${item.booking_date} · ${item.start_time.slice(0, 5)}–${item.end_time.slice(0, 5)}</span><b>${item.status}</b></article>`).join('') : '<p class="empty">No bookings yet.</p>' }).catch((error) => toast(error.message)) }
async function startApp() {
  const callback = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = callback.get('access_token');
  const ssoError = callback.get('sso_error');
  if (accessToken) localStorage.setItem('flexdesk_token', accessToken);
  if (accessToken || ssoError) window.history.replaceState(null, '', window.location.pathname + window.location.search);

  if (localStorage.getItem('flexdesk_token')) {
    try {
      state.user = await request('/auth/me');
      localStorage.setItem('flexdesk_user', JSON.stringify(state.user));
      home();
      return;
    } catch {
      localStorage.removeItem('flexdesk_token');
      localStorage.removeItem('flexdesk_user');
    }
  }

  try {
    const demoUser = { email: 'demo@flexdesk.local', password: 'demo123' };
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify(demoUser) });
    localStorage.setItem('flexdesk_token', data.access_token);
    localStorage.setItem('flexdesk_user', JSON.stringify(data.user));
    state.user = data.user;
    home();
  } catch (error) {
    toast(error.message || 'Unable to open Flexdesk');
  }
}

startApp()
