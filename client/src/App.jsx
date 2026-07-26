import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing  from './pages/Landing'
import Upload   from './pages/Upload'
import Test     from './pages/Test'
import Results  from './pages/Results'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"                    element={<Landing />} />
        <Route path="/upload"              element={<Upload />} />
        <Route path="/test/:sessionId"     element={<Test />} />
        <Route path="/results/:sessionId"  element={<Results />} />
      </Routes>
    </Router>
  )
}
