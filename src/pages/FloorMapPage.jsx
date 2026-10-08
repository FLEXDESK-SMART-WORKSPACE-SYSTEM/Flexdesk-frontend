import { useEffect, useRef, useState } from 'react'
import floorMapHtml from '../legacy/availability-floor-map.html?raw'

export default function FloorMapPage() {
  const host = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('flexdesk_token')
    const user = JSON.parse(sessionStorage.getItem('flexdesk_user') || 'null')
    if (!token || !user?.id) {
      const next = window.location.pathname + window.location.search + window.location.hash
      window.location.replace(`/login.html?next=${encodeURIComponent(next)}`)
      return undefined
    }

    const source = new DOMParser().parseFromString(floorMapHtml, 'text/html')
    const addedStyles = [...source.head.querySelectorAll('style')].map((original) => {
      const style = document.createElement('style')
      style.textContent = original.textContent
      document.head.append(style)
      return style
    })
    const scripts = [...source.querySelectorAll('script')]
    source.body.querySelectorAll('script').forEach((script) => script.remove())
    host.current.innerHTML = source.body.innerHTML

    let cancelled = false
    const addedScripts = []
    async function executeScripts() {
      for (const original of scripts) {
        if (cancelled) return
        const script = document.createElement('script')
        if (original.src) {
          script.src = new URL(original.getAttribute('src'), window.location.origin).href
          script.async = false
          const loaded = new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = () => reject(new Error(`Could not load ${original.getAttribute('src')}.`))
          })
          document.head.append(script)
          addedScripts.push(script)
          await loaded
        } else {
          script.textContent = original.textContent
          document.body.append(script)
          addedScripts.push(script)
        }
      }
    }
    executeScripts().catch((cause) => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : 'Unable to load the workspace map.')
    })

    return () => {
      cancelled = true
      addedScripts.forEach((script) => script.remove())
      addedStyles.forEach((style) => style.remove())
      if (host.current) host.current.replaceChildren()
    }
  }, [])

  return <><div ref={host} className="legacy-map-root" />{error && <p className="map-load-error" role="alert">{error}</p>}</>
}
