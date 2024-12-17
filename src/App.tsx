// import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/clerk-react'
// import { Link } from 'react-router-dom'
// import Home from './Home'

// export default function App() {
//   return (
//     <header>
//       <SignedOut>
//         <SignInButton />
//         <Home />
//       </SignedOut>
//       <SignedIn>
//         <UserButton />
//         <Home />
//         <nav>
//           <Link to="/play">play mines</Link>
//         </nav>
//       </SignedIn>
//     </header>
//   )
// }

import { SignedOut, SignedIn } from '@clerk/clerk-react'
import Navbar from './Navbar'
import Home from './Home'

export default function App() {
  return (
    <div className="bg-gray-900 min-h-screen">
      {/* <Navbar /> */}
      <SignedOut>
        <Home />
      </SignedOut>
      <SignedIn>
        <Home />
      </SignedIn>
    </div>
  )
}