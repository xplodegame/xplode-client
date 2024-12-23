// import React from 'react'
// import { 
//   BrowserRouter as Router, 
//   Route, 
//   Routes, 
//   Navigate 
// } from 'react-router-dom'
// import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
// import App from './App'
// import Home from './Home'
// import Play from './Play'

// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   return (
//     <>
//       <SignedIn>{children}</SignedIn>
//       <SignedOut>
//         <Navigate to="/" replace />
//       </SignedOut>
//     </>
//   )
// }

// const MainApp: React.FC = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<App />} />
//         {/* <Route 
//           path="/home" 
//           element={
//             <ProtectedRoute>
//               <Home />
//             </ProtectedRoute>
//           } 
//         /> */}
        
//         <Route 
//           path="/play" 
//           element={
//             <ProtectedRoute>
//               <UserButton />
//               <Play />
//             </ProtectedRoute>
//           } 
//         />
//       </Routes>
//     </Router>
//   )
// }

// export default MainApp

import React from 'react'
import { 
  BrowserRouter as Router, 
  Route, 
  Routes, 
  Navigate 
} from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import Navbar from './Navbar'
import App from './App'
// import Home from './Home'
import SingleplayerGame from './SingleplayerGame'
import MultiplayerGame from './MultiplayerGame'


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
      <div className="bg-gray-900 min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<App />} />
          <Route 
            path="/singleplayer" 
            element={
              <ProtectedRoute>
                <SingleplayerGame />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/multiplayer" 
            element={
              <ProtectedRoute>
                <MultiplayerGame />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default MainApp