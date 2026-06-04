import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Booking from './pages/booking/Booking'
import About from './pages/About'
import Events from './pages/Events'
import BordReservasjon from './pages/booking/BordReservasjon'
import BookingCatering from './pages/booking/Catering'
import LukketSelskap from './pages/booking/LukketSelskap'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/ProtectedRoute'

function AppLayout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdmin && <Navbar />}
      <main className={!isAdmin ? 'min-h-screen' : undefined}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meny" element={<Menu />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/om-oss" element={<About />} />
          <Route path="/arrangementer" element={<Events />} />
          <Route path="/booking/bordreservasjon" element={<BordReservasjon />} />
          <Route path="/booking/catering" element={<BookingCatering />} />
          <Route path="/booking/lukket-selskap" element={<LukketSelskap />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
