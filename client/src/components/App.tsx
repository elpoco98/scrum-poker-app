import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SessionPage } from '../pages/SessionPage'

// Navigation with React Router (optional extension, see section 3.4).
// The session ID is part of the URL, so a session link can be shared.
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sessions/:sessionId" element={<SessionPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
