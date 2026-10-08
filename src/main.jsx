import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import './pages.css'
import AdminPage from './pages/AdminPage'
import { ForgotPasswordPage, LoginPage } from './pages/AuthPages'
import FloorMapPage from './pages/FloorMapPage'
import LandingPage from './pages/LandingPage'
import MyBookingsPage from './pages/MyBookingsPage'

const pages = {
  '/': [LandingPage, 'FLEXDESK | Smart Workspace'],
  '/index.html': [LandingPage, 'FLEXDESK | Smart Workspace'],
  '/login.html': [LoginPage, 'FLEXDESK | Login'],
  '/forgot-password.html': [ForgotPasswordPage, 'FLEXDESK | Reset Password'],
  '/admin.html': [AdminPage, 'FLEXDESK | Admin'],
  '/availability-floor-map.html': [FloorMapPage, 'FLEXDESK | Check Availability'],
  '/my-bookings.html': [MyBookingsPage, 'FLEXDESK | My Bookings']
}

const [Page, title] = pages[window.location.pathname] || pages['/']
document.title = title
createRoot(document.getElementById('app')).render(<Page />)
