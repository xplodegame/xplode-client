// // import { StrictMode } from 'react'
// // import { createRoot } from 'react-dom/client'
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
// // import App from './App.tsx'
// import Home from './Home.tsx'

// // createRoot(document.getElementById('root')!).render(
// //   <StrictMode>
// //     <Router>
// //       <Routes>
// //         <Route path="/" element={<App />} />
// //         <Route path="/home" element={<Home />} />
// //       </Routes>
// //     </Router>
// //   </StrictMode>,
// // )

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import MainApp from './MainApp'  // Updated from App

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <MainApp />
    </ClerkProvider>
  </React.StrictMode>
)