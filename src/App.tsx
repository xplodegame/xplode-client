import { SignedOut, SignedIn } from '@clerk/clerk-react'
import Home from './pages/Home/Home'

export default function App() {
  return (
    <div className="bg-gray-900 min-h-screen">
      <SignedOut>
        <Home />
      </SignedOut>
      <SignedIn>
        <Home />
      </SignedIn>
    </div>
  )
}