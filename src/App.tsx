import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Booking from './pages/Booking'
import About from './pages/About'
import Events from './pages/Events'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meny" element={<Menu />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/om-oss" element={<About />} />
        <Route path="/arrangementer" element={<Events />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/login" element={<Login />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App