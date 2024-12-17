import React from 'react'
import { 
  BrowserRouter as Router, 
  Route, 
  Routes, 
  Navigate 
} from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import App from './App'
import Home from './Home'
import Loda from './Loda'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/" replace />
      </SignedOut>
    </>
  )
}

const MainApp: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/loda" 
          element={
            <ProtectedRoute>
              <Loda />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

export default MainApp