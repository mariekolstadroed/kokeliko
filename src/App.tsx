import { useEffect } from 'react'
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

const PUBLIC_ROUTES = [
  { path: '/', element: <Home /> },
  { path: '/meny', element: <Menu /> },
  { path: '/booking', element: <Booking /> },
  { path: '/booking/bordreservasjon', element: <BordReservasjon /> },
  { path: '/booking/catering', element: <BookingCatering /> },
  { path: '/booking/lukket-selskap', element: <LukketSelskap /> },
  { path: '/arrangementer', element: <Events /> },
  { path: '/om-oss', element: <About /> },
]

function AppLayout() {
  const location = useLocation()
  const path = location.pathname
  const isAdmin = path.startsWith('/admin')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {PUBLIC_ROUTES.map(({ path: routePath, element }) => (
          <div key={routePath} className={path === routePath ? '' : 'hidden'}>
            {element}
          </div>
        ))}
      </main>
      <Footer />
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
