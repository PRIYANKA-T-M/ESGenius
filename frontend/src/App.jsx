import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Environmental from './pages/Environmental'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/environmental" element={<Environmental />} />
        <Route path="*" element={<Navigate to="/environmental" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
