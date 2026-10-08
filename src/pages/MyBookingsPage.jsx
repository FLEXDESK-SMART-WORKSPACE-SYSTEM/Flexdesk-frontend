import { useEffect, useMemo, useState } from 'react'
import { requireEmployeeSession } from '../api'

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function isUpcoming(booking, now = new Date()) {
  return booking.status !== 'cancelled' && new Date(`${booking.date}T${booking.to || '23:59'}:00`) >= now
}

export default function MyBookingsPage() {
  const user = requireEmployeeSession()
  const storageKey = user ? `flexdesk_bookings_${user.id}` : null
  const [bookings, setBookings] = useState([])
  const [activeView, setActiveView] = useState('upcoming')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!storageKey) return
    try {
      const stored = localStorage.getItem(storageKey)
      const parsed = stored ? JSON.parse(stored) : []
      if (!Array.isArray(parsed)) throw new Error('Saved booking data is invalid.')
      setBookings(parsed)
    } catch (loadError) {
      setError(`Could not load saved bookings: ${loadError.message}`)
    }
  }, [storageKey])

  const visible = useMemo(() => bookings.filter((booking) => (
    activeView === 'upcoming' ? isUpcoming(booking) : !isUpcoming(booking)
  )).sort((left, right) => `${left.date}T${left.from}`.localeCompare(`${right.date}T${right.from}`)), [bookings, activeView])

  function cancelBooking(bookingId) {
    const updated = bookings.map((booking) => booking.bookingId === bookingId && isUpcoming(booking)
      ? { ...booking, status: 'cancelled', cancelledAt: new Date().toISOString() }
      : booking)
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
      setBookings(updated)
      setError('')
    } catch (saveError) {
      setError(`Could not cancel this booking: ${saveError.message}`)
    }
  }

  useEffect(() => {
    if (!storageKey) return undefined
    function syncBookings(event) {
      if (event.key && event.key !== storageKey) return
      try {
        const raw = localStorage.getItem(storageKey)
        const parsed = raw ? JSON.parse(raw) : []
        if (!Array.isArray(parsed)) throw new Error('Saved booking data is invalid.')
        setBookings(parsed)
        setError('')
      } catch (loadError) {
        setError(`Could not load saved bookings: ${loadError.message}`)
      }
    }
    window.addEventListener('storage', syncBookings)
    return () => window.removeEventListener('storage', syncBookings)
  }, [storageKey])

  if (!user) return null

  return (
    <div className="bookings-page">
      <header className="bookings-topbar"><a className="bookings-brand" href="/">FLEXDESK</a><span>Smart Workspace System</span><a className="bookings-home" href="/">← Home</a></header>
      <main className="bookings-main">
        <span className="bookings-eyebrow">YOUR WORKSPACE, ALL IN ONE PLACE</span>
        <h1>My Bookings</h1>
        <p className="bookings-intro">Review upcoming workdays, revisit your booking history, or cancel an upcoming workspace.</p>
        <div className="bookings-tabs" role="tablist" aria-label="Booking views">
          <button type="button" role="tab" aria-selected={activeView === 'upcoming'} onClick={() => setActiveView('upcoming')}>Upcoming</button>
          <button type="button" role="tab" aria-selected={activeView === 'history'} onClick={() => setActiveView('history')}>History</button>
        </div>
        {error && <p className="bookings-alert" role="alert">{error}</p>}
        <section className="booking-list" role="tabpanel" aria-live="polite">
          {!visible.length
            ? <div className="booking-empty"><strong>{activeView === 'upcoming' ? 'No upcoming bookings' : 'No booking history yet'}</strong>{activeView === 'upcoming' ? 'Once you book a workspace, it will appear here.' : 'Past and cancelled bookings will be collected here.'}</div>
            : visible.map((booking) => {
              const upcoming = isUpcoming(booking)
              const status = booking.status === 'cancelled' ? 'Cancelled' : upcoming ? 'Confirmed' : 'Completed'
              const name = booking.name || booking.id
              const details = [
                ['Location', booking.location], ['Floor', booking.floor], ['Bay', booking.bay],
                ['Booking Type', booking.bookingType || booking.type], ['Desk / Room', name],
                ['Date', formatDate(booking.date)], ['From', booking.from], ['To', booking.to],
                ['Lunch', booking.lunch ? 'Yes' : 'No'], ['Snacks', booking.snacks ? 'Yes' : 'No']
              ]
              return (
                <article className="booking-card" key={booking.bookingId}>
                  <div className="booking-card-heading"><strong>{name}</strong><span className={`booking-status ${status.toLowerCase()}`}>{status}</span></div>
                  <dl className="booking-details">{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
                  {upcoming && <div className="booking-card-actions"><button type="button" onClick={() => cancelBooking(booking.bookingId)}>Cancel booking</button></div>}
                </article>
              )
            })}
        </section>
      </main>
    </div>
  )
}
