import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthProvider } from './context/AuthProvider'
import { DemoSessionProvider } from './context/DemoSessionContext'
import { AuthPage } from './pages/AuthPage'
import { BrowsePage } from './pages/BrowsePage'
import { DashboardPage } from './pages/DashboardPage'
import { DonatePage } from './pages/DonatePage'
import { LandingPage } from './pages/LandingPage'
import { MyDonationsPage } from './pages/MyDonationsPage'

function App() {
  return (
    <AuthProvider>
      <DemoSessionProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/my-donations" element={<MyDonationsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DemoSessionProvider>
    </AuthProvider>
  )
}

export default App
