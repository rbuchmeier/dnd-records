import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import ContinuousChronicle from './reading/ContinuousChronicle'

function NotFound() {
  useEffect(() => {
    document.title = 'Page not found · Campaign Chronicle'
  }, [])
  return (
    <main className="not-found" tabIndex={-1}>
      <h1>Page not found</h1>
      <Link to="/">Return to the Chronicle</Link>
    </main>
  )
}

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true })
  }, [pathname])
  return (
    <Routes>
      <Route path="/" element={<ContinuousChronicle />} />
      <Route path="/chronicle" element={<ContinuousChronicle />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
